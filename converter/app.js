const fs               = require('fs');
const mongoose         = require('mongoose');
const config           = require('./config/config');
const ProcessingServer = require('./models/processingServer');
const ProcessingFile   = require('./models/processingFile');
const File             = require('./models/File');
const { URL }          = require('url');
const address          = config.address

const ffmpeg   = require('./ffmpeg');
const packager = require('./packager');
const zip      = require('./zip');
const utility  = require('./utility');

mongoose.connect(config.database.url,config.database.options);
mongoose.connection.on('connected', () => {
  console.log('Connected to database ' + config.database.url);
});
mongoose.connection.on('error', (err) => {
  console.log('Database error: ' + err);
  process.exit();
});

require('./init');
require('./server');
require('./uploader');

let inProgress = false; // var used to check if server is currently processing file or not
const serverName = config.serverName;

let lastTimeCheck;//var used to check certain amount of time has passed to check server is still listed in db

utility.updateStorage(serverName);

setInterval( async ()=>{

  if(inProgress) return; // if not in progress
  inProgress = true;
  
  // delete zips that have completed processing and been stored
  try {
    let completedFiles = await ProcessingFile.getByServerAndStatus(serverName, 3)
    completedFiles.forEach(async (file)=>{
      const fileToDel = './protected/zips/'+file._id+'.zip';
      (fs.existsSync(fileToDel)) ? fs.unlinkSync(fileToDel) : null;
      await ProcessingFile.removeBy_id(file._id);
    });
  } catch (error) { console.log(error) }

  const currentTime = Date.now();
  if(lastTimeCheck+4000 < currentTime || !lastTimeCheck){ // every 4 seconds check db connection
    let server;
    try {
      server = await ProcessingServer.getByAddress(config.address);
    } catch (error) {
      console.log('ERROR: couldnt get server')
      console.log(error)
      return inProgress = false;
    }
    if(!server){
      console.log('ERROR: couldnt find server in db')
      return inProgress = false;
    }
    lastTimeCheck = currentTime;
  }
  
  utility.cleanUpConvertedFolder();

  let filesToBeProcessed, file;
  try {
    filesToBeProcessed = await ProcessingFile.getByServerAndStatus(serverName, 0);
    if(filesToBeProcessed.length > 0) file = filesToBeProcessed[0];
  } catch (error) { console.log(error) }
  if(file && fs.existsSync('./protected/files/' + file.storeName)) { // found file to be processed in db that exists in ./files
    console.log('file to be processed at : ' + Date.now().toString().slice(0, -3))
    try {
      await ProcessingFile.setStatusAndErrorBy_id(file._id, 1, null);
      return processFile(file);
    } catch (error) {
      console.log(error);
      return inProgress = false;
    }
  }else if (file && !fs.existsSync('./protected/files/' + file.storeName)) { // found file to be processed in db that doesnt exists in ./files
    console.log('found file to be processed that doesnt exist at : ' + Date.now().toString().slice(0, -3), file);
    utility.addNotification(file.uploader, 'procFileErr', 'The file:'+ file.title +' was not found for processing');
  }else{ console.log('no files to be processed at : ' + Date.now().toString().slice(0, -3)) }

  inProgress = false; // only reeached if nothing to be processed
}, 1000);

async function processFile(file) {

  const filePath = "./protected/files/" + file.storeName;

  //before files are archived get thumb count and available qualities
  let qualArr = [];
  let thumbCount = 0;
  
  // if file is video
  if(file.video){

    try {
      await ffmpeg.convertVideo(file);
    } catch (error) { return handleError(error, file, 'The file:'+ file.title +' could not be converted.') }

    const convertedFiles = fs.readdirSync('./protected/converted/');
    for (let index = 0; index < convertedFiles.length; index++) {
      const fileName = convertedFiles[index];
      if(fileName.substring(fileName.length-3) == 'jpg') thumbCount++;
      if(fileName != "audio.mp4" && fileName.substring(fileName.length-3) == 'mp4') qualArr.push(fileName.slice(0, -4));
      if(fileName.substring(0,17) == "packager-tempfile"){
        if(fs.existsSync("./protected/converted/"+fileName)) fs.unlinkSync("./protected/converted/"+fileName);
      }
    }
    
    try {
      await packager.createManifests(file)
    } catch (error) { return handleError(error, file, 'The file:'+ file.title +' could not be packaged after conversion. This is likely a server error.') }

  }else{ // image processing below

    try {
      await ffmpeg.convertImage(file);
    } catch (error) { return handleError(error, file, 'The file:'+ file.title +' could not be converted.') }

  }

  // save file obj to json
  try {
    if(file.fileType == 'video'){
      file.video = {
        duration: file.video.duration,
        qualities: qualArr,
        thumbCount: thumbCount,
        fps:file.video.fps
      }
    }
    fs.writeFileSync('./protected/converted/file.json', JSON.stringify(file), 'utf8');
  } catch (error) { return handleError(error, file, 'The file:'+ file.title +' had issues while archiving. This is likely a server error.') }

  // try and archive folder
  try {
    await zip.archiveFiles(file)
  } catch (error) { return handleError(error, file, 'The file:'+ file.title +' could not be archived after conversion. This is likely a server error.') }

  fileSize = fs.statSync('./protected/zips/'+file._id+'.zip').size;

  //inProgress = false;
  try {
    await ProcessingFile.setStatusSizeVideoBy_id(file._id, 2, fileSize, file.video);
  } catch (error) { return handleError(error, file, 'The file:'+ file.title +' could not be updated at the end of conversion. This is likely a server error.') }
  
  if(fs.existsSync(filePath)){fs.unlinkSync(filePath)}

  utility.cleanUpConvertedFolder();

  // update server capacity
  try {
    await utility.updateStorage(serverName)
  } catch(e){console.log(e)}

  console.log('processing complete');
  inProgress = false;
}

async function handleError(error, file, notificationText){
  console.log(error);
  const filePath = "./protected/files/" + file.storeName;
  const zipPath  = "./protected/zips/" + file._id + ".zip";
  if(fs.existsSync(filePath)){fs.unlinkSync(filePath)}
  if(fs.existsSync(zipPath)){fs.unlinkSync(zipPath)}
  ProcessingFile.removeBy_id(file._id);
  File.removeBy_id(file._id);
  try {
    await utility.addNotification(file.uploader, 'procFileErr', notificationText);
  } catch (e) { console.log(e) }
  inProgress = false;
}