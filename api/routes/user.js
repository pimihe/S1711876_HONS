const express = require('express');
const router = express.Router();
const config = require('../config/config');
const utility = require('../config/utility');
const User = require('../models/user');
const Follower = require('../models/follower');
const ProFileView = require('../models/profileView');
const crypto = require('crypto');
const jwt = require('jwt-simple');

// Register
/**
 * @api {post} user/ Create new user
 * @apiName CreateUser
 * @apiGroup Users
 *
 * @apiParamExample {json} Request Body Example:
 *     {
 *       'username': 'john',
 *       'password': 'password123'
 *     }
 *
 * @apiSuccess {Object} user object that was created (password is hashed).
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 201 OK
 *     {
 *       "reference" : "6hgXC6z1R79QdxSKCtqd",
 *       'username': 'John',
 *       'password': '10/w7o2juYBrGMh32/KbveULW9jk2tejpyUAD+uC6PE='
 *     }
 * 
 * {
 *     "msg": "User registered",
 *     "data": {
 *         "profileViews": 0,
 *         "followerCount": 0,
 *         "uploadCount": 0,
 *         "commentCount": 0,
 *         "profilePicturePath": null,
 *         "_id": "cCGbCkEIyYS31LNbHNUq",
 *         "username": "user11",
 *         "description": "This user does not have a description.",
 *         "password": "10/w7o2juYBrGMh32/KbveULW9jk2tejpyUAD+uC6PE=",
 *         "registerDate": "2019-02-20T15:10:09.000Z",
 *         "__v": 0
 *     }
 * }
 * 
 * @apiError UserNotFound The id of the User was not found.
 * @apiErrorExample 400 Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       'msg': 'Invalid data'
 *     }
 *
 * @apiErrorExample 409 Error-Response:
 *     HTTP/1.1 409 Conflict
 *     {
 *       'msg': 'User with this username already exists.'
 *     }
 */
router.post('/', async (req, res) => {
  if(//check if correct data has been sent
    typeof req.body.username == 'undefined' || !req.body.username ||
    typeof req.body.password == 'undefined' || !req.body.password ||
    req.body.username.length<3 || req.body.username.length>16 ||
    req.body.password.length<3 || req.body.password.length>255
  ){
    return res.status(400).json({msg:'Invalid data'});
  }

  let existingUser;
  try {
    existingUser = await User.getByUsername(req.body.username)
  } catch (error) {
    console.log(error);
    return res.status(500).json({msg: "Server error"});
  }
  if(existingUser){
    return res.status(409).json({msg: 'User with this username already exists.'});
  }

  //try to create new user
  let newUser = new User({
    _id: utility.getRefString(20),
    username:req.body.username,
    description:"This user does not have a description.",
    password: crypto.createHash('sha256').update(req.body.password).digest('base64')
  });
  userResObj = await User.add(newUser);
  if(!userResObj){// if user wasnt registered cause of error
    return res.status(500).json({msg:'Failed to register user'});
  } 

  return res.status(201).json({msg:'User registered', data:userResObj}); //user created ok so send success result
    
});

/**
 * @api {put} user/:userReference Update user details
 * @apiName UpdateUser
 * @apiGroup Users
 * @apiParam {String} :userReference Users unique reference
 * @apiHeader (User Headers) {String} auth Authorization jwt_token.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "data": {
 *         "profileViews": 0,
 *         "followerCount": 0,
 *         "uploadCount": 0,
 *         "commentCount": 0,
 *         "profilePicturePath": null,
 *         "_id": "cCGbCkEIyYS31LNbHNUq",
 *         "username": "user11",
 *         "description": "This user does not have a description.",
 *         "password": "10/w7o2juYBrGMh32/KbveULW9jk2tejpyUAD+uC6PE=",
 *         "registerDate": "2019-02-20T15:10:09.000Z",
 *         "__v": 0
 *      }
 *     }
 * 
 * @apiErrorExample 401 Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       'msg': 'Unauthorized'
 *     }
 *
 * @apiErrorExample 500 Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       'msg': 'Server error'
 *     }
 */
router.put('/:username/', async (req, res) => {
  let user;
  try { user = await utility.authUser(req) } catch (error) { return res.status(401).json({msg: error}) }
  if(user.username !== req.params.username) return res.status(401).json({msg:"Unauthorized"});

  let updateObj = {};
  if(req.body.description && req.body.description.length < 300) updateObj.description = req.body.description;

  let userDoc;
  try {
    userDoc = await User.updateByUsername(req.params.username,updateObj);
  } catch (error) {
    console.log(error);
    return res.status(500).json({msg: 'Server error'});
  }
  if(!userDoc) return res.status(404).json({msg: 'User not found'});

  return res.status(200).json({data: userDoc, msg: "Information updated"});
});

// used to auth user and give user their token 
/**
 * @api {get} user/ Authorize user
 * @apiName AuthUser
 * @apiGroup Users
 * @apiHeader (User Headers) {String} user username.
 * @apiHeader (User Headers) {String} pass password.
 * 
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "reference" : "6hgXC6z1R79QdxSKCtqd",
 *       'username': 'John',
 *       'password': '10/w7o2juYBrGMh32/KbveULW9jk2tejpyUAD+uC6PE='
 *     }
 * 
 * {
 *     "msg": "Username and password match",
 *     "data": "jwt key string"
 * }
 * 
 * 
 * @apiErrorExample 400 Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       'msg': 'Invalid data'
 *     }
 * 
 * @apiErrorExample 401 Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       'msg': 'Username and password do not match'
 *     }
 *
 * @apiErrorExample 500 Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       'msg': 'Server error'
 *     }
 */
router.get('/', async (req, res, next) => {
  if(//check if correct data has been sent
    typeof req.headers.user == 'undefined' || !req.headers.user ||
    typeof req.headers.pass == 'undefined' || !req.headers.pass
  ){
    return res.status(400).json({msg:'Invalid data'});
  }

  user = await User.getByUsername(req.headers.user);
  if(!user || user.password != crypto.createHash('sha256').update(req.headers.pass).digest('base64')){
    return res.status(401).json({msg: 'Username and password do not match'});
  }

  user = user.toObject();
  delete user._id;
  delete user.__v;
  delete user.deleted;

  let payload = {
    user: user,
    expires: Date.now() + 604800*1000
  }

  const token = jwt.encode(payload, config.secret);
  return res.status(200).json({data: token, msg: 'Username and password match'});

});

// used to get a profle
/**
 * @api {get} user/:username Get user profile
 * @apiName UserProfile
 * @apiGroup Users  
 * @apiParam {String} :username Users username
 * @apiSuccessExample Success-Response:
 * {
 *     "msg": "Found user",
 *     "data": {
 *         "profileViews": 0,
 *         "followerCount": 0,
 *         "uploadCount": 0,
 *         "commentCount": 0,
 *         "profilePicturePath": null,
 *         "_id": "cCGbCkEIyYS31LNbHNUq",
 *         "username": "user11",
 *         "description": "This user does not have a description.",
 *         "password": "10/w7o2juYBrGMh32/KbveULW9jk2tejpyUAD+uC6PE=",
 *         "registerDate": "2019-02-20T15:10:09.000Z",
 *         "__v": 0
 *     }
 * }
 * 
 * @apiErrorExample 404 Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       'msg': 'User not found'
 *     }
 *
 * @apiErrorExample 500 Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       'msg': 'Server error'
 *     }
 */
router.get('/:username/', async (req, res, next) => {
  let user;
  try {
    user = await User.getByUsername(req.params.username);
  } catch (error) {
    console.log(error);
    return res.status(500).json({msg: 'Server error'});
  }
  if(!user) return res.status(404).json({msg: 'User not found'});

  userResObj = {
    username: user.username,
    description: user.description,
    registerDate: user.registerDate,
    followerCount: user.followerCount,
    profileViews: user.profileViews,
    commentCount: user.commentCount,
    uploadCount: user.uploadCount,
    profilePicturePath: user.profilePicturePath
  }

  return res.status(200).json({data: userResObj, msg: 'Found user'});
});

// follow user
/**
 * @api {post} user/:username/follow Follow a user
 * @apiName FollowUser
 * @apiGroup Users
 * @apiParam {Number} :username Users username
 * @apiHeader (User Headers) {String} auth Authorization jwt_token.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *         "msg": {
 *             "date": "2019-02-21T02:24:55.484Z",
 *             "_id": "o1KXbeIr6E6lFHSaqfIE",
 *             "follower": "user",
 *             "followee": "user",
 *             "__v": 0
 *         }
 *     }
 * 
 * @apiErrorExample 401 Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       'msg': 'Unauthorized'
 *     }
 * 
 * @apiErrorExample 409 Error-Response:
 *     HTTP/1.1 409 Conflict
 *     {
 *       'msg': 'Already following this user'
 *     }
 *
 * @apiErrorExample 500 Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       'msg': 'Server error'
 *     }
 */
router.post('/:username/follow', async (req, res, next) => {
  // check users token
  let user;
  try { user = await utility.authUser(req) } catch (error) { return res.status(401).json({msg: error}) }

  let followerObj;
  try {
    followerObj = await Follower.getByFollowerAndFollowee(user.username, req.params.username);
  } catch (error) {
    console.log(error)
    return res.status(500).json({msg: "Server error"});
  }

  if(followerObj) return res.status(409).json({msg: "Already following this user"});
  

  //try to create new user follow
  let newFollower = new Follower({
    _id: utility.getRefString(20),
    follower: user.username,
    followee: req.params.username
  });
  let resObj;
  try {
    resObj = await Follower.add(newFollower);
  } catch (error) {
    return res.status(500).json({msg: "server error"});
  }

  User.incFollowerCountByUsername(req.params.username);
  
  return res.status(200).json({msg: resObj});
});

// check if user is following other user
/**
 * @api {get} user/:username/follow Follow a user
 * @apiName GetFollowUser
 * @apiGroup Users
 * @apiParam {String} :username Users username
 * @apiHeader (User Headers) {String} auth Authorization jwt_token.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *         "msg": {
 *             "date": "2019-02-21T02:24:55.484Z",
 *             "_id": "o1KXbeIr6E6lFHSaqfIE",
 *             "follower": "user",
 *             "followee": "user",
 *             "__v": 0
 *         }
 *     }
 * 
 * @apiErrorExample 401 Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       'msg': 'Unauthorized'
 *     }
 *
 * @apiErrorExample 500 Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       'msg': 'Server error'
 *     }
 */
router.get('/:username/follow', async (req, res, next) => {
  let user;
  try { user = await utility.authUser(req) } catch (error) { return res.status(401).json({msg: error}) }

  let followerObj;
  try {
    followerObj = await Follower.getByFollowerAndFollowee(user.username, req.params.username);
  } catch (error) {
    console.log(error)
    return res.status(500).json({msg: "Server error"});
  }

  if(followerObj) return res.status(200).json({data: followerObj});
  return res.status(200).json({data: null});
});

// delete follow
/**
 * @api {delete} user/:username/follow Stop following a user
 * @apiName DeleteFollowUser
 * @apiGroup Users
 * @apiParam {String} :username Users username
 * @apiHeader (User Headers) {String} auth Authorization jwt_token.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *      {
 *        "msg": "No longer following user"
 *      }
 * 
 * @apiErrorExample 401 Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       'msg': 'Unauthorized'
 *     }
 *
 * @apiErrorExample 500 Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       'msg': 'Server error'
 *     }
 */
router.delete('/:username/follow', async (req, res, next)=>{

  let user;
  try { user = await utility.authUser(req) } catch (error) { return res.status(401).json({msg: error}) }

  let followerObj;
  try {
    followerObj = await Follower.removeByFollowerAndFollowee(user.username, req.params.username);
  } catch (error) {
    console.log(error)
    return res.status(500).json({msg: "Server error"});
  }
  if(followerObj){User.decFollowerCountByUsername(req.params.username)}

  return res.status(200).json({msg: "No longer following user"});

})

// add view to a file
/**
 * @api {post} user/:username/view Add view to a user profile
 * @apiName AddProfileView
 * @apiGroup Users
 * @apiParam {String} :username Users username
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *        "msg": "View added"
 *     }
 * 
 * @apiErrorExample 401 Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       'msg': 'Unauthorized'
 *     }
 * 
 * @apiErrorExample 409 Error-Response:
 *     HTTP/1.1 409 Conflict
 *     {
 *       'msg': 'Already following this user'
 *     }
 *
 * @apiErrorExample 500 Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       'msg': 'Server error'
 *     }
 */
router.post('/:username/view', async (req, res) => {
  let viewDoc = null;
  try {
    viewDoc = await ProFileView.getByIpAndProfile_id(req.connection.remoteAddress, req.params.username);
  } catch (error) {
    console.log(error);
    return res.status(500).json({msg: "Server error"});
  }

  if(viewDoc) return res.status(409).json({msg: "View already exists"});

  let newProFileView = new ProFileView({
    ip: req.connection.remoteAddress,
    user_id: req.params.username
  });

  let viewAddRes;
  try {
    viewAddRes = await ProFileView.add(newProFileView);
    await User.incProfileViewsByUsername(req.params.username)
  } catch (error) {
    console.log(error);
    return res.status(500).json({msg: "Server error"});
  }

  return res.status(201).json({msg: "View added", data:viewAddRes});
});

module.exports = router;