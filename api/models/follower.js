const mongoose = require('mongoose');

// Schema
const followerSchema = mongoose.Schema({
  _id: String,
  follower: String,
  followee: String,
  date: {
    type: Date,
    required: true,
    default: new Date()
  },
});

const Follower = module.exports = mongoose.model('follower', followerSchema);

module.exports.add = function(newFollower) {return new Promise((resolve, reject) => {
  newFollower.save((err, doc)=>{
    if(err) return reject(err);
    return resolve(doc);
  });
})}

module.exports.getBy_id = function(_id) {return new Promise((resolve, reject) => {
  Follower.findById(_id, (err, doc)=>{
    if(err) return reject(err);
    return resolve(doc);
  });
})}

module.exports.removeByFollowerAndFollowee = function(follower, followee) {return new Promise((resolve, reject) => {
  const query = {
    follower: follower,
    followee: followee
  }
  Follower.findOneAndRemove(query, (err, doc)=>{
    if(err) return reject(err);
    return resolve(doc);
  });
})}

module.exports.getByFollowerAndFollowee = function(follower, followee) {return new Promise((resolve, reject) => {
  const query = {
    follower: follower,
    followee: followee
  }
  Follower.findOne(query, (err, doc)=>{
    if(err) return reject(err);
    return resolve(doc);
  });
})}