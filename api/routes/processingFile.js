const express = require('express');
const router = express.Router();
const utility = require('../config/utility');
const processingFile = require('../models/processingFile');

// query db for image or video
/**
 * @api {get} processing-file/ Get a processing file
 * @apiName GetAllProcessingFile
 * @apiGroup ProcessingFile
 * @apiHeader (ProcessingFile Headers) {String} auth Authorization jwt_token.
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
router.get('/', async (req, res) => {
  let user;
  try { user = await utility.authUser(req) } catch (error) { return res.status(401).json({msg: error}) }

  let files;
  try {
     files = await processingFile.query(user.username);
  } catch (error) {
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

// get a single proccessing file
/**
 * @api {get} processing-file/ Get a processing file
 * @apiName GetProcessingFile
 * @apiGroup ProcessingFile
 * @apiParam {String} :reference proccessing files unique reference
 * @apiHeader (ProcessingFile Headers) {String} auth Authorization jwt_token.
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
router.get('/:reference/', async (req, res) => {
  let user;
  try { user = await utility.authUser(req) } catch (error) { return res.status(401).json({msg: error}) }

  let file;
  try {
    file = await processingFile.getBy_id(req.params.reference);
  } catch (error) {
    console.log(error);
    return res.status(500).json({msg: "Server error"});
  }

  if(!file || file.uploader != user.username) return res.status(404).json({msg: 'Processing file not found'});
  
  file = file.toObject();
  file.reference = file._id;
  delete file._id;
  return res.status(200).json({data: file});

});

module.exports = router;