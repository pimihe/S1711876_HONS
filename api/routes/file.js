const express = require('express');
const router = express.Router();
const utility = require('../config/utility');
const User = require('../models/user');
const File = require('../models/file');
const FileReport = require('../models/fileReport');
const FileRating = require('../models/fileRating');
const FileComment = require('../models/fileComment');
const FileView = require('../models/fileView');

// query db for image or video
router.get('/', async (req, res, next) => {

  // check filetype is valid
  let fileType = null;
  if(req.query.type == 'video' || req.query.type == 'image') fileType = req.query.type;

  //check perpage no not too high
  let limit = 12;
  if(parseInt(req.query.limit) > 0 && parseInt(req.query.limit) <= 96) limit = parseInt(req.query.limit);

  // if random files have been requested
  if(req.query.random) {
    let files;
    try{
      files = await File.getRandomFiles(fileType, limit)
    }catch(err){
      console.log(error);
      return res.status(500).json({msg: "Server error"});
    }
    for (let i = 0; i < files.length; i++) {
      files[i].reference = files[i]._id;
      delete files[i]._id;
    }
    return res.status(200).json({data:files});
  }
  
  //check perpage no not too high
  let skipNo = 0
  if(parseInt(req.query.skipno) > 0) skipNo = parseInt(req.query.skipno);

  // set sort preference
  let sort = -1;
  if(req.query.sort == 'ascending') sort = 1;

  let searchStr = '';
  if(req.query.search) searchStr = req.query.search;

  let files;
  try{
    files = await File.queryFiles(searchStr, fileType, req.query.uploader, sort, limit, skipNo)//TODO: check these fields
  }catch(err){
    console.log(error);
    return res.status(500).json({msg: "Server error"});
  }
  for (let i = 0; i < files.length; i++) {
    files[i] = files[i].toObject();
    files[i].reference = files[i]._id;
    delete files[i]._id;
  }
  return res.status(200).json({data:files});
});

// query db for file comment
router.get('/comment', async (req, res, next) => {
  if(!req.query.fileref && !req.query.username) {
    return res.status(400).json({msg:"Invalid data"});
  }

  // set fileref 
  let fileRef;
  if(req.query.fileref) {
    fileRef = req.query.fileref;
  }

  // set username 
  let username;
  if(req.query.username) username = req.query.username;

  //check perpage no not too high
  let limit = 10;
  if(parseInt(req.query.limit) > 0 && parseInt(req.query.limit) <= 40) limit = parseInt(req.query.limit);
  
  //check page no makes sense
  let skipNo = 0;
  if(parseInt(req.query.skipno) > 0) skipNo = parseInt(req.query.skipno)

  // set sort preference
  let sort = -1;
  if(req.query.sort == 'ascending') sort = 1;

  let comments;
  try{
    comments = await FileComment.queryComments(fileRef, username, sort, limit, skipNo)//TODO: check these fields
  }catch(err){
    console.log(error);
    return res.status(500).json({msg: "Server error"});
  }

  for (let i = 0; i < comments.length; i++) {
    comments[i] = comments[i].toObject();
    comments[i].reference = comments[i]._id;
    delete comments[i]._id;
    delete comments[i].__v;
  }
  return res.status(200).json({data:comments});
  
});

router.delete('/comment/:commentRef/', async (req, res) => {

  let user;
  try { user = await utility.authUser(req) } catch (error) { return res.status(401).json({msg: error}) }

  let comment
  try {
    comment = await FileComment.getBy_id(req.params.commentRef)
  } catch (error) {return res.status(500).json({msg:'Server error'});}

  if(!comment) return res.status(404).json({msg:'Comment does not exist'});

  if(comment.username != user.username) return res.status(401).json({msg:'Unauthorized'});

  try {
    await FileComment.removeBy_id(req.params.commentRef);
  } catch (error) {return res.status(500).json({msg:'Server error'});}
  
  User.decCommentCountByUsername(user.username);

  return res.status(200).json({msg:'Comment deleted'});
});

router.put('/comment/:commentRef/', async (req, res) => {

  let user;
  try { user = await utility.authUser(req) } catch (error) { return res.status(401).json({msg: error}) }

  let comment
  try {
    comment = await FileComment.getBy_id(req.params.commentRef)
  } catch (error) {return res.status(500).json({msg:'Server error'});}

  if(!comment) return res.status(404).json({msg:'Comment does not exist'});

  if(comment.username != user.username) return res.status(401).json({msg:'Unauthorized'});

  if(!req.body.comment) return res.status(400).json({msg:'No comment given'});
  try {
    comment = await FileComment.updateBy_id(req.params.commentRef,{comment:req.body.comment});
  } catch (error) {console.log(error);return res.status(500).json({msg:'Server error'});}

  return res.status(200).json({data:comment,msg:'Comment edited'});
});

router.get('/:fileRef/', async (req, res, next) => {
  let file;
  try {
    file = await File.getBy_id(req.params.fileRef);
    console.log(req.params.fileRef)
  } catch (error) {
    console.log(error);
    return res.status(500).json({msg: "Server error"});
  }

  if(!file) return res.status(404).json({msg: 'File not found'});
  
  file = file.toObject();
  file.reference = file._id;
  delete file._id;
  return res.status(200).json({data: file});
});

router.put('/:file/', async (req, res, next) => {
  let user;
  try { user = await utility.authUser(req) } catch (error) { return res.status(401).json({msg: error}) }

  let updateObj = {};

  if(req.body.title) updateObj.title = req.body.title;
  if(req.body.activeThumb) updateObj.activeThumb = req.body.activeThumb;
  let updateResult;
  try {
    updateResult = await File.updateBy_idAndUploader(req.params.file,user.username,updateObj)
  } catch (error) {
    console.log(error);
    return res.status(500).json({msg: "Server error"});
  }
  
  return res.status(200).json({data:updateResult});
});

router.get('/:fileRef/rating', async (req, res) => {
  let user;
  try { user = await utility.authUser(req) } catch (error) { return res.status(401).json({msg: error}) }

  let fileRatingDoc;
  try {
    fileRatingDoc = await FileRating.getByUsernameAndFileRef(user.username, req.params.fileRef)
  } catch (error) {
    console.log(error);
    return res.status(500).json({msg: "Server error"});
  }

  return res.status(200).json({data: fileRatingDoc});
});

router.post('/:fileRef/rating', async (req, res) => {
  if(typeof req.body.rating == 'undefined' && req.body.rating != true && req.body.rating != false) {
    return res.status(400).json({success: false, msg:'Invalid data'});
  }

  // check users token
  let user;
  try { user = await utility.authUser(req) } catch (error) { return res.status(401).json({msg: error}) }
  
  //check to see if the user has already set a rating
  let rating;
  try {
    rating = await FileRating.getByUsernameAndFileRef(user.username, req.params.fileRef);
  } catch (error) {
    console.log(error);
    return res.status(500).json({msg: "Server error"});
  }

  if(rating) return res.status(409).json({msg: "Rating already set for this file", data: rating});

  let newFileRating = new FileRating({
    _id: utility.getRefString(20),
    username: user.username,
    fileRef: req.params.fileRef,
    rating: req.body.rating,
  });
  try {
    fileRatingStatus = await FileRating.add(newFileRating);
  } catch (error) {
    console.log(error);
    return res.status(500).json({msg: "Server error"});
  }
  if(req.body.rating){
    File.incLikeCountBy_id(req.params.fileRef)
  }else{
    File.incDislikeCountBy_id(req.params.fileRef)
  }
  
  return res.status(201).json({msg: "rating set " + req.body.rating});
});

router.delete('/:fileRef/rating', async (req, res) => {
  
  // check users token 
  let user;
  try { user = await utility.authUser(req) } catch (error) { return res.status(401).json({msg: error}) }

  let rating;
  try {
    rating = await FileRating.removeByUsernameAndFileRef(user.username, req.params.fileRef);
  } catch (error) {
    console.log(error);
    return res.status(500).json({msg: "Server error"});
  }
  if(!rating) return res.status(404).json({msg:'Old rating not found'})

  if(rating.rating) {
    File.decLikeCountBy_id(req.params.fileRef);
  }else{
    File.decDislikeCountBy_id(req.params.fileRef);
  }

  return res.status(200).json({msg: "rating removed", data: rating});
});

// add view to a file
router.post('/:fileRef/view', async (req, res) => {
  let viewDoc = null;
  try {
    viewDoc = await FileView.getByIpAndFile_id(req.connection.remoteAddress, req.params.fileRef);
  } catch (error) {
    console.log(error);
    return res.status(500).json({msg: "Server error"});
  }

  if(viewDoc) return res.status(409).json({msg: "View already exists"});

  let newFileView = new FileView({
    ip: req.connection.remoteAddress,
    file_id: req.params.fileRef
  });

  let viewAddRes;
  try {
    viewAddRes = await FileView.add(newFileView);
    await File.incViewsBy_id(req.params.fileRef)
  } catch (error) {
    console.log(error);
    return res.status(500).json({msg: "Server error"});
  }

  return res.status(201).json({msg: "View added", data:viewAddRes});
});

router.post('/:fileRef/comment', async (req, res, next) => {

  if(
    typeof req.body.comment == 'undefined' || !req.body.comment || typeof req.body.comment.length>1024
  ) return res.status(400).json({msg:'Invalid data'});
  
  // check users token 
  let user;
  try { user = await utility.authUser(req) } catch (error) { return res.status(401).json({msg: error}) }

  let newFileComment = new FileComment({
    _id: utility.getRefString(20),
    username: user.username,
    fileRef: req.params.fileRef,
    comment: req.body.comment,
    date: new Date(),
  });

  let fileCommentObj;
  try{
    fileCommentObj = await FileComment.add(newFileComment);
  }catch(err){
    console.log(error);
    return res.status(500).json({msg: "Server error"});
  }

  User.incCommentCountByUsername(user.username);
  File.incCommentCountBy_id(req.params.fileRef);

  fileCommentObj = fileCommentObj.toObject();
  delete fileCommentObj['__v'];
  fileCommentObj['reference'] = fileCommentObj['_id'];
  delete fileCommentObj['_id'];
  
  return res.status(201).json({data: fileCommentObj});
});

module.exports = router;