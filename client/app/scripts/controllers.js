"user strict";

angular.module("wifi")
.controller('ContentController', ['$rootScope', function($rootScope) {
    $rootScope.bgStyle = {};
}])
.controller('RedeemController', ['$rootScope', '$scope', 'box9GameServices', '$stateParams', function($rootScope, $scope, box9GameServices, $stateParams) {

    $scope.store = {
        name: 'test',
        storeName: 'xx餐厅'
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
            bootbox.alert('商户账户/密码有误，请确认后重新输入。');
        });
    };

    $scope.redeem();
}])
.controller('SignUpController', ['$rootScope', '$scope', 'box9GameServices','$state', 
function($rootScope, $scope, box9GameServices, $state){
    $scope.account = {};
    $rootScope.account = undefined;
    $scope.signup = function(){
        box9GameServices.signup($scope.account).then(function(createdAccount){
            console.log(createdAccount);
            return box9GameServices.login({
                name: $scope.account.account,
                password: $scope.account.password
            });
        }).then(function(successToken){
            console.log(successToken);
            return box9GameServices.getAccountInfo();
        }).then(function(accountInfo){
            console.log(accountInfo);
            $state.go("app.coupons");
        }).catch(function(error){
            console.log(error);
        });
    };
}])
.controller('LoginController', ['$rootScope', '$scope', 'box9GameServices','$state', 
function($rootScope, $scope, box9GameServices, $state){
    $scope.account = {};
    $rootScope.account = undefined;
    $scope.login = function(){
        box9GameServices.login($scope.account)
        .then(function(success){
            box9GameServices.getAccountInfo().then(function(res){
                console.log(res);
                $state.go("app.coupons");
            });
        }, function(error){
            console.log(error);
        });
    };
}])
.controller('IndexController',['$rootScope', '$scope', 'box9GameServices', '$state', '$stateParams', 'NineCouponUtilities',"NineCouponValues",
function($rootScope, $scope, box9GameServices, $state, $stateParams, NineCouponUtilities,NineCouponValues){
    $scope.getUserNineCouponsForAwards = function getUserNineCouponsForAwards(areaId){
        NineCouponValues.retryTimes.wifi++;
        box9GameServices.getUserNineCouponsToAwards(areaId)
        .then(function successFunction(success){
            console.log(success);
            $rootScope.nineCopons.length = 0;
            Array.prototype.push.apply($rootScope.nineCopons, success.map(function mapFunction(ele, idx, array){
                var result = angular.extend({}, ele);
                result.title = ele.templatename;
                result.desc = ele.shopname;
                if(ele.data.offset){//抵用策略
                    result.price = ""+ele.data.offset;
                };
                return result;
            }));
            $state.go('app.game9box');
        }, function errorFunction(error){
            console.log(error);
        });
    };
    var areaId = $stateParams["areaId"];
    $rootScope.areaId = areaId;
    console.log($rootScope.areaId);
    if(!areaId){
        areaId = NineCouponUtilities.getLocalData('areaId');
    }else{
        NineCouponUtilities.saveLocalData('areaId', areaId);
    };
    if(areaId && !$rootScope.poolTimes && NineCouponValues.retryTimes.wifi < 4){
        $scope.getUserNineCouponsForAwards(areaId);
    }else{
        $state.go("app.coupons");
    };
}])
.controller('MyCouponController', ['$rootScope', '$scope', '$uibModal', 'NineCouponUtilities',"box9GameServices","NineCouponModal",
function($rootScope, $scope, $uibModal, NineCouponUtilities,box9GameServices, NineCouponModal){
    $scope.couponListModel = {
        data:{
            couponList:[]
        }
    };
    var couponArray = (NineCouponUtilities.getLocalData('couponArray'+$rootScope.account.id) || []).filter(function(ele){
        return !!ele;
    }); 
    $scope.displayCouponList = function displayCouponList(){
        $scope.couponListModel.data.couponList.length = 0;
        Array.prototype.push.apply($scope.couponListModel.data.couponList, couponArray);
    };
    $scope.successMyCoupon = function successMyCoupon(success){
        var effectiveCouponsList = success.map(function(ele, idx, array){
            return ele;
        });
        var effectiveMap = {};
        effectiveCouponsList.forEach(function(ele){
            effectiveMap[ele.id] = ele;
        });
        var couponMap = {};
        couponArray.forEach(function(ele, idx, array){
            couponMap[ele.id] = ele;
        });
        couponArray.forEach(function(ele){
            var effective = effectiveMap[ele.id];
            if(!effective){
                ele.status = "useless";
            };
        });
        Array.prototype.push.apply(couponArray, effectiveCouponsList.filter(function(ele, idx, array){
            var hasTheCoupon = couponMap[ele.id];
            return !hasTheCoupon;
        }));
        NineCouponUtilities.saveLocalData('couponArray'+$rootScope.account.id, couponArray);
        $scope.displayCouponList();
    };
    $scope.onRetrySuccess = function onRetrySuccess(scopeInfo, response){
        $scope.successMyCoupon(response.data);
    };
    $rootScope.$on("events:/ninecoupon/coupon/list", $scope.onRetrySuccess);
    $scope.queryMyCoupons = function queryMyCoupons(){
        $scope.displayCouponList();
        box9GameServices.queryMyCoupons().then($scope.successMyCoupon , function errorMyCoupon(error){
            //todo 提示信息
        });
    };
    $scope.showQrCode = function showQrCode(couponItem){
        NineCouponModal.showQrcodeModal(couponItem, angular.noop, angular.noop);
    };
    $scope.showCouponInfo = function showCouponInfo(couponItem){
        return couponItem.data.offset + "元";
    };
    $scope.queryMyCoupons();
}])
.controller('QrCodeController', ['$rootScope', '$scope', '$uibModalInstance','QrCodeModelConfig', 
function($rootScope, $scope, $uibModalInstance, QrCodeModelConfig){
    console.log(QrCodeModelConfig);
    var couponInfo = QrCodeModelConfig.award;
    var couponString = angular.toJson({
        id : couponInfo.id,
        shopId: couponInfo.shopId,
        account: couponInfo.account
    });
    $scope.qrcodeModel = angular.extend({}, couponInfo);
    $scope.qrcodeModel.qrcode = couponString;
}])
.controller('Game9BoxController', ['$rootScope', '$scope', '$window', 'box9GameServices', '$timeout', '$interval','$state','$uibModal',"NineCouponUtilities","NineCouponValues","NineCouponModal",
function($rootScope, $scope, $window, box9GameServices, $timeout, $interval, $state, $uibModal,NineCouponUtilities,NineCouponValues,NineCouponModal) {
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
                            var takeOffSuccess = function takeOffSuccess(success){
                                function showCouponModalResult(){
                                    var couponArray = NineCouponUtilities.getLocalData('couponArray'+$rootScope.account.id) || [];
                                    couponArray = couponArray.filter(function(ele){
                                        return !!ele;
                                    });
                                    couponArray.push(success);
                                    NineCouponUtilities.saveLocalData('couponArray'+$rootScope.account.id, couponArray);
                                    NineCouponUtilities.removeLocalData("reward");
                                };
                                NineCouponModal.showQrcodeModal(success, showCouponModalResult, showCouponModalResult);
                            };
                            if($rootScope.account){
                                $rootScope.$on("events:/ninecoupon/coupon", function(scopeInfo, response){
                                    takeOffSuccess(response.data);
                                });
                                box9GameServices.takeOffTheNineCoupon(that.award)
                                .then(takeOffSuccess);
                            }else{
                                NineCouponUtilities.saveLocalData('reward', that.award, true);
                                $rootScope.$broadcast('event:auth-goto-login', "need login");
                            };
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
            try{
                bounceWav.play();
                canvas.add(results.ticketsFly);
                results.ticketsFly.play(function() {
                    results.ticketsFly.stop();
                    results.ticketsFly.remove();
                });
            }catch(error){

            }
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
