var express = require('express');
var router = express.Router();
var db = require('../model/db');
var gameBusiness = require('../business/gameBusiness');

/* GET home page. */
router.get('/', function(req, res, next) {

});

router.post('/box9/qrcode', gameBusiness.getQRCode);

router.get('/box9/award-id/:id', gameBusiness.checkAwardStatus);

module.exports = router;
