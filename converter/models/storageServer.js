const mongoose = require('mongoose');

// Schema
//_id is server name as this should be unique
const storageServerSchema = mongoose.Schema({
  _id: String,
  address: String,
  maxStorage: Number,
  remainingStorage: Number,
  lastFailTime: Number
});

const StorageServer = module.exports = mongoose.model('storageServer', storageServerSchema);

module.exports.getWithSpaceForFile = function(fileSizeMB) {return new Promise((resolve, reject) => {
  StorageServer.findOne({})
  .where('remainingStorage').gt(fileSizeMB)
  .where('lastFailTime').lt(Date.now() - 300*1000)//make sure server didnt fail within last five minutes
  .exec((err, doc)=>{
    if(err) return reject(err);
    return resolve(doc);
  })
})}

module.exports.setLastFailTime = function(_id) {return new Promise((resolve, reject) => {
  console.log(_id)
  StorageServer.findByIdAndUpdate(_id, { $set: { lastFailTime:Date.now()}},(err, doc)=>{
    if(err) return reject(err);
    return resolve(doc);
  });
})}