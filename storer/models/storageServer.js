const mongoose = require('mongoose');
const config = require('../config/config');

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

module.exports.getBy_id = function(_id) {return new Promise((resolve, reject) => {
  StorageServer.findById(_id, (err, doc)=>{
    if(err) return reject(err);
    return resolve(doc)
    
  })
})}

module.exports.getByAddress = function(address) {return new Promise((resolve, reject) => {
  const query = {address: address}
  StorageServer.findOne(query, (err, doc)=>{
    if(err) return reject(err);
    return resolve(doc);
  });
})}

module.exports.setRemainingStorageBy_id = function(_id, remainingStorage){return new Promise((resolve, reject) => {
  StorageServer.findByIdAndUpdate(_id, {remainingStorage:remainingStorage},(err, doc)=>{
    if(err) return resolve(false);
    return resolve(doc);
  });
})}