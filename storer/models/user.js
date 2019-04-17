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
  email: {
    type: String,
    required: true
  },
  registerDate: {
    type: Date,
    default: Date
  },
  password: {
    type: String,
    required: true
  },
  verified: {
    type: Boolean,
    required: true,
    default: false
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

module.exports.getByUsername = function(username){
  return new Promise((resolve, reject) => {

    User.findOne({username: username},(err, doc)=>{
      if(err){
        reject(err)
      }else{
        resolve(doc)
      }
    });
    
  });
}

module.exports.updateProfilePicturePathByUsername = function(username, newProfilePicPath){
  return new Promise((resolve, reject) => {
    
    User.findOneAndUpdate({username:username}, {profilePicturePath: newProfilePicPath},(err, doc)=>{
      if(err){
        reject(err)
      }else{
        resolve(doc)
      }
    });
    
  });
}

module.exports.incUploadCountByUsername = function(username) {return new Promise((resolve, reject) => {
  User.findOneAndUpdate({username:username}, { $inc: { uploadCount: 1 } }, {new: true }, (err, doc)=>{
    if(err) return reject(err);
    return resolve(doc);
  });
})}

module.exports.decUploadCountByUsername = function(username) {return new Promise((resolve, reject) => {
  User.findOneAndUpdate({username:username}, { $inc: { uploadCount: -1 } }, {new: true }, (err, doc)=>{
    if(err) return reject(err);
    return resolve(doc);
  });
})}