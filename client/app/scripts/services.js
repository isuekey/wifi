"user strict";

var app = angular.module("wifi");
// app.constant('baseURL', '');
// app.constant('baseApiUrl', 'http://192.168.31.104:10010');
// app.constant('baseApiUrl', 'http://192.168.2.104:10010');
app.constant('baseApiUrl', '');
// app.constant('baseApiUrl', 'http://192.168.1.102:10010');\

app.service("mainServices", [function() {

}]);

app.service("box9GameServices", ['$resource','baseApiUrl', 'NineCouponUtilities',"$http","$q","$uibModal","httpBuffer","$rootScope","NineCouponModal",
    function($resource, baseApiUrl, NineCouponUtilities, $http, $q,$uibModal, httpBuffer, $rootScope, NineCouponModal) {
        var self = this;
        self.getQrCodeWithAward = function(award) {
            return $resource(baseApiUrl + '/games/box9/qrcode').save(award);
        };

        self.getAwardStatus = function(awardId){
            return $resource(baseApiUrl + '/games/box9/award-id/:id', {id:awardId}).get();
        };

    // {id:'', password:''}
    self.redeemAward = function(obj){
        return $resource(baseApiUrl + '/games/box9/redeem/:id', {id:'@id'}).save(obj);
    };
    self.getAccountInfo = function(){
        return $resource(`${baseApiUrl}/ninecoupon/account`).get()
        .$promise
        .then(function successFunction(success){
            NineCouponUtilities.saveLocalData("account", success, true);
            $rootScope.account = NineCouponUtilities.getLocalData('account', true);
            var reward = NineCouponUtilities.getLocalData("reward", true);
            if(reward){
                self.takeOffTheNineCoupon(reward)
                .then((success)=>{
                    var handleModal = function(){
                        let couponArray = NineCouponUtilities.getLocalData('couponArray'+$rootScope.account.id) || [];
                        couponArray = couponArray.filter(function(ele){
                            return !!ele;
                        });
                        couponArray.push(success);
                        NineCouponUtilities.saveLocalData('couponArray'+$rootScope.account.id, couponArray);
                    };
                    NineCouponModal.showQrcodeModal(success, handleModal, handleModal);
                });
            };
            return success;
        });
    };
    self.signup = function(account){
        return $resource(`${baseApiUrl}/ninecoupon/signup`).save({},account).$promise;
    };

    self.login = function(account){
        var deferred = $q.defer();
        var promise = deferred.promise;
        var data = `username=${account.name}&password=${account.password}&grant_type=password`;
        var post = $http.post(`${baseApiUrl}/oauth/token`, data, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept": "application/json",
                "Authorization": "Basic bmluZWNvdXBvbldpZmk6OWEwMTM4MjdiYjY2"
            }
        }).then(function (response) {
            var expiredAt = new Date();
            var token = response.data;
            expiredAt.setSeconds(expiredAt.getSeconds() + token.expires_in);
            token.expires_at = expiredAt.getTime();
            NineCouponUtilities.saveLocalData('token', token);
            deferred.resolve(response);
            httpBuffer.retryAll();
        },function (error) {
            deferred.reject(error);
        });
        return promise;
    };
    self.logoutAccount = function logoutAccount(){
        NineCouponUtilities.removeLocalData("token");
        NineCouponUtilities.removeLocalData("account");
        $rootScope.account = undefined;
        var defered = $q.defer();
        defered.resolve("ok")
        return defered.promise;
    };
    self.getUserNineCouponsToAwards = function getUserNineCouponsToAwards(areaIndex){
        return $resource(`${baseApiUrl}/ninecoupon/coupon/wifi/:areaIndex`, {areaIndex:areaIndex}).query().$promise;
    };
    self.takeOffTheNineCoupon = function takeOffTheNineCoupon(coupon){
        coupon.randomId = Math.floor(Math.random() * 100000);
        return $resource(`${baseApiUrl}/ninecoupon/coupon`).save({}, coupon).$promise;
    };
    self.refreshToken = function refreshToken(){
        var token = NineCouponUtilities.getLocalData("token");
        var deferred = $q.defer();
        var promise = deferred.promise;
        var data = "refresh_token=" +  token.refresh_token + "&grant_type=refresh_token";
        $http.post(`${baseApiUrl}/oauth/token`, data, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept": "application/json",
                "Authorization": "Basic bmluZWNvdXBvbldpZmk6OWEwMTM4MjdiYjY2"
            }
        }).then(function (response) {
            var expiredAt = new Date();
            var token = response.data;
            expiredAt.setSeconds(expiredAt.getSeconds() + token.expires_in);
            token.expires_at = expiredAt.getTime();
            NineCouponUtilities.saveLocalData('token', token);
            deferred.resolve(response);
            httpBuffer.retryAll();
        }, function (error) {
            deferred.reject(error);
        });
        return promise;
    };
    self.queryMyCoupons = function queryMyCoupons(){
        return $resource(`${baseApiUrl}/ninecoupon/coupon/list`).query().$promise;
    }
}]);
app.factory("NineCouponModal", function($uibModal){
    return {
        showQrcodeModal: function showQrcodeModal(couponInstance, positiveFunc, negativeFunc){
            var theConfig = {award:couponInstance};
            var theModal = $uibModal.open({
                animation: true,
                size: 'lg',
                templateUrl : 'views/qrcode.html',
                controller:"QrCodeController",
                resolve:{
                    QrCodeModelConfig: function(){
                        return theConfig;
                    }
                },
                windowClass:'ninecoupon-qrcode-background'
            });
            theModal.result.then(positiveFunc, negativeFunc);
        }

    }
})

app.factory('NineCouponUtilities',function(localStorageService){
    return {
        guid : function guid(){
            /** it just version 4 guid **/
            function s4(){
                return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
            };
            return [s4(), s4(), '-', s4(), '-', s4(), '-', s4(), s4(), s4()].join('');
        },
        getLocalData: function getLocalData(dataKey, needDecode){
            if(dataKey){
                var info = localStorageService.get(dataKey);
                try{
                    if(info){
                        return JSON.parse(needDecode ? this.base64decode(info) : info);
                    };
                } catch (error){
                    console.log( error);
                }
            };
        },
        saveLocalData: function saveLocalData(dataKey, data, needEncode){
            if(dataKey){
                var info = JSON.stringify(data);
                localStorageService.set(dataKey, needEncode? this.base64encode(info): info);
            };
        },
        removeLocalData:function removeLocalData(dataKey){
            localStorageService.remove(dataKey);
        },
        base64encode: function base64encode(input){
            return btoa(encodeURIComponent(input).replace(/%([0-9A-F]{2})/g, function(matach,p1){
                return String.fromCharCode(parseInt('0x'+p1, 16));
            }));            
        },
        base64decode: function base64decode(input){
            return decodeURIComponent(Array.prototype.map.call(atob(input), function(c){
                return '%'+('00'+c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
        }
    }
});
app.factory('wifiHttpInterceptor', function($q, NineCouponUtilities, httpBuffer, $rootScope) {
    return {
        // optional method
        'request': function(config) {
            if(config.url.indexOf('/ninecoupon/coupon/wifi')>-1){
                //无需授权
                return config;
            }else if (config.url.indexOf('/ninecoupon/') > -1){
                //使用token
                var token = NineCouponUtilities.getLocalData('token');
                if(token){
                    config.headers.Authorization =  `Bearer ${ token.access_token}`;
                }
            }else if(config.url.indexOf('/oauth/token')> -1){
                //使用密码或者refresh_token
            }
            // do something on success
            return config;
        },

        // optional method
        'requestError': function(rejection) {
            // do something on error
            if (canRecover(rejection)) {
                return responseOrNewPromise
            }
            return $q.reject(rejection);
        },



        // optional method
        'response': function(response) {
            // do something on success
            return response;
        },

        // optional method
        'responseError': function(rejection) {
            // do something on error
            //401 而且不是 更新 token
            var token = NineCouponUtilities.getLocalData("token");
            let retriablle = rejection.status == 401 && rejection.config.url.indexOf('/oauth/token') == -1 && token && token.refresh_token;
            if(retriablle){
                var deferred = $q.defer();
                httpBuffer.append(rejection.config, deferred);
                $rootScope.$broadcast('event:auth-refreshToken', rejection);
            }else{
                httpBuffer.rejectAll();
                NineCouponUtilities.removeLocalData("token")
                NineCouponUtilities.removeLocalData("account");
            };
            return $q.reject(rejection);
        }
    };
})
.factory('httpBuffer', ["$injector","$rootScope","baseApiUrl", function ($injector, $rootScope, baseApiUrl){
    var buffer = [];
    var $http;
    var pathBeginIndex = baseApiUrl.length;
    function retryHttpRequest(config, deferred) {
        function successCallback(response) {
            deferred.resolve(response);
            var eventsIdentifier = config.url.substring(pathBeginIndex);
            $rootScope.$broadcast("events:"+eventsIdentifier, response);
        };
        function errorCallback(response) {
            deferred.reject(response);
        };
        $http = $http || $injector.get('$http');
        $http(config).then(successCallback, errorCallback).$promise;
    }

    return {
        append: function(config, deferred) {
            buffer.push({
                config: config,
                deferred: deferred
            });
        },
        rejectAll: function(reason) {
            if (reason) {
                for (var i = 0; i < buffer.length; ++i) {
                    buffer[i].deferred.reject(reason);
                }
            }
            buffer.length = 0;
        },
        retryAll: function(updater) {
            for (var i = 0; i < buffer.length; ++i) {
                retryHttpRequest((updater && updater(buffer[i].config)) || buffer[i].config, buffer[i].deferred);
            }
            buffer.length = 0;
        }
    };
}])

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