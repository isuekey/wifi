"user strict";angular.module("wifi").controller("ContentController",["$rootScope",function(e){e.bgStyle={}}]).controller("Game9BoxController",["$rootScope","$scope",function(e,t){!function i(){t.bkpStyle=e.bgStyle,e.bgStyle={background:"url(assets/images/9gimages/bg.jpg)","background-size":"cover"},t.$on("$destroy",function(i){e.bgStyle=t.bkpStyle})}();var i=new fabric.Canvas("box9canvas",{width:275,height:295,selection:!1}),o=[],r=["#a7d3fd","#e6cdfe","#fae2fa","#f7e9a7","#e1fddb","#d7e8fd","#b7f3ed","#fedef6","#fce4c2"];r=_.sampleSize(r,r.length);var c=[{title:"地产",desc:"买房立减",price:"￥ 5000"},{title:"美发",desc:"现金券",price:"￥ 30"},{title:"美发",desc:"现金券",price:"￥ 100"},{title:"培训",desc:"免费体验券",price:"2 次"},{title:"美甲",desc:"现金券",price:"￥ 50"},{title:"餐厅",desc:"现金券",price:"￥ 20"},{title:"琴行",desc:"报名立减",price:"￥ 100"},{title:"口腔",desc:"现金券",price:"￥ 100"},{title:"盲人按摩",desc:"现金券",price:"￥ 50"}];c=_.sampleSize(c,c.length),i.setBackgroundImage("assets/images/9gimages/box.png",i.renderAll.bind(i),{width:275,height:295});for(var n=function(e){var t=29+73*e.i,n=48+73*e.j,a=70,d=70;e.left=t,e.top=n,e.width=a,e.height=d,e.lockMovementX=!0,e.lockMovementY=!0,e.hasBorders=e.hasControls=!1,o.push(e);var l=new fabric.Rect({left:t,top:n,rx:10,ry:10,opacity:.5,width:a,height:d,fill:r.pop(),cornerStyle:"circle"}),f=c.pop(),s=new fabric.Text(f.title,{left:t+a/2,top:n+20,originX:"center",originY:"center",fontSize:14}),g=new fabric.Text(f.desc,{left:t+a/2,top:n+30,originX:"center",fontSize:14}),p=new fabric.Text(f.price,{left:t+a/2,top:n+47,originX:"center",fontSize:18});i.add(l),i.add(s),i.add(g),i.add(p),i.add(e),e.rect=l,e.award=f},a=0;a<3;a++)for(var d=0;d<3;d++)fabric.Image.fromURL("assets/images/9gimages/box_behind.png",n,{i:a,j:d});i.on({"object:moving":function(e){e.target.opacity=.5},"object:modified":function(e){e.target.opacity=1},"object:selected":function(e){e.target.rect.opacity=1,o.forEach(function(t){var o=t===e.target?4e3:500*fabric.util.getRandomInt(1,7);t.animate("opacity",0,{onChange:i.renderAll.bind(i),duration:o})})}})}]);