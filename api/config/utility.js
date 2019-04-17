const config = require('./config');
const jwt = require('jwt-simple');

module.exports.getRefString = (length)=>{
  const chars = 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890';
  let randString = '';
  for (let i = 0; i < length; i++) randString += chars[parseInt(Math.random()*62)];
  return(randString);
}

module.exports.authUser = (req)=>{ return new Promise(async (resolve, reject) => {

  if(req && req.headers && (typeof req.headers.auth == 'undefined' || !req.headers.auth)) return reject('No token provided');

  let decodedToken;
  try {
    decodedToken = jwt.decode(req.headers.auth, config.secret);
  } catch (error) { 
    return reject('Invalid login session'); 
  }
  if(decodedToken.expires < Date.now()) return reject('Login session has expired'); 

  // if no problem was found details are correct so return true
  return resolve(decodedToken.user);

})}