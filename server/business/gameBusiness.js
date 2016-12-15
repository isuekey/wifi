var Sequelize = require('sequelize');
var config = require('../config');
var qr = require('qr-image');
var Jimp = require('jimp');
var uuid = require('node-uuid');
var path = require('path');

var client = require('redis').createClient();
client.on('connect', function() {
  console.log('>>> connect to redis successful');
});


// { title: '地产', desc: '买房立减', price: '￥ 5000', awardId:'12345'},
exports.getQRCode = function(req, res, next) {
  console.log(req.body);
  client.set(req.body.awardId, false);
  var qrCodeSavePath = path.join(config.path.qrcode, uuid.v1() + '.png');
  var url = path.join(config.serverURL, '/qrcode/', req.body.awardId);

  var qr_png = qr.image(url, {
    type: 'png',
    ec_level: 'H',
    size: 10
  });

  qr_png.pipe(require('fs').createWriteStream(qrCodeSavePath))
    .on('finish', function() {
      Jimp.read(path, function(err, qrImage) {
        qrImage.resize(250, 250, Jimp.RESIZE_BEZIER);
        Jimp.read('avatar.png', function(err, innerImage) {
          innerImage.resize(50, 50, Jimp.RESIZE_BEZIER);
          qrImage.composite(innerImage, 100, 100);
          qrImage.write(path);
        });
      });
    })

  res.send({ qrcode: '/assets/qrcode/test.png', path: qrCodeSavePath });
};


exports.checkAwardStatus = function(req, res, next) {
  client.get(req.params.id, function(err, replay) {
    console.log(replay);
    res.send({ isAwarded: replay === 'true' });
  });
};
