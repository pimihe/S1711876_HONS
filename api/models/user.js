const mongoose = require('mongoose');

// User Schema
const UserSchema = mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 300
  },
  registerDate: {
    type: Date,
    default: Date
  },
  password: {
    type: String,
    required: true
  },
  profileViews:{
    type: Number,
    required: true,
    default: 0
  },
  followerCount:{
    type: Number,
    required: true,
    default: 0
  },
  uploadCount:{
    type: Number,
    required: true,
    default: 0
  },
  commentCount:{
    type: Number,
    required: true,
    default: 0
  },
  profilePicturePath: {
    type: String,
    default: null
  }
});

const User = module.exports = mongoose.model('User', UserSchema);

module.exports.getBy_id = (_id)=>{return new Promise((resolve, reject) => {
  User.findById(_id, (err, doc)=>{
    if(err) return reject(err);
    return resolve(doc);
  });
})}

module.exports.getByUsername = (username)=>{return new Promise((resolve, reject) => {
  User.findOne({username:username}, (err, doc)=>{
    if(err) return reject(err);
    return resolve(doc);
  });
})}

module.exports.updateBy_id = (id, updateObj)=>{return new Promise((resolve, reject) => {
  User.findByIdAndUpdate(id,updateObj, (err, doc)=>{
    if(err) return reject(err);
    return resolve(doc);
  });
})}

module.exports.updateByUsername = (username, updateObj)=>{return new Promise((resolve, reject) => {
  User.findOneAndUpdate({username:username},updateObj, (err, doc)=>{
    if(err) return reject(err);
    return resolve(doc);
  });
})}

module.exports.removeBy_id = (_id)=>{return new Promise((resolve, reject) => {
  User.findByIdAndRemove(_id, (err, doc)=>{
    if(err) return reject(err);
    return resolve(doc);
  });
})}

module.exports.add = (newUser)=>{return new Promise((resolve, reject) => {
  newUser.save((err, doc)=>{
    if(err) return reject(err);
    return resolve(doc);
  });
})}

module.exports.incFollowerCountByUsername = (username)=>{return new Promise((resolve, reject) => {
  User.findOneAndUpdate({username:username}, { $inc: { followerCount: 1 } }, {new: true }, (err, doc)=>{
    if(err) return reject(err);
    return resolve(doc);
  });
})}

module.exports.decFollowerCountByUsername = (username)=>{return new Promise((resolve, reject) => {
  User.findOneAndUpdate({username:username}, { $inc: { followerCount: -1 } }, {new: true }, (err, doc)=>{
    if(err) return reject(err);
    return resolve(doc);
  });
})}

module.exports.incCommentCountByUsername = function(username) {return new Promise((resolve, reject) => {
  User.findOneAndUpdate({username:username}, { $inc: { commentCount: 1 } }, {new: true }, (err, doc)=>{
    if(err) return reject(err);
    return resolve(doc);
  });
})}

module.exports.decCommentCountByUsername = function(username) {return new Promise((resolve, reject) => {
  User.findOneAndUpdate({username:username}, { $inc: { commentCount: -1 } }, {new: true }, (err, doc)=>{
    if(err) return reject(err);
    return resolve(doc);
  });
})}

module.exports.incProfileViewsByUsername = function(username) {return new Promise((resolve, reject) => {
  User.findOneAndUpdate({username:username}, { $inc: { profileViews: 1 } }, {new: true }, (err, doc)=>{
    if(err) return reject(err);
    return resolve(doc);
  });
})}