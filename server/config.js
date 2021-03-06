var path = require('path');
var rootPath = path.join(__dirname , '../');
module.exports = {
    "redisHost": "127.0.0.1",
    "redisPort": "6379",
    "connectDB": "postgres://ngedu:ngedu123@localhost:5432/db_wifi",
    "tablePrefix": "t_",
    "serverURL": "http://hackhome.local:5757",
    "path": {
      "root": rootPath,
      "qrcode": path.join(rootPath, '/client/app/assets/qrcode/'),
      "upload": {
        "logo": path.join(rootPath, '/client/app/upload/logo'),
      }
    },
}