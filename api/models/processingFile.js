const mongoose = require('mongoose');

// Schema
// _id is the reference
const processingFileSchema = mongoose.Schema({

  _id: String,
  title: String,
  uploader: String,
  size: Number,
  storeName: String,
  serverName: String,
  serverAddress: String,
  progress: Number,
  fileType: String,
  ext: String,//extension

  video: {
    type: Object,
    default: null
  },

  uploadDate: {
    type: Number
  },

  protection: {
    type: Object,
    default: null
  },

  storageServer: {
    type: String,
    default: null
  },

  status: {
    type: Number,
    required: true,
    default: 0
  },

  error: {
    type: String,
    default: null
  }

});

const ProcessingFile = module.exports = mongoose.model('processingFile', processingFileSchema);

module.exports.getBy_id = function(_id) {return new Promise((resolve, reject) => {
  ProcessingFile.findById(_id, (err, doc)=>{
    if(err) return reject(err);
    return resolve(doc);
  });
})}

module.exports.query = function(username){

  const query = {uploader: username}

  return new Promise((resolve, reject) => {
    ProcessingFile.find(query)
    .sort([['uploadDate', -1]])
    .where('status').lt(3)
    .exec((err, doc)=>{
      if(err){
        console.log(err);
        resolve(false)
      }else{
        resolve(doc)
      }
    });
  });
}

module.exports.removeByReference = function(reference){
  return new Promise((resolve, reject) => {
    const query = {reference: reference}
    ProcessingFile.remove(query, (err)=>{
      if(err){
        console.log(err);             
        resolve(false)
      }else{
        resolve(true)
      }
    });
  });
}