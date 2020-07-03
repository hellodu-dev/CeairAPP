/******************************************************
	描述下载进度的圆环
******************************************************/

var myProcCanvas = function(id, txtColor, bgColor, bgROColor, bgRIColor){
	var self = this;
	//self.id = id;
	self.txtColor = txtColor;
	self.bgColor = bgColor;  //外环背景颜色  －－ 白色
	self.bgROColor = bgROColor; //外环颜色 －－ 灰色
	self.bgRIColor = bgRIColor;   //内圆颜色－－ 蓝色
	self.PI = Math.PI;
	self.obj = {};
	
	var ee = $$('proc'+id);
	self.width = ee.offsetWidth;
	self.height = ee.offsetHeight;
	
	return self;
}

myProcCanvas.prototype = {
	procssCanvas: function (id, pe){
		//logs('showSector id-->'+id+' pe->'+pe);
		var self = this;
		var startAngle = 0;  //-Math.PI*0.5;
		var deg = pe*360/100;
		var endAngle = self.PI*deg/180;  //Math.PI*(deg/180-0.5);

		self._drawCanvas('cv1-'+id, self.bgRIColor, startAngle, endAngle, deg, id);  //画圆环的前景图
	},
	
	addCanvas: function(id){
		var self = this;
		var w = self.width;
		var h = self.height;
		var ele = $$('cv'+id);
		var tmp = '<canvas id="cv0-'+id+'" width="'+w+'" height="'+h+'"></canvas>'
					+'<canvas id="cv1-'+id+'" class="uabs ub-con" width="'+w+'" height="'+h+'"></canvas>'
					+'<p class="uabs ub-con ub ub-ac ub-pc ulev-1" style="color:'+self.txtColor+'" id="cv2-'+id+'">0%</p>';
		ele.className += ' proc-canvas';
		ele.innerHTML = tmp;
		self.obj[id] = id;
		
		self._drawCanvas('cv0-'+id, self.bgROColor, 0, self.PI*2, 0, id); ////画圆环的背景圆
	},
	
	delCanvas: function(id){
		var self = this;
		var ele = $$('cv'+id);
		ele.className = ele.className.replace(/proc-canvas/g, '');
		ele.innerHTML = '';
		delete self.obj[id];
		//delete self;
	},
	
	_drawCanvas: function(cid, color, sa, ea, deg, id){
		//logs('drawSector cid-->'+cid+' color->'+color+' sa->'+sa+' ea->'+ea+' deg->'+deg);
		var self = this;
		
		if(!self.obj[id] && deg<360 && deg>0) self.addCanvas(id);
		
		var c = $$(cid);
		var cxt = c.getContext("2d");
		var w = c.offsetWidth;
		var h = c.offsetHeight;
		var rx = w/2;
		var ry = h/2;
		var r = h*3/8;
		var startAngle = sa;
		var endAngle = ea;
		
		cxt.beginPath(); 
		cxt.fillStyle = color; //;
		cxt.moveTo(rx, ry);
		cxt.arc(rx,ry,r,startAngle,endAngle,false);
		cxt.lineTo(rx, ry); 
		cxt.fill(); 
		
		//画内部空白圆
		var r0 = r*13/16;
		cxt.beginPath(); 
		cxt.fillStyle = self.bgColor;
		cxt.arc(rx,ry,r0,0,360,false); 
		cxt.fill();
		
		//显示进度百分比数据
		var pet = parseInt(deg*100/360)+'%';
		var txtId = cid.replace('cv0', 'cv2').replace('cv1', 'cv2');
		var ele = $$(txtId);
		if(ele) ele.innerHTML = pet;
	}
}