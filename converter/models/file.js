const mongoose = require('mongoose');

// Schema
const fileSchema = mongoose.Schema({
  _id: String,
  title: String,
  uploader: String,
  description: String,
  proccessing: {
    type: Boolean,
    default: true,
    required: true
  },
  activeThumb: {
    type: Number,
    required: true,
    default: 1
  },
  views: {
    type: Number,
    default: 0
  },
});

const File = module.exports = mongoose.model('file', fileSchema);

module.exports.add = function(newFile) {return new Promise((resolve, reject) => {
  newFile.save((err, doc)=>{
    if(err) return reject(err);
    return resolve(doc);
  });
})}

module.exports.removeBy_id = function(_id) {return new Promise((resolve, reject) => {
  File.findByIdAndRemove(_id,(err)=>{
    if(err) return reject(err);
    return resolve(true);
  });
})}