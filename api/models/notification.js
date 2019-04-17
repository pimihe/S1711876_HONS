const mongoose = require('mongoose');

// Schema
const notificationSchema = mongoose.Schema({
  _id: String,
  user: String,
  msg: String,
  type: String,
  date: Date,
  link: String
});

const Notification = module.exports = mongoose.model('notification', notificationSchema);

module.exports.getByUsername = function(user){return new Promise((resolve, reject) => {

  const query = {user: user}
  Notification.find(query, (err, doc)=>{
    if(err) return reject(err);
    return resolve(doc);
  });

})}

module.exports.removeByUsernameAnd_id = function(user, _id){return new Promise((resolve, reject) => {

  const query = {_id:_id, user: user}
  Notification.deleteOne(query, (err)=>{
    if(err) return reject(err);
    return resolve(true);
  });

})}