var Sequelize = require('sequelize');
var config = require('../config');
var qr = require('qr-image');
var Jimp = require('jimp');
var uuid = require('node-uuid');
var path = require('path');
var urlJoin = require('url-join');

var client = require('redis').createClient();
client.on('connect', function() {
  console.log('>>> connect to redis successful');
});

var _logoBgImage;
Jimp.read(path.join(config.path.root, '/server/assets/images/qrLogoBg.png'), function(err, logoBgImage) {
  logoBgImage.resize(60, 60, Jimp.RESIZE_BEZIER);
  _logoBgImage = logoBgImage;
});

// { title: '地产', desc: '买房立减', price: '￥ 5000', awardId:'12345'},
exports.getQRCode = function(req, res, next) {
  console.log(req.body);
  client.set(req.body.awardId, JSON.stringify(req.body));
  var filename = uuid.v1() + '.png';
  var qrCodeSavePath = path.join(config.path.qrcode, filename);
  var assetURLRelativePath = path.join('assets/qrcode', filename);
  var url = urlJoin(config.serverURL, '#!/qrcode-redeem/', req.body.awardId.toString());

  var qr_png = qr.image(url, {
    type: 'png',
    ec_level: 'H',
    size: 10
  });

  qr_png.pipe(require('fs').createWriteStream(qrCodeSavePath))
    .on('finish', function() {
      Jimp.read(qrCodeSavePath, function(err, qrImage) {
        qrImage.resize(250, 250, Jimp.RESIZE_BEZIER);
        Jimp.read(path.join(config.path.upload.logo, 'alipay.png'), function(err, innerImage) {
          innerImage.resize(50, 50, Jimp.RESIZE_BEZIER);
          qrImage.composite(_logoBgImage, 95, 95);
          qrImage.composite(innerImage, 100, 100);
          qrImage.write(qrCodeSavePath, function() {
            res.send({ qrcode: '/assets/qrcode/test.png', path: assetURLRelativePath });
          })
        });
      });
    })

};


exports.checkAwardStatus = function(req, res, next) {
  client.get(req.params.id, function(err, reply) {
    console.log(reply);
    reply = JSON.parse(reply);
    res.send({ isAwarded: reply.awardId === true});
  });
};


exports.redeemById = function(req, res, next) {
  if (req.params.id && (req.session.name || req.body.password === '123456') ) {
    req.session.name = 'test';

    client.get(req.params.id, function(err, reply) {
      reply = JSON.parse(reply);
      reply.awardId = true;
      client.set(req.params.id, JSON.stringify(reply), function(err, innerReply) {
        res.send({success:true, data:reply});
      });
    });
  }
  else{
    if(req.body.password.length>0)
    {
      res.status(401).send({success:false});
    }
    else{
      res.send({success:false}); }
  }
};
