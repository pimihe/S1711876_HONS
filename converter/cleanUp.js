const fs               = require('fs');
const mongoose         = require('mongoose');
const ProcessingServer = require('./models/processingServer');
const ProcessingFile   = require('./models/processingFile');
const File             = require('./models/File');
const { URL }          = require('url');

const ffmpeg   = require('./ffmpeg');
const packager = require('./packager');
const zip      = require('./zip');
const utility  = require('./utility');

setInterval( async ()=>{
    // delete zips that have completed processing and been stored
    try {
      let completedFiles = await ProcessingFile.getByServerAndStatus(serverName, 3)
      completedFiles.forEach(async (file)=>{
        const fileToDel = './protected/zips/'+file._id+'.zip';
        (fs.existsSync(fileToDel)) ? fs.unlinkSync(fileToDel) : null;
        await ProcessingFile.removeBy_id(file._id);
      });
    } catch (error) { console.log(error) }

}, 1000);