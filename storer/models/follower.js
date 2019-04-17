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

module.exports.getFollowersByFollowee = function(followee) {return new Promise((resolve, reject) => {
  const query = {
    followee: followee
  }
  Follower.find(query, (err, doc)=>{
    if(err) return reject(err);
    return resolve(doc);
  });
})}