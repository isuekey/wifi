"user strict";

angular.module("wifi")
    .controller('ContentController', ['$rootScope', function($rootScope) {
        $rootScope.bgStyle = {};
    }])
    .controller('Game9BoxController', ['$rootScope', '$scope', function($rootScope, $scope) {
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



        var canvas = new fabric.Canvas('box9canvas', {
            width: 275,
            height: 295,
            selection: false
        });

        var boxArray = [];
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

        canvas.setBackgroundImage(
            'assets/images/9gimages/box.png',
            canvas.renderAll.bind(canvas), {
                width: 275,
                height: 295,
            });


        var createImage = function(mask) {
            // base layout
            var left = 29 + 73 * mask.i;
            var top = 48 + 73 * mask.j;
            var gW = 70,
                gH = 70;
            // add image
            mask.left = left;
            mask.top = top;
            mask.width = gW;
            mask.height = gH;
            mask.lockMovementX = true;
            mask.lockMovementY = true;
            mask.hasBorders = mask.hasControls = false;
            boxArray.push(mask);

            // add rect
            var rect = new fabric.Rect({
                left: left,
                top: top,
                rx: 10,
                ry: 10,
                opacity:0.5,
                width: gW,
                height: gH,
                fill: colorArray.pop(),
                cornerStyle: 'circle'
            });

            var award = awards.pop();

            var title = new fabric.Text(award.title, {
                left: left + gW / 2,
                top: top + 20,
                originX: 'center',
                originY: 'center',
                fontSize: 14,
            });
            var desc = new fabric.Text(award.desc, {
                left: left + gW / 2,
                top: top + 30,
                originX: 'center',
                fontSize: 14,
            });
            var price = new fabric.Text(award.price, {
                left: left + gW / 2,
                top: top + 47,
                originX: 'center',
                fontSize: 18,
            });

            canvas.add(rect);
            canvas.add(title);
            canvas.add(desc);
            canvas.add(price);
            canvas.add(mask);
            mask.rect = rect;
            mask.award = award;
        };


        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 3; j++) {
                fabric.Image.fromURL('assets/images/9gimages/box_behind.png', createImage, { i: i, j: j });
            }
        }


        canvas.on({
            'object:moving': function(e) {
                e.target.opacity = 0.5;
            },
            'object:modified': function(e) {
                e.target.opacity = 1;
            },
            'object:selected': function(se) {
                se.target.rect.opacity = 1;
                boxArray.forEach(function(e) {
                    e.selectable = false;
                    var duration = e === se.target ? 500 * 8 : 500 * fabric.util.getRandomInt(1, 7);
                    e.animate('opacity', 0, {
                        onChange: canvas.renderAll.bind(canvas),
                        duration: duration,
                        onComplete: function(){
                          if(e===se.target)
                          {
                            alert('恭喜获得' + se.target.award.title + se.target.award.desc + se.target.award.price);
                          }
                        }
                    });
                });
            },
        });

    }]);
