const mongoose = require('mongoose');

// Schema
const fileRatingSchema = mongoose.Schema({
  _id: String,
  username: String,
  fileRef: String,
  rating: Boolean,
});

const FileRating = module.exports = mongoose.model('fileRating', fileRatingSchema);

module.exports.add = function(newFileRating) {return new Promise((resolve, reject) => {
  newFileRating.save((err, doc)=>{
    if(err) return reject(err);
    return resolve(doc);
  });
})}

module.exports.getBy_id = function(_id) {return new Promise((resolve, reject) => {
  FileRating.findById(_id, (err, doc)=>{
    if(err) return reject(err);
    return resolve(doc);
  });
})}

module.exports.removeBy_id = function(_id) {return new Promise((resolve, reject) => {
  FileRating.findByIdAndRemove(_id, (err, doc)=>{
    if(err) return reject(err);
    return resolve(doc);
  });
})}

module.exports.removeByUsernameAndFileRef = function(user, ref) {return new Promise((resolve, reject) => {
  const query = {
    username: user,
    fileRef: ref
  }
  FileRating.findOneAndRemove(query, (err, doc)=>{
    if(err) return reject(err);
    return resolve(doc);
  });
})}

module.exports.getByUsernameAndFileRef = function(user, ref) {return new Promise((resolve, reject) => {
  const query = {
    username: user,
    fileRef: ref
  }
  FileRating.findOne(query, (err, doc)=>{
    if(err) return reject(err);
    return resolve(doc);
  });
})}

module.exports.updateBy_id = function(_id, rating) {return new Promise((resolve, reject) => {
  FileRating.findByIdAndUpdate(_id, {rating: rating}, (err, doc)=>{
    if(err) return reject(err);
    return resolve(doc);
  });
})}