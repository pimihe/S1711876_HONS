const fs               = require('fs');
const config           = require('./config/config');
const ProcessingFile   = require('./models/processingFile');
const File             = require('./models/File');
const express          = require('express');
require('express-async-errors');
const cors             = require('cors');
const multer           = require('multer');
const { URL }          = require('url');
const address          = config.address
const serverUrl        = new URL(address);
const app              = express();

const utility = require('./utility');
const ffprobe = require('./ffprobe');
const ffmpeg  = require('./ffmpeg');

const maxStorage  = config.maxStorage;// stores maximum storage of the server
const maxQueue    = config.maxQueue;// stores maximum queue size of server
const serverName  = config.serverName;
const maxFileSize = config.maxFileSize;

app.use(cors());

app.post('/', async (req, res) => {
  
  // check users token 
  let user;
  try { user = await utility.authUser(req) } catch (error) { return res.status(401).json({msg: error}) }

  // try and get server used space
  let usedStorage;
  try {
    usedStorage = utility.getUsedStorageMB();
  } catch (error) {
    console.log(error)
    return res.status(500).json({msg:"Server get storage error"});
  }

  // return storage err if not enoguh space
  if(usedStorage + maxFileSize >= maxStorage || fs.readdirSync("./protected/files/").length >= maxQueue) return res.status(500).json({msg:"Server storage error"});

  // set upload params 
  let upload = multer({
    dest: './protected/files',
    limits: { 
      fileSize: 1024*1024*1024,/*1GB*/ 
      parts: 4
    }
  }).single('file');

  //check upload
  try {
    uploadStatus = await new Promise((resolve, reject) => {upload(req, res, (err)=>{
      if (err) return reject(err);
      return resolve(true);
    })});
  } catch (error) {
    console.log(error)
    return res.status(500).json({msg:"Server error when storing file"});
  }

  // check there is a file in request
  if(!req.file) return res.status(400).json({msg:"Missing file"});
  
  utility.updateStorage(serverName);
  
  // try and get file details
  let fileDetailsObj;
  try {
    fileDetailsObj = await ffprobe.getFileDetailsObj("./protected/files/" + req.file.filename);
  } catch (error) {
    try {
      fs.unlinkSync('./protected/files/'+req.file.filename);
    } catch (error) {
      console.log(error)
    }
    console.log(error)
    return res.status(400).json({msg:"File type not supported"});
  }

  // if the file is not a video this will be left null othrwise duration and fps get set here
  let videoDetails;
  if(fileDetailsObj.type == "video"){
    let ffmpegFps;
    try {
      ffmpegFps = await ffmpeg.getVidFps("./protected/files/" + req.file.filename);
    } catch (error) {
      fs.unlinkSync('./protected/files/'+req.file.filename);
      console.log(error)
      return res.status(400).json({msg:"Failed to get file framerate"});
    }
    if(ffmpegFps != fileDetailsObj.fps) {
      console.log('warning ffmpeg and ffprobe fps do not match. ffmpeg:'+ffmpegFps+'. ffprobe:'+fileDetailsObj.fps+'. ffmpegfps will be used.');
      fileDetailsObj.fps = ffmpegFps;
    }
    videoDetails = {
      audio: fileDetailsObj.audio,
      duration: fileDetailsObj.duration,
      qualities: null,
      thumbCount: null,
      fps:fileDetailsObj.fps
    }
  }

  const fileId = utility.getRefString(20);

  let newProcessingFile = new ProcessingFile({
    _id: fileId,
    uploader: user.username,
    size: req.file.size,
    storeName: req.file.filename,
    serverName: serverName,
    serverAddress: address,
    progress: 0,
    fileType: fileDetailsObj.type,
    title: req.body.title,
    video:videoDetails,
    uploadDate: new Date(),
    format: fileDetailsObj.format,
    width:fileDetailsObj.width,
    height:fileDetailsObj.height
  });

  // add record for new file to db
  let newProcessingFileDoc;
  try {
    newProcessingFileDoc = await ProcessingFile.add(newProcessingFile);    
  } catch (error) {
    fs.unlinkSync('./protected/files/'+req.file.filename);
    console.log(error)
    return res.status(400).json({msg:"Server proccessing file creation error"});
  }

  let newFile = new File({
    _id: fileId,
    uploader: user.username,
    title: req.body.title
  });
  
  // add record for new file to db
  let newFileDoc;
  try {
    newFileDoc = await File.add(newFile);    
  } catch (error) {
    ProcessingFile.removeBy_id(fileId);
    fs.unlinkSync('./protected/files/'+req.file.filename);
    console.log(error)
    return res.status(400).json({msg:"Server file creation error"});
  }

  utility.updateStorage(serverName);

  newProcessingFileDoc = newProcessingFileDoc.toObject();
  newProcessingFileDoc.reference = newProcessingFileDoc._id;
  delete newProcessingFileDoc._id;
  delete newProcessingFileDoc.__v;

  return res.status(201).json({data:newProcessingFileDoc});
});

app.get("*", function(req, res) {
  res.status(401).json({msg:'Unauthorized.'});
});

app.listen(serverUrl.port, () => {
  console.log('Server started on port ' + serverUrl.port);
});