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
.config(function($stateProvider, $urlRouterProvider) {
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
        url: '^/index',
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
.run(function($rootScope,localStorageService){
    $rootScope.account = localStorageService.get('account');
    $rootScope.nineCopons = [];
});