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

module.exports.get = function(address){

  const query = {
    $where: function() { 
    return ( this.remainingStorage > 5 ); 
    } 
  }

  return new Promise((resolve, reject) => {
    StorageServer.findOne(
      query
      , (err, doc)=>{
      if(err){
        console.log(err);
        reject(err)
      }else{
        resolve(doc)
      }
    });
  });

}