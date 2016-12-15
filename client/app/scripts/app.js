'use strict';
var app = angular.module('wifi', [
        // 'angularUtils.directives.dirPagination',
        'ngResource',
        'ui.router',
        // 'ae-datetimepicker'
    ])
    .config(function($stateProvider, $urlRouterProvider ) {
        $stateProvider
            .state('app', {
                url: '/',
                views: {
                    'header': {
                        templateUrl: 'views/header.html',
                        // controller: 'HeaderController'
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
                onEnter:function($state){
                    $state.go('app.game9box');
                }
            })
            .state('app.game9box',{
                url:'^/game-9box',
                views:{
                    'content@':{
                        templateUrl: 'views/game-9box.html',
                        controller: 'Game9BoxController'
                    }
                },

            })
            .state('app.redeem',{
                url:'^/qrcode-redeem/:id',
                views:{
                    'content@':{
                        templateUrl: 'views/redeem.html',
                        controller: 'RedeemController'
                    }
                }
            })
          ;
        $urlRouterProvider.otherwise('/index');
    })
    ;

// app.run(['', function(){

// }]);
