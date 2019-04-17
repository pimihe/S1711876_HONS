const mongoose = require('mongoose');

// Schema
let profileViewSchema = mongoose.Schema({
  ip: String,
  user_id: String,
  createdAt: { 
    type: Date, 
    expires: 60, 
    default: Date.now 
  }
});


const ProfileView = module.exports = mongoose.model('profileView', profileViewSchema);

module.exports.add = function(newProfileView){return new Promise((resolve, reject) => {

  newProfileView.save((err, doc)=>{
    if(err){
      reject(err)
    }else{
      resolve(doc)
    }
  });

});}

module.exports.getByIpAndProfile_id = function(ip,user_id){
  return new Promise((resolve, reject) => {
    const query = {ip:ip,user_id: user_id}
    ProfileView.findOne(query, (err, doc)=>{
      if(err){
        reject(err)
      }else{
        resolve(doc)
      }
    });
  });
}
