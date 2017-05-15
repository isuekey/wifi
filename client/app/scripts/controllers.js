"user strict";

angular.module("wifi")
.controller('ContentController', ['$rootScope', function($rootScope) {
    $rootScope.bgStyle = {};
}])
.controller('RedeemController', ['$rootScope', '$scope', 'box9GameServices', '$stateParams', function($rootScope, $scope, box9GameServices, $stateParams) {

    $scope.store = {
        name: 'test',
        storeName: 'xx餐厅',
    };

    $scope.password = '';

    $scope.redeem = function() {
        box9GameServices.redeemAward({ id: $stateParams.id, password: $scope.password })
        .$promise
        .then(function(res) {
            if (res.success) {
                bootbox.alert('客户兑换' + res.data.title + res.data.desc + res.data.price + '成功');
            }
        }, function(res) {
            bootbox.alert('商户账户/密码有误，请确认后重新输入。')
        });
    };

    $scope.redeem();
}])
.controller('LoginController', ['$rootScope', '$scope', 'box9GameServices', 'localStorageService','$state', 
function($rootScope, $scope, box9GameServices,localStorageService, $state){
    $scope.account = {};
    $rootScope.account = undefined;
    $scope.login = function(){
        box9GameServices.login($scope.account)
        .then((success)=>{
            console.log(success);
            $state.go("app.coupons");
        }, (error)=>{
            console.log(error);
        });
    };
}])
.controller('IndexController',['$rootScope', '$scope', 'box9GameServices', '$state', '$stateParams', 'localStorageService',
function($rootScope, $scope, box9GameServices, $state, $stateParams, localStorageService){
    $scope.getUserNineCouponsForAwards = function getUserNineCouponsForAwards(areaId){
        box9GameServices.getUserNineCouponsToAwards(areaId)
        .$promise
        .then(function successFunction(success){
            console.log(success);
            $rootScope.nineCopons.length = 0;
            Array.prototype.push.apply($rootScope.nineCopons, success.map(function mapFunction(ele, idx, array){
                return {
                    /** { title: '地产', desc: '买房立减', price: '￥ 5000' } **/
                    title: ele.templatename,
                    desc: ele.shopname,
                    data: ele.data,
                    id: ele.id,
                    origin:ele.origin,
                    shopid:ele.shopid,
                    strategyid: ele.strategyid,
                    price: `${ele.data.offset}`
                };
            }));
            $state.go('app.game9box');
        }, function errorFunction(error){
            console.log(error)
        })
    };
    var areaId = $stateParams["areaId"];
    $rootScope.areaId = areaId;
    console.log($rootScope.areaId);
    if(!areaId){
        areaId = localStorageService.get('areaId');
    }else{
        localStorageService.set('areaId', areaId);
    };
    if(areaId && !$rootScope.poolTimes){
        $scope.getUserNineCouponsForAwards(areaId);
    }else{

        // 这里需要提示 
    }
    if($rootScope.account){
    };
}])
.controller('MyCouponController', ['$rootScope', '$scope', '$uibModal', 'localStorageService',
function($rootScope, $scope, $uibModal, localStorageService){
    $scope.couponListModel = {
        data:{
            projectList:[]
        }
    };
    let couponArray = (localStorageService.get('couponArray') || []).filter((ele)=>{
        return !!ele;
    }); 
    $scope.couponListModel.data.projectList.length = 0;
    Array.prototype.push.apply($scope.couponListModel.data.projectList, couponArray);
    $scope.showQrCode = function showQrCode(couponItem){
        var theConfig = {award:couponItem};
        var theModal = $uibModal.open({
            animation: true,
            size: 'lg',
            templateUrl : 'views/qrcode.html',
            controller:"QrCodeController",
            resolve:{
                QrCodeModelConfig: function(){
                    return theConfig;
                }
            }
        });
    };
}])
.controller('QrCodeController', ['$rootScope', '$scope', '$uibModalInstance','QrCodeModelConfig', 
function($rootScope, $scope, $uibModalInstance, QrCodeModelConfig){
    console.log(QrCodeModelConfig);
    var coupon = angular.toJson(QrCodeModelConfig.award);
    var origin = QrCodeModelConfig.award;
    $scope.qrcodeModel = {
        data : coupon,
        origin: origin,
        title: `由店家 ${ origin.desc} 提供的 消费满${origin.data.consumption} 抵用 ${origin.data.offset}`
    };

}])
.controller('Game9BoxController', ['$rootScope', '$scope', '$window', 'box9GameServices', '$timeout', '$interval','$state','$uibModal','localStorageService',"EnnUtilities",
function($rootScope, $scope, $window, box9GameServices, $timeout, $interval, $state, $uibModal,localStorageService,EnnUtilities) {
    (function init() {
        $scope.bkpStyle = $rootScope.bgStyle;
        $rootScope.bgStyle = {
            'background': 'url(assets/images/9gimages/bg.jpg)',
            'background-size': 'cover'
        };
        $scope.$on('$destroy', function(e) {
            $rootScope.bgStyle = $scope.bkpStyle;
        });
    }());
    if($rootScope.nineCopons.length == 0){
        $state.go('app.index');
        return;
    };

    var bW = $window.innerWidth;
    var bH = browseHeight;


    var realTimeAwardStatusCheck;
    $scope.$on('$destroy', function() {
        disableChecker();
    });
    var disableChecker = function() {
        if (realTimeAwardStatusCheck) {
            $interval.cancel(realTimeAwardStatusCheck);
        }
    };


    var bounceWav = new Audio('/assets/wav/bounce.wav');

    var canvas = new fabric.Canvas('box9canvas', {
        width: $window.innerWidth,
        height: bH,
        selection: false
    });


    var colorArray = ['#a7d3fd', '#e6cdfe', '#fae2fa', '#f7e9a7', '#e1fddb', '#d7e8fd', '#b7f3ed', '#fedef6', '#fce4c2', ];
    colorArray = _.sampleSize(colorArray, colorArray.length);
    var awards = $rootScope.nineCopons;
    /** [
    { title: '地产', desc: '买房立减', price: '￥ 5000' },
    { title: '美发', desc: '现金券', price: '￥ 30' },
    { title: '美发', desc: '现金券', price: '￥ 100' },
    { title: '培训', desc: '免费体验券', price: '2 次' },
    { title: '美甲', desc: '现金券', price: '￥ 50' },
    { title: '餐厅', desc: '现金券', price: '￥ 20' },
    { title: '琴行', desc: '报名立减', price: '￥ 100' },
    { title: '口腔', desc: '现金券', price: '￥ 100' },
    { title: '盲人按摩', desc: '现金券', price: '￥ 50' },
    ];
    **/
    awards = _.sampleSize(awards, awards.length);
    async.parallel({
        boxImg: function(cb) {
            fabric.Image.fromURL('assets/images/9gimages/box.png', function(boxBgImg) {
                cb(null, boxBgImg);
            }, {
                width: 275,
                height: 295,
                selectable: false
            });
        },
        starMasks: function(cb) {
            async.map(new Array(9), function(url, innerCb) {
                fabric.Image.fromURL('assets/images/9gimages/box_behind.png', function(boxMask) {
                    innerCb(null, boxMask);
                }, { width: 70, height: 70 });
            }, function(err, results) {
                cb(err, results);
            });
        },
        ticketsFly: function(cb) {
            fabric.Sprite.fromURL('assets/images/9gimages/tickets_fly.png', function(sprite) {
                cb(null, sprite);
            },{originX:'center', originY:'bottom', left:$window.innerWidth/2, top:bH - 10});
        }
    }, function(err, results) {
        var rects = [],
        textGroups = [],
        starMasks = results.starMasks;
        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 3; j++) {
                var left = 29 + 73 * i;
                var top = 48 + 73 * j;
                var gW = 70, gH = 70;

                var rect = new fabric.Rect({
                    left: left,
                    top: top,
                    rx: 10,
                    ry: 10,
                    opacity: 0.2,
                    width: gW,
                    height: gH,
                    fill: colorArray.pop(),
                    cornerStyle: 'circle'
                });
                rects.push(rect);

                var rectBorder = new fabric.Rect({
                    left: left,
                    top: top,
                    rx: 10,
                    ry: 10,
                    width: gW - 4,
                    height: gH - 4,
                    stroke: 'red',
                    strokeWidth: 5,
                    fill: undefined,
                    cornerStyle: 'circle',
                    opacity: 0
                });
                rects.push(rectBorder);

                var award = awards.pop();
                var title = new fabric.Text(award.title, {
                    left: gW / 2,
                    top: 20,
                    originX: 'center',
                    originY: 'center',
                    fontSize: 14
                });
                var desc = new fabric.Text(award.desc, {
                    left: gW / 2,
                    top: 30,
                    originX: 'center',
                    fontSize: 14
                });
                var price = new fabric.Text(award.price, {
                    left: gW / 2,
                    top: 47,
                    originX: 'center',
                    fontSize: 18
                });
                var textGroup = new fabric.Group([title, desc, price], {
                    left: left,
                    top: top,
                    width: gW,
                    height: gH
                });
                textGroups.push(textGroup);

                var mask = results.starMasks[i * 3 + j];
                mask.left = left;
                mask.top = top;
                mask.lockMovementX = true;
                mask.lockMovementY = true;
                mask.hasBorders = mask.hasControls = false;
                mask.rect = rect;
                mask.rectBorder = rectBorder;
                mask.award = award;

                mask.on('selected', function(e) {
                    var that = this;
                    this.off('selected');
                    this.rect.opacity = 1;
                    removeAllStarMasks(_.without(starMasks, this));
                    this.animate('opacity', 0, {
                        onChange: canvas.renderAll.bind(canvas),
                        // duration: 500 * 8,
                        onComplete: function() {

                            function loop() {
                                that.rectBorder.animate('opacity', that.rectBorder.getOpacity() < 0.5 ? 1 : 0, {
                                    // duration: 500,
                                    onChange: canvas.renderAll.bind(canvas),
                                    onComplete: loop
                                });
                            }
                            loop();
                            $rootScope.poolTimes = 1;
                            if($rootScope.account){
                                box9GameServices.takeOffTheNineCoupon(that.award)
                                .$promise
                                .then((success)=>{
                                    that.award.instanceId = success.id;
                                    that.award.consumer = success.account;
                                    var theConfig = {award:that.award};
                                    var theModal = $uibModal.open({
                                        animation: true,
                                        size: 'lg',
                                        templateUrl : 'views/qrcode.html',
                                        controller:"QrCodeController",
                                        resolve:{
                                            QrCodeModelConfig: function(){
                                                return theConfig;
                                            }
                                        }
                                    });
                                    theModal.result.then(function(){
                                        let couponArray = localStorageService.get('couponArray') || [];
                                        couponArray = couponArray.filter(function(ele){
                                            return !!ele;
                                        });
                                        couponArray.push(that.award);
                                        localStorageService.set('couponArray', couponArray);
                                    }, function(){
                                        let couponArray = localStorageService.get('couponArray') || [];
                                        couponArray = couponArray.filter(function(ele){
                                            return !!ele;
                                        });
                                        couponArray.push(that.award);
                                        localStorageService.set('couponArray', couponArray);
                                    });
                                });
                            }else{
                                EnnUtilities.saveLocalData('reward', that.reward, true);
                                $rootScope.$broadcast('event:auth-goto-login', "need login");
                            };
                            /**
                            that.award.awardId = fabric.util.getRandomInt(10000, 99999);
                            box9GameServices.getQrCodeWithAward(that.award)
                            .$promise
                            .then(function(res) {
                                showQrCode(res.path);
                                realTimeAwardStatusCheck = $interval(function() {
                                    box9GameServices.getAwardStatus(that.award.awardId)
                                    .$promise
                                    .then(function(res) {
                                        console.log(res);
                                        if (res.isAwarded) {
                                            $interval.cancel(realTimeAwardStatusCheck);
                                            bootbox.alert('兑换' + that.award.title + that.award.desc + that.award.price + '成功');
                                        }
                                    });
                                }, 1000);

                            }, function(res) {
                                console.log(res);
                            });
                            **/
                        }
                    });
                });
            };
        };
        var boxGroup = new fabric.Group(_.concat(results.boxImg, rects, textGroups, starMasks), {
            top: 0,
            left: $window.innerWidth / 2,
            width: 275,
            height: 295,
            originX: 'center',
            originY: 'bottom'
        });
        canvas.add(boxGroup);
        $timeout(function() {
            bounceWav.play();
            canvas.add(results.ticketsFly);
            results.ticketsFly.play(function() {
                results.ticketsFly.stop();
                results.ticketsFly.remove();
            });
        }, 400);
        boxGroup.animate('top', bH - 10, {
            duration: 1000,
            onChange: canvas.renderAll.bind(canvas),
            easing: fabric.util.ease['easeOutBounce'],
            onComplete: function() {
                ungroup(boxGroup, canvas);
            }
        });
    });
    canvas.on({
        'object:selected': function(se) {
            console.log(se);
        }
    });


    var showQrCode = function(qrPath) {
        async.parallel({
            qrCode: function(cb) {
                fabric.Image.fromURL(qrPath, function(img) {
                    cb(null, img);
                }, { width: 200, height: 200, originY: 'top', originX: 'center', selectable: false });
            },
            successBg: function(cb) {
                fabric.Image.fromURL('assets/images/9gimages/win_bg.png', function(img) {
                    cb(null, img);
                }, { width: 326, height: 396, originY: 'top', originX: 'center', selectable: false });
            },
            successBtn: function(cb) {
                fabric.Image.fromURL('assets/images/9gimages/win_btn.png', function(img) {
                    cb(null, img);
                }, { width: 156, height: 36, originY: 'center', originX: 'center', lockMovementX: true, lockMovementY: true, hasControls: false, hasBorders: false });
            }
        }, function(err, results) {
            var gW = $window.innerWidth;
            var gH = 430;
            var grayBg = new fabric.Rect({
                left: 0,
                top: 0,
                height: bH,
                width: $window.innerWidth,
                fill: 'black',
                opacity: 0,
                selectable: false
            });

            var title = new fabric.Text('恭喜您', {
                top: 25,
                left: gW / 2,
                originY: 'center',
                originX: 'center',
                fontSize: 25,
                fill: 'white',
                selectable: false
            });

            var subtitle = new fabric.Text('二维码是您唯一的消费凭证', {
                top: gH - 130,
                left: gW / 2,
                originY: 'center',
                originX: 'center',
                fill: '#cf9c73',
                fontSize: 14,
                selectable: false
            });

            var subtitle2 = new fabric.Text('请截屏保存，消费时请商家扫描确认。', {
                top: gH - 110,
                left: gW / 2,
                originY: 'center',
                originX: 'center',
                fill: '#cf9c73',
                fontSize: 14,
                selectable: false
            });

            results.successBg.left = gW / 2;
            results.successBg.top = 0;
            results.qrCode.left = gW / 2;
            results.qrCode.top = 80;
            results.successBtn.left = gW / 2;
            results.successBtn.top = gH - 70;

            var winMsgGroup = new fabric.Group([results.successBg, results.successBtn, results.qrCode, title, subtitle, subtitle2], {
                top: 60,
                height: 425,
                left: $window.innerWidth / 2,
                width: $window.innerWidth,
                originX: 'center',
                originY: 'top',
                opacity: 0,
                selectable: false
            });

            results.successBtn.on('selected', function(e) {
                grayBg.remove();
                results.successBg.remove();
                results.successBtn.remove();
                results.qrCode.remove();
                title.remove();
                subtitle.remove();
                subtitle2.remove();
                disableChecker();
            });

            canvas.add(grayBg);
            canvas.add(winMsgGroup);

            winMsgGroup.animate('opacity', 1, {
                duration: 1500,
                onChange: canvas.renderAll.bind(canvas),
                onComplete: function() {
                    ungroup(winMsgGroup, canvas);
                }
            });

            grayBg.animate('opacity', 0.7, {
                duration: 1500,
                onChange: canvas.renderAll.bind(canvas)
            });

            canvas.renderAll();
        });
    };


    var ungroup = function(group, canvas) {
        var items = group._objects;
        group._restoreObjectsState();
        canvas.remove(group);
        for (var i = 0; i < items.length; i++) {
            canvas.add(items[i]);
        }
        canvas.renderAll();
    };

    var removeAllStarMasks = function(starMasks) {
        starMasks.forEach(function(e) {
            e.off('selected');
            duration = 500 * fabric.util.getRandomInt(1, 7);
            e.animate('opacity', 0, {
                onChange: canvas.renderAll.bind(canvas),
                duration: duration
            });
        });
    };
    (function render() {
        canvas.renderAll();
        fabric.util.requestAnimFrame(render);
    })();
}]);
