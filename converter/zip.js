const archiver = require('archiver');
const fs       = require('fs');

module.exports.archiveFiles = async (file)=>{return new Promise( async (resolve, reject)=>{

  let output = fs.createWriteStream('./protected/zips/'+file._id+'.zip');
  let archive = archiver('zip', {
    zlib: { level: 0 } // no compression used 
  });
  archive.on('warning', (err)=>{
    return reject(err);
  });
  archive.on('error', (err)=>{
    return reject(err);
  });
  archive.pipe(output);
  archive.directory("./protected/converted/", false);
  archive.finalize();
  output.on('close', ()=>{
    return resolve(true);
  });

})}