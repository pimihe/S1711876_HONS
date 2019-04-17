const mongoose = require('mongoose');

// Schema
const processingServerSchema = mongoose.Schema({
  name: String,
  address: String,
  maxStorage: Number,
  remainingStorage: Number,
  maxQueue: Number,
  currentQueue: Number
});

const ProcessingServer = module.exports = mongoose.model('processingServer', processingServerSchema);

module.exports.get = function(address){

  const query = {
    $where: function() { 
    return ( this.remainingStorage > 1024 && this.maxQueue > this.currentQueue ); 
    } 
  }

  return new Promise((resolve, reject) => {
    ProcessingServer.findOne(
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

