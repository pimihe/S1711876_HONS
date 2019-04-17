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

  // protection: {
  //   type: Object,
  //   default: null
  // },

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

module.exports.getBy_id = function(_id) {return new Promise((resolve, reject) => {
  File.findById(_id, (err, doc)=>{
    if(err) return reject(err);
    return resolve(doc);
  });
})}

module.exports.updateBy_idAndUploader = function(_id, uploader, updateObj) {return new Promise((resolve, reject) => {
  const query = {
    _id:_id,
    uploader:uploader
  }
  File.findOneAndUpdate(query, updateObj, (err, doc)=>{
    if(err) return reject(err);
    return resolve(doc);
  });
})}

module.exports.incLikeCountBy_id = function(_id) {return new Promise((resolve, reject) => {
  File.findByIdAndUpdate(_id, { $inc: { likeCount: 1 } }, {new: true }, (err, doc)=>{
    if(err) return reject(err);
    return resolve(doc);
  });
})}

module.exports.incDislikeCountBy_id = function(_id) {return new Promise((resolve, reject) => {
  File.findByIdAndUpdate(_id, { $inc: { dislikeCount: 1 } }, {new: true }, (err, doc)=>{
    if(err) return reject(err);
    return resolve(doc);
  });
})}

module.exports.decLikeCountBy_id = function(_id) {return new Promise((resolve, reject) => {
  File.findByIdAndUpdate(_id, { $inc: { likeCount: -1 } }, {new: true }, (err, doc)=>{
    if(err) return reject(err);
    return resolve(doc);
  });
})}

module.exports.decDislikeCountBy_id = function(_id) {return new Promise((resolve, reject) => {
  File.findByIdAndUpdate(_id, { $inc: { dislikeCount: -1 } }, {new: true }, (err, doc)=>{
    if(err) return reject(err);
    return resolve(doc);
  });
})}

module.exports.incViewsBy_id = function(_id) {return new Promise((resolve, reject) => {
  File.findByIdAndUpdate(_id, { $inc: { views: 1 } }, {new: true }, (err, doc)=>{
    if(err) return reject(err);
    return resolve(doc);
  });
})}

module.exports.incCommentCountBy_id = function(_id) {return new Promise((resolve, reject) => {
  File.findByIdAndUpdate(_id, { $inc: { commentCount: 1 } }, {new: true }, (err, doc)=>{
    if(err) return reject(err);
    return resolve(doc);
  });
})}

module.exports.queryFiles = function(searchStr, fileType, uploader, sort, limit, skip) {return new Promise((resolve, reject) => {

  let query = {proccessing:{ $ne: true }}

  // search string to match title 
  if(searchStr){
    searchStr.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    const re = new RegExp(searchStr);
    query.title = re;
  }

  //type search
  if(fileType == 'video'){
    query.video = { $ne: null };
  }else if(fileType == 'image'){
    query.video = null ;
  }

  //uploader query set
  if(uploader) {
    query.uploader = uploader;
  }

  File.find(query)
  .skip(skip)
  .limit(limit)
  .sort([['uploadDate', sort]])// sort by date -1=descending 1=ascending
  .exec((err, doc)=>{
    if(err) return reject(err);
    return resolve(doc);
  });

})}

module.exports.getRandomFiles = function(fileType,limit){return new Promise((resolve, reject) => {

  let query = {proccessing:{ $ne: true }};
  //type search
  if(fileType == 'video'){
    query.video = { $ne: null };
  }else if(fileType == 'image'){
    query.video = null ;
  }


  File.aggregate([
    {
      $match: query
    },
    {
      $sample: {size:limit}
    }
  ]).exec((err, doc)=>{
    if(err) return reject(err);
    return resolve(doc);
  });


})}