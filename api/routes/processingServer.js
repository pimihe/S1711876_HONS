const express = require('express');
const router = express.Router();
const utility = require('../config/utility');
const ProcessingServer = require('../models/processingServer');

// get proc server address before uploading media
/**
 * @api {get} processing-server/ Get a processing server
 * @apiName GetProcessingServer
 * @apiGroup ProcessingServer
 * @apiHeader (ProcessingServer Headers) {String} auth Authorization jwt_token.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *      {
 *           "_id" : "processing1",
 *           "address" : "http://127.0.0.1:81",
 *           "maxStorage" : 4096,
 *           "remainingStorage" : 3988,
 *           "maxQueue" : 10,
 *           "currentQueue" : 0
 *       }
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
router.get('/', async (req, res, next) => {
  let user;
  try { user = await utility.authUser(req) } catch (error) { return res.status(401).json({msg: error}) }

  let server;
  try {
    server = await ProcessingServer.get()
  } catch (error) {
    console.log(error)
    return res.status(500).json({msg: 'Server error'});
  }
  
  return res.status(200).json({data:server});
  
});

module.exports = router;