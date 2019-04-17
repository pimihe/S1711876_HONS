const express          = require('express');
const config           = require('./config/config');
require('express-async-errors');
require('./init');
const { URL }          = require('url');
const cors             = require('cors');
const path             = require('path');
const app              = express();
const fs               = require('fs');
const extract          = require('extract-zip');
const ProcessingFile   = require('./models/processingFile');
const mongoose         = require('mongoose');
const rimraf           = require('rimraf');
const File             = require('./models/file');
const Follower         = require('./models/follower');
const User             = require('./models/user');
const Notification     = require('./models/notification');
const jwt              = require('jwt-simple');
const utility          = require('./config/utility');
const readChunk        = require('read-chunk');
const isJpg            = require('is-jpg');
const StorageServer    = require('./models/storageServer');
const serverName       = config.serverName;
const maxStorage       = config.maxStorage;
const address          = config.address;
const serverUrl        = new URL(address);

let currDlSize = 0;

mongoose.connect(config.database.url,config.database.options);
mongoose.connection.on('connected', () => {
  console.log('Connected to database ' + config.database.url);
});
mongoose.connection.on('error', (err) => {
  console.log('Database error: ' + err);
  process.exit();
});

// CORS Middleware
app.use(cors());

app.set('case sensitive routing', true);

app.post('/', async (req, res, next)=>{

  // file currDlSize to keep track of remaining space
  const expectedSize = parseInt(req.headers["content-length"]);
  currDlSize += expectedSize;

  updateStorage();

  //creates folders needed to store file if they dont exist yet
  const fileRef = req.headers.fileref;
  const dirSubFolder = fileRef.substring(0,3);
  const extractPath = __dirname+'/protected/file/'+dirSubFolder+'/'+fileRef;
  if (!fs.existsSync('./protected/file/'+dirSubFolder)) {//create sub folder if not exist
    fs.mkdirSync('./protected/file/'+dirSubFolder);
  }
  if (!fs.existsSync(extractPath)) {//create store folder if not exist
    fs.mkdirSync(extractPath);
  }

  dlDir = "./protected/dl/" + fileRef;
  fs.mkdirSync(dlDir)
  const zipPath = dlDir + '/' + fileRef + '.zip'
  let fileStream = fs.createWriteStream(zipPath);

  req.pipe(fileStream)

  // wait for request to stop piping to filestream
  let reqFinish = new Promise((resolve, reject)=>{req.on('end', ()=>{ return resolve() })})
  let streamFinish = new Promise((resolve, reject)=>{fileStream.on('finish', ()=>{ return resolve() })})
  await Promise.all([streamFinish, reqFinish]);

  if(fs.statSync(zipPath).size != expectedSize) {
    currDlSize -= expectedSize;
    return await handleError(res, fileRef, 'File incorrect size') 
  }

  // try to extract file and read json file containing file details then delete json file
  let procFile;
  try {
    await extractZip(zipPath, extractPath);
    procFile = JSON.parse(fs.readFileSync(extractPath + "/file.json"));
    fs.unlinkSync(zipPath);
    fs.rmdirSync(dlDir);
    fs.unlinkSync(extractPath + "/file.json");
  } catch (error) { 
    currDlSize -= expectedSize;
    return await handleError(res, fileRef, error) 
  }
  
  currDlSize -= expectedSize;

  let fileUpdateObj = {
    title: procFile.title,// remove extension
    uploader: procFile.uploader,
    uploadDate: procFile.uploadDate,
    duration: procFile.duration,
    reference: procFile.reference,
    size: procFile.size,
    protection: procFile.protection,
    storageServerAddress: serverUrl,
    storageServerName: serverName,
    proccessing: false
  };

  if(procFile.video){
    fileUpdateObj.video = procFile.video;
  }else{
    fileUpdateObj.imageType = (procFile.format == "gif") ? 'gif' : 'jpg';
  }

  const newNotification = new Notification({
    user: procFile.uploader,
    type: 'procFileSuc',
    msg: 'File: ' + procFile.title + ' completed processing',
    _id: utility.getRefString(20),
    date: Math.round(new Date().getTime()),
    link: "view/"+procFile._id
  });

  // add record for new video to db and update proc file
  try {
    await Promise.all([Notification.add(newNotification), File.updateBy_id(procFile._id ,fileUpdateObj), ProcessingFile.setStatusAndErrorBy_id(fileRef, 3, null)]);
  } catch (error) { return await handleError(res, fileRef, error) }

  User.incUploadCountByUsername(procFile.uploader);

  updateStorage();
  res.status(200);
  res.send();
  
  updateFollowerNotifications(procFile.uploader, procFile);
  
});

app.delete('/file/:reference', async (req, res, next)=>{
  //TODO: check this si the right server to stop loose files being left around
  let user;
  try {
    user = await utility.authUser(req);
  } catch (error) { return res.status(401).json({msg: error}) }

  let fileToDelObj;
  try {
    fileToDelObj = await File.findBy_id(req.params.reference);  
  } catch (error) {
    console.log(error);
    return res.status(500).json({msg:'Server error'});
  }

  if(!fileToDelObj) return res.status(404).json({msg:"File doesn't exist"});

  if(user.username != fileToDelObj.uploader) return res.status(401).json({msg:"Unauthorized"});

  let removedObj;
  try {
    removedObj = await File.removeBy_id(req.params.reference);
  } catch (error) {
    console.log(error);
    return res.status(500).json({msg:'File deleted'});
  }
  if(!removedObj) return res.status(404).json({msg:'File was not found'});

  const ref = req.params.reference;
  let fileDir = './protected/file/'+ref.substr(0,3)+'/'+ref;

  if(!fs.existsSync(fileDir)) return res.status(404).json({msg:'File does not exist'});
  
  User.decUploadCountByUsername(procFile.uploader);

  return res.status(200).json({msg:'File deleted'});
})

app.get('/file/:reference/:file', (req, res, next)=>{

  const ref = req.params.reference;
  const file = req.params.file;

  if (!fs.existsSync("./protected/file/"+ref.substr(0,3)+"/"+ref)) return res.status(404).json({'msg':'file not found'});

  if(file.slice(-3) == "jpg" || file.slice(-3) == "gif") {
    const filePath = __dirname+"/protected/file/"+ref.substr(0,3)+"/"+ref+"/"+file;
    if(fs.existsSync(filePath)) return res.sendFile(filePath);
  }

  if((file == "mpd" || file == "m3u8") && fs.existsSync(__dirname+"/protected/file/"+ref.substr(0,3)+"/"+ref+"/mnfst_240."+file)) {
    if(fs.existsSync(__dirname+"/protected/file/"+ref.substr(0,3)+"/"+ref+"/mnfst_1080."+file)) return res.sendFile(__dirname+"/protected/file/"+ref.substr(0,3)+"/"+ref+"/mnfst_1080."+file);
    if(fs.existsSync(__dirname+"/protected/file/"+ref.substr(0,3)+"/"+ref+"/mnfst_720."+file)) return res.sendFile(__dirname+"/protected/file/"+ref.substr(0,3)+"/"+ref+"/mnfst_720."+file);
    if(fs.existsSync(__dirname+"/protected/file/"+ref.substr(0,3)+"/"+ref+"/mnfst_480."+file)) return res.sendFile(__dirname+"/protected/file/"+ref.substr(0,3)+"/"+ref+"/mnfst_480."+file);
    return res.sendFile(__dirname+"/protected/file/"+ref.substr(0,3)+"/"+ref+"/mnfst_240."+file);
  }

  // if requesting audio
  if(file == "audio.mp4") return res.sendFile(__dirname+"/protected/file/"+ref.substr(0,3)+"/"+ref+"/audio.mp4");

  // if requesting 240p file no auth needed just send it
  if(file == "240.mp4") return res.sendFile(__dirname+"/protected/file/"+ref.substr(0,3)+"/"+ref+"/240.mp4");
  if(file == "480.mp4") return res.sendFile(__dirname+"/protected/file/"+ref.substr(0,3)+"/"+ref+"/480.mp4");
  if(file == "720.mp4") return res.sendFile(__dirname+"/protected/file/"+ref.substr(0,3)+"/"+ref+"/720.mp4");
  if(file == "1080.mp4") return res.sendFile(__dirname+"/protected/file/"+ref.substr(0,3)+"/"+ref+"/1080.mp4");
    
  return res.status(404).json({'msg':'file not found or unauthorized'}).end();
});

app.get('/profile-picture/:file', (req, res, next)=>{
  const path = __dirname+"/protected/profile-picture/"+req.params.file.substr(0,3)+"/"+req.params.file;
  if(fs.existsSync(path)) return res.sendFile(path);
  return res.status(404).json({'msg':'file not found'}).end();
});

app.delete('/profile-picture', async (req, res, next)=>{
  // auth user
  let user;
  try {
    user = await utility.authUser(req);
  } catch (error) { return res.status(401).json({msg: error}) }

  // get user obj from db and check this is right server 
  let userPathGetObj;
  try {
    userPathGetObj = await User.getByUsername(user.username);
  } catch (error) { return res.status(500).json({msg:"Error when getting user"}); }
  if(!userPathGetObj) return res.status(404).json({msg:"Couldn't find user"});
  if(!userPathGetObj.profilePicturePath)return res.status(404).json({msg:"No profile image"});
  const splitStr = userPathGetObj.profilePicturePath.split('/profile-picture/');
  const fileRef = splitStr[1].slice(0,-4);
  if(!userPathGetObj.profilePicturePath) return res.status(200).json({msg:"No profile image set"});
  if(config.address != splitStr[0]) return res.status(400).json({msg:"Wrong server"});

  try {
    await User.updateProfilePicturePathByUsername(user.username,null);
  } catch (error) {
    console.log(error)
    return res.status(500).json({msg:"Server error couldnt delete profile image"});
  }
  const path = __dirname+"/protected/profile-picture/"+fileRef.substr(0,3)+"/"+splitStr[1];
  if(fs.existsSync(path)) fs.unlink(path,()=>{updateStorage()})
  
  return res.status(200).json({msg: "Profile image deleted"})

});

// attempt at profile picture implementation not used anywhere in project.
app.put('/profile-picture', async (req, res, next)=>{

  let user;
  try {
    user = await utility.authUser(req);
  } catch (error) { return res.status(401).json({msg: error}) }

  // check to see if user already has profile pic and stop if they do
  let userPathGetObj;
  try {
    userPathGetObj = await User.getByUsername(user.username);
  } catch (error) { return res.status(500).json({msg:"Error when getting user"}); }
  if(!userPathGetObj) return res.status(404).json({msg:"Couldn't find user"});
  if(userPathGetObj.profilePicturePath) return res.status(409).json({msg:"Existing profile image"});
  
  // create dir for file and save 
  const fileRef = utility.getRefString(20);
  const dirSubFolder = fileRef.substring(0,3);
  const path = "protected/profile-picture/"+dirSubFolder+"/"+fileRef+".jpg";
  if (!fs.existsSync('./protected/profile-picture/'+dirSubFolder)) {//create sub folder if not exist
    fs.mkdirSync('./protected/profile-picture/'+dirSubFolder);
  }
  let fileStream = fs.createWriteStream(path);
  req.pipe(fileStream)

  try {
    await new Promise((resolve, reject)=>{
      let fileSize = 0;
      req.on('data', (data)=>{ 
        fileSize += data.length;
        if(fileSize>81920) return reject(fileSize);
      })
      fileStream.on('finish', ()=>{ return resolve() })
    })
  } catch (error) {
    fs.unlink(path,()=>{updateStorage()})
    console.log(error)
    return res.status(500).json({msg:"Error when saving profile image"});
  }

  
  const buffer = readChunk.sync(path, 0, 3);
  if(!isJpg(buffer)) return res.status(500).json({msg:"Error reading image"});;

  let updateResDoc;
  try {
    updateResDoc = await User.updateProfilePicturePathByUsername(user.username,config.address+"/profile-picture/"+fileRef+".jpg");
  } catch (error) {
    fs.unlink(path,()=>{updateStorage()})
    console.log(error)
    return res.status(500).json({msg:"Error when saving profile image"});
  }

  res.status(200).json({data: config.address+"/profile-picture/"+fileRef+".jpg"});
  updateStorage()
});

// Start Server
app.listen(serverUrl.port, () => {
  console.log('Server started');
});

function extractZip(zipPath, extractPath) {return new Promise((resolve, reject) => {
  extract(zipPath, {dir: extractPath}, (err)=>{
    if(!err){
      return resolve(true)
    }else{//couldnt extract below here
      return reject(err)
    }
  });
})}

function handleError(res, reference, error) { return new Promise((resolve, reject)=>{
  console.log(error)
  updateStorage()

  let dlDir = "./protected/dl/" + reference;
  let storeDir = "./protected/file/" + reference.substring(0,3) + "/" + reference;

  // try and delete zip file and remove dl dir
  if(fs.existsSync(dlDir + "/" + reference + ".zip")) try { fs.rmdirSync(dlDir + "/" + reference + ".zip") } catch (e) { console.log(e) };
  if(fs.existsSync(dlDir)) try { fs.rmdirSync(dlDir) } catch (e) { console.log(e) };

  // clean up files left in the storage dir
  let files = [];
  if(fs.existsSync(storeDir)) files = fs.readdirSync(storeDir);
  for (let index = 0; index < files.length; index++) {
    const file = files[index];
    if(fs.existsSync(storeDir + "/" + file)){
      try {
        fs.unlinkSync(storeDir + "/" + file)
      } catch (e) {console.log(e)}
    }
  }
  // try and remove storage dir
  if(fs.existsSync(storeDir)) try { fs.rmdirSync(storeDir) } catch (e) { console.log(e) };
  
  return resolve(res.status(400).send());
})}

async function updateFollowerNotifications(followee, procFile) {
  let followers;
  try {
    followers = await Follower.getFollowersByFollowee(followee)
  } catch (error) {
    console.log(error)
  }

  for (let index = 0; index < followers.length; index++) {
    const newNotification = new Notification({
      user: followers[index].follower,
      type: 'newUpload',
      msg: followers[index].followee + ' has uploaded ' + procFile.title,
      _id: utility.getRefString(20),
      date: new Date(),
      link: "view/"+procFile._id
    });
    // TODO convert to bulk insert
    Notification.add(newNotification);
  }
} 

updateStorage = async ()=>{
  try {
    await StorageServer.setRemainingStorageBy_id(
      serverName, 
      (maxStorage-getUsedStorageSpaceMB()-currDlSize)
    )  
  } catch (error) { console.log(error); }
}

// get used space in bytes BEING USED ON DISK BY FILES
function getUsedStorageSpaceMB(){
  let totalSize = 4096;
  let filedDirs = fs.readdirSync("./protected/file");
  for (let i = 0; i < filedDirs.length; i++) {
    totalSize += 4096;
    const secondaryDirs = fs.readdirSync("./protected/file/"+filedDirs[i]+"/");
    for (let j = 0; j < secondaryDirs.length; j++) {
      totalSize += 4096;
      const files = fs.readdirSync("./protected/file/"+filedDirs[i]+"/"+secondaryDirs[j]);
      for (let k = 0; k < files.length; k++) {
        totalSize += Math.ceil(fs.statSync("./protected/file/"+filedDirs[i]+"/"+secondaryDirs[j]+"/"+files[k]).size/4096)*4096;
      }
    }
  }
  return Math.ceil(totalSize/1024/1024);
}