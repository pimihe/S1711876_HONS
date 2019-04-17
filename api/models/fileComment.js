const mongoose = require('mongoose');

// Schema
const fileCommentSchema = mongoose.Schema({
  _id: String,
  username: String,
  fileRef: String,
  date: Date,
  comment: String,
  deleted:  {
    type: Boolean,
    required: false
  },
});

const FileComment = module.exports = mongoose.model('fileComment', fileCommentSchema);

module.exports.add = function(newFileComment) {return new Promise((resolve, reject) => {
  newFileComment.save((err, doc)=>{
    if(err) return reject(err);
    return resolve(doc);
  });
})}

module.exports.getBy_id = function(_id) {return new Promise((resolve, reject) => {
  FileComment.findById(_id, (err, doc)=>{
    if(err) return reject(err);
    return resolve(doc);
  });
})}

module.exports.removeBy_id = function(_id) {return new Promise((resolve, reject) => {
  FileComment.findByIdAndRemove(_id, (err, doc)=>{
    if(err) return reject(err);
    return resolve(doc);
  });
})}

module.exports.updateBy_id = function(_id,updateObj) {return new Promise((resolve, reject) => {
  FileComment.findByIdAndUpdate(_id, updateObj, (err, doc)=>{
    if(err) return reject(err);
    return resolve(doc);
  });
})}

module.exports.getByFileRef = function(ref, limit, skip) {return new Promise((resolve, reject) => {
  const query = { fileRef: ref }
  FileComment
  .find(query)
  .sort({date: -1})
  .skip(skip)
  .limit(limit)
  .exec((err, doc)=>{
    if(err) return reject(err);
    return resolve(doc);
  });
})}

// module.exports.getByUsernameAndFileRef = function(user, ref) {return new Promise((resolve, reject) => {
//   const query = {
//     username: user,
//     fileRef: ref
//   }
//   FileComment.findOne(query, (err, doc)=>{
//     if(err) return reject(err);
//     return resolve(doc);
//   });
// })}

module.exports.queryComments = function(fileRef, username, sort, limit, skip) {return new Promise((resolve, reject) => {

  let query = {}

  //fileRef query set
  if(fileRef) {
    query.fileRef = fileRef;
  }

  //username query set
  if(username) {
    query.username = username;
  }
  FileComment.find(query)
  .sort({date: sort})
  .skip(skip)
  .limit(limit)
  .exec((err, doc)=>{
    if(err) return reject(err);
    return resolve(doc);
  });
})}
