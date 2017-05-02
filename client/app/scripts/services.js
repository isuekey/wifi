"user strict";

var app = angular.module("wifi");
app.constant('baseURL', 'http://localhost:7104');
// app.constant('baseURL', '');
app.constant('baseApiUrl', 'http://localhost:10010');

app.service("mainServices", [function() {

}]);

app.service("box9GameServices", ['$resource', 'baseURL','baseApiUrl', function($resource, baseURL, baseApiUrl) {
    this.getQrCodeWithAward = function(award) {
        return $resource(baseURL + '/games/box9/qrcode').save(award);
    };

    this.getAwardStatus = function(awardId){
        return $resource(baseURL + '/games/box9/award-id/:id', {id:awardId}).get();
    };

    // {id:'', password:''}
    this.redeemAward = function(obj){
        return $resource(baseURL + '/games/box9/redeem/:id', {id:'@id'}).save(obj);
    };

    this.login = function(account){
        return $resource(`${baseApiUrl}/account/signin`).save({
            account: account.name,
            password: account.password
        });
    };
    this.getUserNineCouponsToAwards = function getUserNineCouponsToAwards(account){
        return $resource(`${baseApiUrl}/coupon/instance/:appUserId`, {appUserId:account.id}).query();
    };
    this.takeOffTheNineCoupon = function takeOffTheNineCoupon(account, coupon){
        return $resource(`${baseApiUrl}/coupon/instance/:appUserId` ).save({appUserId:account.id}, {
            id: coupon.id,
            name: coupon.title,
            data: coupon.data
        });
    };
}]);


/**
couponInstance: {title: "discount", desc: "双安商场全场9折",…}}
couponInstance
:
{title: "discount", desc: "双安商场全场9折",…}
data
:
{count: 5, discount: 0.9, brandName: "双安商场", name: "双安商场全场9折"}
brandName
:
"双安商场"
count
:
5
discount
:
0.9
name
:
"双安商场全场9折"
desc
:
"双安商场全场9折"
id
:
3
price
:
"双安商场全场9折"
title
:
"discount"
**/