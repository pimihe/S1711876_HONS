const mongoose = require('mongoose');

// Schema
const fileReportSchema = mongoose.Schema({
  _id: String,
  msg: String,
  type: String,
  file: String,
  date: {
    type: Date,
    required: true,
    default: new Date()
  },
});

const FileReport = module.exports = mongoose.model('fileReport', fileReportSchema);

module.exports.add = function(newFileReport) {return new Promise((resolve, reject) => {
  newFileReport.save((err, doc)=>{
    if(err) return reject(err);
    return resolve(doc);
  });
})}

module.exports.removeBy_id = function(_id) {return new Promise((resolve, reject) => {
  FileReport.findByIdAndRemove(_id, (err, doc)=>{
    if(err) return reject(err);
    return resolve(doc);
  });
})}

// module.exports.getByFollowerAndFollowee = function(follower, followee) {return new Promise((resolve, reject) => {
//   const query = {
//     follower: follower,
//     followee: followee
//   }
//   Follower.findOne(query, (err, doc)=>{
//     if(err) return reject(err);
//     return resolve(doc);
//   });
// })}