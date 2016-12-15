"user strict";

var app = angular.module("wifi");
app.constant('baseURL', 'http://localhost:7104');
// app.constant('baseURL', '');

app.service("mainServices", [function() {

}]);

app.service("box9GameServices", ['$resource', 'baseURL', function($resource, baseURL) {
  this.getQrCodeWithAward = function(award) {
    return $resource(baseURL + '/games/box9/qrcode').save(award);
  };

  this.getAwardStatus = function(awardId){
    return $resource(baseURL + '/games/box9/award-id/:id', {id:awardId}).get();
  }
}]);
