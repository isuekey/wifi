"user strict";

angular.module("wifi")
  .controller('ContentController', ['$rootScope', function($rootScope) {
    $rootScope.bgStyle = {};
  }])
  .controller('RedeemController', ['$rootScope', '$scope', 'box9GameServices', '$stateParams', function($rootScope, $scope, box9GameServices, $stateParams) {

    $scope.store = {
      name:'test',
      storeName:'xx餐厅',
    };

    $scope.password = '';

    $scope.redeem = function(){
      box9GameServices.redeemAward({id:$stateParams.id, password:$scope.password})
        .$promise
        .then(function(res){
          if(res.success)
          {
            bootbox.alert('客户兑换'+res.data.title+res.data.desc+res.data.price+'成功');
          }
        });
    };

    $scope.redeem();

  }])
  .controller('Game9BoxController', ['$rootScope', '$scope', '$window', 'box9GameServices', '$timeout', '$interval', function($rootScope, $scope, $window, box9GameServices, $timeout, $interval) {
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


    var realTimeAwardStatusCheck;

    $scope.$on('$destroy', function(){
      if(realTimeAwardStatusCheck)
      {
        $interval.cancel(realTimeAwardStatusCheck);
      }
    });

    var bounceWav = new Audio('/assets/wav/bounce.wav');

    // for canvas
    var canvas = new fabric.Canvas('box9canvas', {
      width: $window.innerWidth,
      height: $window.innerHeight,
      selection: false
    });

    var colorArray = ['#a7d3fd', '#e6cdfe', '#fae2fa', '#f7e9a7', '#e1fddb', '#d7e8fd', '#b7f3ed', '#fedef6', '#fce4c2', ];
    colorArray = _.sampleSize(colorArray, colorArray.length);
    var awards = [
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
    awards = _.sampleSize(awards, awards.length);

    // group box and free fall
    async.parallel({
      boxImg: function(cb) {
        fabric.Image.fromURL('assets/images/9gimages/box.png', function(boxBgImg) {
          cb(null, boxBgImg);
        }, {
          width: 275,
          height: 295,
          selectable: false,
        })
      },
      starMasks: function(cb) {
        async.map(new Array(9), function(url, innerCb) {
          fabric.Image.fromURL('assets/images/9gimages/box_behind.png', function(boxMask) {
            innerCb(null, boxMask);
          }, { width: 70, height: 70 });
        }, function(err, results) {
          cb(err, results);
        })
      }
    }, function(err, results) {
      var rects = [],
        textGroups = [],
        starMasks = results.starMasks;
      for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
          var left = 29 + 73 * i;
          var top = 48 + 73 * j;
          var gW = 70,
            gH = 70;

          //rects background
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

          // text group
          var award = awards.pop();
          var title = new fabric.Text(award.title, {
            left: gW / 2,
            top: 20,
            originX: 'center',
            originY: 'center',
            fontSize: 14,
          });
          var desc = new fabric.Text(award.desc, {
            left: gW / 2,
            top: 30,
            originX: 'center',
            fontSize: 14,
          });
          var price = new fabric.Text(award.price, {
            left: gW / 2,
            top: 47,
            originX: 'center',
            fontSize: 18,
          });
          var textGroup = new fabric.Group([title, desc, price], {
            left: left,
            top: top,
            width: gW,
            height: gH,
          })
          textGroups.push(textGroup);

          // starMasks
          var mask = results.starMasks[i * 3 + j];
          mask.left = left;
          mask.top = top;
          mask.lockMovementX = true;
          mask.lockMovementY = true;
          mask.hasBorders = mask.hasControls = false;
          mask.rect = rect;
          mask.award = award;

          // 选中mask的动画duration为 500 * 8， 其余为 500 * random(1,7);
          mask.on('selected', function(e) {
            var that = this;
            // this.selectable = false;
            this.off('selected');
            this.rect.opacity = 1;
            removeAllStarMasks(_.without(starMasks, this));
            this.animate('opacity', 0, {
              onChange: canvas.renderAll.bind(canvas),
              duration: 500 * 8,
              onComplete: function() {
                that.award.awardId = fabric.util.getRandomInt(10000, 99999);
                box9GameServices.getQrCodeWithAward(that.award)
                  .$promise
                  .then(function(res) {
                    // alert('恭喜获得' + that.award.title + that.award.desc + that.award.price);
                    showQrCode(res.path);
                    realTimeAwardStatusCheck = $interval(function() {
                      box9GameServices.getAwardStatus(that.award.awardId)
                        .$promise
                        .then(function(res) {
                          console.log(res);
                          if (res.isAwarded) {
                            $interval.cancel(realTimeAwardStatusCheck);
                            bootbox.alert('兑换'+that.award.title+that.award.desc+that.award.price+'成功');
                          }
                        });
                    }, 1000);

                  }, function(res) {
                    console.log(res);
                  });
              }
            });
          })

        }
      }
      var boxGroup = new fabric.Group(_.concat(results.boxImg, rects, textGroups, starMasks), {
        top: 0,
        left: $window.innerWidth / 2,
        width: 275,
        height: 295,
        originX: 'center',
        originY: 'bottom',
      })
      canvas.add(boxGroup);

      $timeout(function() {
        bounceWav.play();
      }, 400)
      boxGroup.animate('top', $window.innerHeight - 10, {
        duration: 1000,
        onChange: canvas.renderAll.bind(canvas),
        easing: fabric.util.ease['easeOutBounce'],
        onComplete: function() {
          ungroup(boxGroup, canvas);
        }
      })
    });


    canvas.on({
      'object:selected': function(se) {},
    });


    var showQrCode = function(qrPath) {
      async.parallel({
        qrCode: function(cb) {
          fabric.Image.fromURL(qrPath, function(img) {
            cb(null, img);
          }, { width: 200, height: 200, originY: 'top', originX: 'center', selectable: false })
        },
        successBg: function(cb) {
          fabric.Image.fromURL('assets/images/9gimages/win_bg.png', function(img) {
            cb(null, img);
          }, { width: 326, height: 396, originY: 'top', originX: 'center', selectable: false })
        },
        successBtn: function(cb) {
          fabric.Image.fromURL('assets/images/9gimages/win_btn.png', function(img) {
            cb(null, img);
          }, { width: 156, height: 36, originY: 'center', originX: 'center', lockMovementX: true, lockMovementY: true, hasControls: false, hasBorders: false })
        }
      }, function(err, results) {
        var gW = $window.innerWidth;
        var gH = 430;
        var grayBg = new fabric.Rect({
          left: 0,
          top: 0,
          height: $window.innerHeight,
          width: $window.innerWidth,
          fill: 'black',
          opacity: 0,
          selectable: false,
        });

        var title = new fabric.Text('恭喜您', {
          top: 25,
          left: gW / 2,
          originY: 'center',
          originX: 'center',
          fontSize: 25,
          fill: 'white',
          selectable: false,
        })

        var subtitle = new fabric.Text('二维码是您唯一的消费凭证', {
          top: gH - 120,
          left: gW / 2,
          originY: 'center',
          originX: 'center',
          fill: '#cf9c73',
          fontSize: 18,
          selectable: false,
        })

        results.successBg.left = gW / 2;
        results.successBg.top = 0;
        results.qrCode.left = gW / 2;
        results.qrCode.top = 80;
        results.successBtn.left = gW / 2;
        results.successBtn.top = gH - 70;

        var winMsgGroup = new fabric.Group([results.successBg, results.successBtn, results.qrCode, title, subtitle], {
          top: 60,
          height: 425,
          left: $window.innerWidth / 2,
          width: $window.innerWidth,
          originX: 'center',
          originY: 'top',
          opacity: 0,
          selectable: false,
        });

        results.successBtn.on('selected', function(e) {
          grayBg.remove();
          results.successBg.remove();
          results.successBtn.remove();
          results.qrCode.remove();
          title.remove();
          subtitle.remove();
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
          onChange: canvas.renderAll.bind(canvas),
        })

        canvas.renderAll();
      });
    };



    // ungroup could extract to helper
    var ungroup = function(group, canvas) {
      var items = group._objects;
      // translate the group-relative coordinates to canvas relative ones
      group._restoreObjectsState();
      // remove the original group and add all items back to the canvas
      canvas.remove(group);
      for (var i = 0; i < items.length; i++) {
        canvas.add(items[i]);
      }
      // if you have disabled render on addition
      canvas.renderAll();
    };

    var removeAllStarMasks = function(starMasks) {
      starMasks.forEach(function(e) {
        e.off('selected');
        duration = 500 * fabric.util.getRandomInt(1, 7);
        e.animate('opacity', 0, {
          onChange: canvas.renderAll.bind(canvas),
          duration: duration,
        });
      });
    };

  }]);
