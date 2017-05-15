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
.run(function($rootScope,localStorageService, EnnUtilities, box9GameServices, $state){
    $rootScope.$on("event:auth-refreshToken", function(){
        box9GameServices.refreshToken();
    });
    $rootScope.$on('event:auth-goto-login', function(){
        $state.go("app.login");
    });
    $rootScope.account = EnnUtilities.getLocalData('account', true);
    $rootScope.nineCopons = [];
    $rootScope.areaId = '';
    $rootScope.UUID = localStorageService.get('deviceId');
    if(!$rootScope.UUID){
        $rootScope.UUID = EnnUtilities.guid();
        localStorageService.set('deviceId', $rootScope.UUID);
    };
});