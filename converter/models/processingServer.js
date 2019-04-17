const mongoose = require('mongoose');

// Schema
// _id is name of processing server as this should be unique
const processingServerSchema = mongoose.Schema({
  _id: String,
  address: String,
  maxStorage: Number,
  remainingStorage: Number,
  maxQueue: Number,
  currentQueue: Number
});

const ProcessingServer = module.exports = mongoose.model('processingServer', processingServerSchema);

module.exports.getByAddress = function(address) {return new Promise((resolve, reject) => {
  const query = {address: address}
  ProcessingServer.findOne(query, (err, doc)=>{
    if(err) return reject(err);
    return resolve(doc);
  });
})}

module.exports.setRemainingStorageAndCurrentQueueBy_id = function(_id, remainingStorage, currentQueue) {return new Promise((resolve, reject) => {
  ProcessingServer.findByIdAndUpdate(_id, {remainingStorage:remainingStorage,currentQueue:currentQueue},(err, doc)=>{
    if(err) return reject(err);
    return resolve(doc);
  });
})}