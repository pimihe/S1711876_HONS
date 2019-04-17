const mongoose = require('mongoose');
const config = require('../config/config');

// Schema
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

module.exports.setStatusAndErrorBy_id = function(_id, status, error) {return new Promise((resolve, reject) => {
  ProcessingFile.findByIdAndUpdate(_id, {status:status, error: error},(err, doc)=>{
    if(err) return reject(err);
    return resolve(doc);
  });
})}