// used to create the folders required by the server. not required but helps guarantee setup  directories are named correctly
const fs = require('fs');

try {
  if(!fs.existsSync(__dirname+'/protected')) fs.mkdirSync(__dirname+'/protected')
  if(!fs.existsSync(__dirname+'/protected/dl')) fs.mkdirSync(__dirname+'/protected/dl')
  if(!fs.existsSync(__dirname+'/protected/file')) fs.mkdirSync(__dirname+'/protected/file')
  if(!fs.existsSync(__dirname+'/protected/profile-picture')) fs.mkdirSync(__dirname+'/protected/profile-picture')
} catch (error) {
  process.exit(1)
}