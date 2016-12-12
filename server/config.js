var path = require('path');

module.exports = {
    "redisHost"  : "127.0.0.1",
    "redisPort"  : "6379",
    "connectDB"  : "postgres://ngedu:ngedu123@localhost:5432/db_wifi",
    "tablePrefix": "t_",
    "path" :{
      "root": path.join(__dirname , '../'),
    },
}