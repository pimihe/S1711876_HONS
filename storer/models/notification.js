const mongoose = require('mongoose');
const config   = require('../config/config');

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

module.exports.add = function(newNotification) {return new Promise((resolve, reject) => {
  newNotification.save((err, doc)=>{
    if(err) return reject(err);
    return resolve(doc);
  });
})}