const express = require('express');
const router = express.Router();
const utility = require('../config/utility');
const Notification = require('../models/notification');

/**
 * @api {delete} notification/ Get a notification
 * @apiName GetNotification
 * @apiGroup Notifications
 * @apiHeader (Notification Headers) {String} auth Authorization jwt_token.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *      {
 *        "data": [{
 *             "_id" : "4t3TdpUghwy5pqunHKtF",
 *             "user" : "pimi",
 *             "type" : "newUpload",
 *             "msg" : "user has uploaded how is uni going",
 *             "date" : ISODate("2019-01-27T02:29:31.110Z"),
 *             "link" : "view/NZngVK9QLnhsKoke6IId",
 *             "__v" : 0
 *         }]
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
router.get('/', async (req, res) => {
  let user;
  try { user = await utility.authUser(req) } catch (error) { return res.status(401).json({msg: error}) }

  let notifications;
  try {
    notifications = await Notification.getByUsername(user.username)
  } catch (error) {
    console.log(error);
    return res.status(500).json({msg: 'Server error'});
  }

  for (let i = 0; i < notifications.length; i++) {
    notifications[i] = notifications[i].toObject();
    notifications[i].reference = notifications[i]._id;
    delete notifications[i]._id;
  }
  
  return res.status(200).json({data:notifications});
});

//delete
/**
 * @api {delete} notification/:reference Delete a notification
 * @apiName DeleteNotification
 * @apiGroup Notifications
 * @apiParam {String} :reference Notification reference
 * @apiHeader (Notification Headers) {String} auth Authorization jwt_token.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *      {
 *        "msg": "Notification deleted"
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
router.delete('/:reference/', async (req, res) => {
  let user;
  try { user = await utility.authUser(req) } catch (error) { return res.status(401).json({msg: error}) }
  
  try {
    await Notification.removeByUsernameAnd_id(user.username, req.params.reference);
  } catch (error) {
    console.log(error);
    return res.status(500).json({msg: 'Server error'});
  }
  
  return res.status(200).json({msg: 'Notification deleted'});
});

module.exports = router;