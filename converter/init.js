// used to create the folders required by the server. not required but helps guarantee setup  directories are named correctly
const fs = require('fs');

try {
  if(!fs.existsSync(__dirname+'/protected')) fs.mkdirSync(__dirname+'/protected')
  if(!fs.existsSync(__dirname+'/protected/converted')) fs.mkdirSync(__dirname+'/protected/converted')
  if(!fs.existsSync(__dirname+'/protected/files')) fs.mkdirSync(__dirname+'/protected/files')
  if(!fs.existsSync(__dirname+'/protected/zips')) fs.mkdirSync(__dirname+'/protected/zips')
} catch (error) {
  process.exit(1)
}