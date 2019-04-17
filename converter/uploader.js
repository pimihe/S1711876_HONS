const ProcessingFile   = require('./models/processingFile');
const StorageServer   = require('./models/storageServer');
const config           = require('./config/config');
const http             = require('http');
const request          = require('request');
const fs               = require('fs');

const serverName  = config.serverName;

let inProgress = false;

setInterval( async ()=>{
  if(inProgress) return;
  
  inProgress = true;
  
  let filesForUpload;
  try {
    filesForUpload = await ProcessingFile.getByServerAndStatus(serverName, 2)
  } catch (error) { 
    console.log(error)
    return inProgress = false;
  }
  if(!filesForUpload[0]) {
    return inProgress = false;
  }

  const file = filesForUpload[0];

  let storageServer;
  try {
    storageServer = await StorageServer.getWithSpaceForFile(Math.ceil((Math.ceil(file.size/4096)*4096)/1024/1024))
  } catch (error) {
    console.log(error)
    return inProgress = false;
  }
  if(!storageServer) {
    console.log('could not find server with space to take file');
    return inProgress = false;
  }

  const uploadAddress = storageServer.address;

  let uploadStatus;
  try {
    uploadStatus = await uploadFileToStorage(file, uploadAddress);
  } catch (error) {
    console.log(error);
    StorageServer.setLastFailTime(storageServer._id);
    return inProgress = false;
  }

  if(uploadStatus == 200) {
    console.log('file was uploaded ok');
    let uploadedZipExists = true;
    while (uploadedZipExists) {
      try {
        console.log('trying to delete file')
        const fileToDel = './protected/zips/'+file._id+'.zip';
        (fs.existsSync(fileToDel)) ? fs.unlinkSync(fileToDel) : null;
        await ProcessingFile.removeBy_id(file._id);
        console.log('uploaded zip was deleted');
        uploadedZipExists = false;
      } catch (error) {
        console.log(error);
        console.log('ERROR: failed to delete file that was uploaded');
      }
    }
  }else{
    console.log('file was not successfully uploaded');
  }

  return inProgress = false;
}, 1000);

function uploadFileToStorage(file, uploadAddress) { return new Promise( (resolve, reject)=>{

  const options = {
    url: uploadAddress,
    headers: {
      'fileRef': file._id,
      'Content-Length': fs.statSync('./protected/zips/'+file._id+'.zip').size
    }
  };

  let readStream = fs.createReadStream('./protected/zips/'+file._id+'.zip').pipe(
    request.post(options)
    .on('response', (response)=>{
      return resolve(response.statusCode);
    })
    .on('error', (err)=>{
      readStream.destroy();
      return reject(err);
    })
  )
})}