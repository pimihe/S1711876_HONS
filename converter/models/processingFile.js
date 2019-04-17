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
  width: Number,
  height: Number,
  fileType: String,
  format: String,

  video: {
    type: Object,
    default: null
  },

  uploadDate: Date,

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

module.exports.add = function(newProcessingFile) {return new Promise((resolve, reject) => {
  newProcessingFile.save((err, doc)=>{
    if(err) return reject(err);
    return resolve(doc);
  });
})}

module.exports.setStatusAndErrorBy_id = function(_id, status, error) {return new Promise((resolve, reject) => {
  ProcessingFile.findByIdAndUpdate(_id, {status:status, error: error},(err, doc)=>{
    if(err) return reject(err);
    return resolve(doc);
  });
})}

module.exports.getByServerAndStatus = function(server, status) {return new Promise((resolve, reject) => {
  const query = {serverName: server, status: status}
  ProcessingFile.find(query, (err, doc)=>{
    if(err) return reject(err);
    return resolve(doc);
  });
})}

module.exports.setStatusSizeVideoBy_id = function(_id, status, size, video) {return new Promise((resolve, reject) => {
  ProcessingFile.findByIdAndUpdate(_id, {status:status, size:size, video:video, progress: 100}, (err, doc)=>{
    if(err) return reject(err);
    return resolve(doc);
  });
})}

module.exports.setProgressBy_id = function(_id, progress) {return new Promise((resolve, reject) => {
  ProcessingFile.findByIdAndUpdate(_id, {progress:progress}, (err, doc)=>{
    if(err) return reject(err);
    return resolve(doc);
  });
})}

module.exports.removeBy_id = function(_id) {return new Promise((resolve, reject) => {
  const query = {_id: _id}
  ProcessingFile.remove(query, (err)=>{
    if(err) return reject(err);
    return resolve(true);
  });
})}