const mongoose = require('mongoose');

// User Schema
// _id is username as this will be unique
const UserSchema = mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  registerDate: {
    type: Date,
    default: new Date()
  },
  deleted: {
    type: Boolean,
    required: true,
    default: false
  },
  password: {
    type: String,
    required: true
  },
  tier: {
    type: Number,
    default: 0
  },
  permission:{
    type: Number,
    default: 0
  },
  followerCount:{
    type: Number,
    default: 0
  }
});

const User = module.exports = mongoose.model('User', UserSchema);

module.exports.getBy_id = function(_id){return new Promise((resolve, reject) => {
  User.findById(_id, (err, doc)=>{
    if(err) return reject(err);
    return resolve(doc);
  });
})}