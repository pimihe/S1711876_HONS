const mongoose = require('mongoose');

// Schema
let fileViewSchema = mongoose.Schema({
  ip: String,
  file_id: String,
  createdAt: { 
    type: Date, 
    expires: 60, 
    default: Date.now 
  }
});

const FileView = module.exports = mongoose.model('fileView', fileViewSchema);

module.exports.add = function(newFileView){return new Promise((resolve, reject) => {

  newFileView.save((err, doc)=>{
    if(err){
      reject(err)
    }else{
      resolve(doc)
    }
  });

});}

module.exports.getByIpAndFile_id = function(ip,file_id){
  return new Promise((resolve, reject) => {
    const query = {ip:ip,file_id: file_id}
    FileView.findOne(query, (err, doc)=>{
      if(err){
        reject(err)
      }else{
        resolve(doc)
      }
    });
  });
}
