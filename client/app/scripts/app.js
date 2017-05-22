'use strict';
var app = angular.module('wifi', [
    // 'angularUtils.directives.dirPagination',
    'ngResource',
    'ui.router',
    'LocalStorageModule',
    'ui.bootstrap',
    'monospaced.qrcode'
    // 'ae-datetimepicker'
    ])
.config(function($stateProvider, $urlRouterProvider, $httpProvider) {
    $httpProvider.interceptors.push('wifiHttpInterceptor');
    $stateProvider
    .state('app', {
        url: '/',
        views: {
            'header': {
                templateUrl: 'views/header.html'
            },
            'content': {
                templateUrl: 'views/content.html',
                controller: 'ContentController'
            },
            'footer': {
                templateUrl: 'views/footer.html'
            }
        }
    })
    .state('app.index', {
        url: '^/index/:areaId',
        views:{
            'content@': {
                templateUrl: 'views/game-9box.html',
                controller: 'IndexController'
            }
        }
    })
    .state('app.game9box', {
        url: '^/game-9box',
        views: {
            'content@': {
                templateUrl: 'views/game-9box.html',
                controller: 'Game9BoxController'
            }
        }
    })
    .state('app.redeem', {
        url: '^/qrcode-redeem/:id',
        views: {
            'content@': {
                templateUrl: 'views/redeem.html',
                controller: 'RedeemController'
            }
        }
    })
    .state('app.login',{
        url:'^/login',
        views:{
            'content@':{
                templateUrl:'views/login.html',
                controller:'LoginController'
            }
        }
    })
    .state('app.signup',{
        url:'^/signup',
        views:{
            'content@':{
                templateUrl:'views/signup.html',
                controller:'SignUpController'
            }
        }
    })
    .state('app.coupons',{
        url:'^/coupons',
        views:{
            'content@':{
                templateUrl:'views/mycoupons.html',
                controller:'MyCouponController'
            }
        }
    })
    ;
    $urlRouterProvider.otherwise('/index');
})
.value("NineCouponValues",{
    retryTimes:{
        wifi:0
    }
})
.run(function($rootScope, NineCouponUtilities, box9GameServices, $state){
    $rootScope.$on("event:auth-refreshToken", function(){
        box9GameServices.refreshToken();
    });
    $rootScope.$on('event:auth-goto-login', function(){
        $state.go("app.login");
    });
    $rootScope.account = NineCouponUtilities.getLocalData('account', true);
    $rootScope.nineCopons = [];
    $rootScope.areaId = '';
    $rootScope.UUID = NineCouponUtilities.getLocalData('deviceId');
    if(!$rootScope.UUID){
        $rootScope.UUID = NineCouponUtilities.guid();
        NineCouponUtilities.saveLocalData('deviceId', $rootScope.UUID);
    };
    $rootScope.logoutAccount = function logoutAccount(){
        box9GameServices.logoutAccount()
        .then(function(success){
            $state.go("app.login");
        });
    };
});
