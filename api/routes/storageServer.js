const express = require('express');
const router = express.Router();
const utility = require('../config/utility');
const StorageServer = require('../models/storageServer');

// get storage server address before uploading profile pic
/**
 * @api {get} storage-server/ Get a storage server
 * @apiName GetStorageServer
 * @apiGroup StorageServer
 * @apiHeader (StorageServer Headers) {String} auth Authorization jwt_token.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *      {
 *           "data": {
 *               "address": "http://127.0.0.1:82",
 *               "maxStorage": 4096,
 *               "remainingStorage": 3680,
 *               "lastFailTime": 0,
 *               "reference": "storage1"
 *           }
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
    server = await StorageServer.get()
  } catch (error) {
    console.log(error)
    return res.status(500).json({msg: 'Server error'});
  }

  if(server) {
    server = server.toObject();
    server.reference = server._id;
    delete server._id;
  }
  
  return res.status(200).json({data:server});
});

module.exports = router;