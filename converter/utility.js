const fs               = require('fs');
const ProcessingServer = require('./models/processingServer');
const crypto           = require('crypto');
const Notification     = require('./models/notification');
const config           = require('./config/config');
const jwt              = require('jwt-simple');
const maxStorage       = config.maxStorage;// stores maximum storage of the server

// 4096 added to account for folder size on disk
module.exports.getUsedStorageMB = getUsedStorageMB

// update the remaining storage in db
module.exports.updateStorage = async (serverName)=>{
  try {
    await ProcessingServer.setRemainingStorageAndCurrentQueueBy_id(
      serverName, 
      (maxStorage-getUsedStorageMB()), 
      fs.readdirSync("./protected/files/").length
    )  
  } catch (error) { console.log(error); }
}

// delete stray files in converted folder 
module.exports.cleanUpConvertedFolder = ()=>{
  let convertedFiles = fs.readdirSync("./protected/converted/");
  for (let index = 0; index < convertedFiles.length; index++) {
    const file = convertedFiles[index];
    try {
      fs.unlinkSync("./protected/converted/"+file);
    } catch (error) { console.log(error) }
  }
}
module.exports.getRefString = (length)=>{
  const chars = 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890';
  let randString = '';
  for (let i = 0; i < length; i++) randString += chars[parseInt(Math.random()*62)];
  return(randString);
}

module.exports.authUser = (req)=>{ return new Promise(async (resolve, reject) => {

  if(req && req.headers && (typeof req.headers.auth == 'undefined' || !req.headers.auth)) return reject('No token provided');

  let decodedToken;
  try {
    decodedToken = jwt.decode(req.headers.auth, config.secret);
  } catch (error) { 
    return reject('Invalid login session'); 
  }
  if(decodedToken.expires < Date.now()) return reject('Login session has expired'); 

  // if no problem was found details are correct so return true
  return resolve(decodedToken.user);

})}



module.exports.addNotification = (username, type, msg)=>{
  const newNotification = new Notification({
    _id: getRefString(20),
    user: username,
    type: type,
    msg: msg,
    date: new Date()
  });
  try {
    Notification.add(newNotification)
  } catch (error) {console.log(error)}
}

function getUsedStorageMB() {
  let totalSize = 4096;
  let protectedDirs = fs.readdirSync("./protected/");
  for (let index = 0; index < protectedDirs.length; index++) {
    totalSize += 4096;
    const dir = protectedDirs[index];
    let files = fs.readdirSync("./protected/"+dir+"/");
    for (let index = 0; index < files.length; index++) {
      const fileSize = Math.ceil(fs.statSync("./protected/"+dir+"/"+files[index]).size/4096)*4096;
      totalSize += (fileSize > 0) ? fileSize : 4096;
    }
  }
  return Math.ceil(totalSize/1024/1024);
}