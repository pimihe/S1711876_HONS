const mongoose = require('mongoose');

// Schema
const fileSchema = mongoose.Schema({
  _id: String,
  title: String,
  uploader: String,
  uploadDate: Date,
  description: String,

  likeCount: {
    type: Number,
    default: 0
  },
  dislikeCount: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  commentCount: {
    type: Number,
    default: 0
  },
  size: Number,

  protection: {
    type: Object,
    default: null
  },

  storageServerAddress: {
    type: String,
    required: true,
    default: null
  },

  storageServerName: {
    type: String,
    required: true,
    default: null
  },

  // video only 
  video: {
    type: Object,
  },
  
  activeThumb: {
    type: Number,
    required: true,
    default: 1
  },

  // image only extension
  imageType: {
    type: String
  },

  proccessing: {
    type: Boolean,
    required: true
  }

});

const File = module.exports = mongoose.model('file', fileSchema);

module.exports.findBy_id = function(_id) {return new Promise((resolve, reject) => {
  File.findById(_id, (err, doc)=>{
    if(err) return reject(err);
    return resolve(doc);
  });
})}

module.exports.updateBy_id = function(_id, fileUpdateObj) {return new Promise((resolve, reject) => {
  File.findByIdAndUpdate(_id, fileUpdateObj, (err, doc)=>{
    if(err) return reject(err);
    return resolve(doc);
  });
})}

module.exports.removeBy_id = function(_id) {return new Promise((resolve, reject) => {
  File.findByIdAndRemove(_id, (err, doc)=>{
    if(err) return reject(err);
    return resolve(doc);
  });
})}