	var $support = {
		transform3d: ('WebKitCSSMatrix' in window),
		touch: ('ontouchstart' in window)
	};

	var $E = {
		start: $support.touch ? 'touchstart' : 'mousedown',
		move: $support.touch ? 'touchmove' : 'mousemove',
		end: $support.touch ? 'touchend' : 'mouseup',
		cancel: $support.touch ? 'touchcancel' : '',
		transEnd:'webkitTransitionEnd'
	};

	function getTranslateX(x) {
		return $support.transform3d ? 'translate3d('+x+'px, 0, 0)' : 'translate('+x+'px, 0)';
	}
	function getTranslateY(y) {
		return $support.transform3d ? 'translate3d(0,'+y+'px, 0)' : 'translate(0,'+y+'px)';
	}
	function getPage (event, page) {
		return $support.touch ? event.changedTouches[0][page] : event[page];
	}
var zySlide = function(selector,dir,endFun,lock,transEnd,loop,touchEnabled){
	//logs('new zySlide----------->'+selector);
		var self = this;
		self._locked= lock;
		self.endFun = endFun || null;
		self.transEnd = transEnd||null;
		self.nodes = [];
		self.loop = loop?loop:false;
		self.myClick = true;
		//V:vertical
        //H:horizontal
		self.dir = dir||"H";
		if (selector.nodeType && selector.nodeType == 1) {
			self.element = selector;
		} else if (typeof selector == 'string') {
			self.id=selector;
			self.element = document.getElementById(selector) || document.querySelector(selector);
		}
        self._vendor=(window.navigator.userAgent.indexOf("Android 4.")>=0);
		
		if(self.dir=="H")
			self.element.style.webkitTransform = getTranslateX(0);
		else
			self.element.style.webkitTransform = getTranslateY(0);
		
		self.conf = {};
		self.touchEnabled = touchEnabled?touchEnabled:true;
		self.currentPoint = 0;
		self.currentXY = 0;
		self.scrolling = false;
		self.addLoop = 0;
		self.moveDir = '';

		self.refresh();
		
		//
		self.element.parentNode.addEventListener($E.start, self, false);
		self.element.parentNode.addEventListener($E.move, self, false);
		self.element.addEventListener($E.transEnd, self, false);
		if($E.cancel!="")
		{
			self.element.addEventListener($E.cancel, self, false);
			document.addEventListener($E.cancel, self, false);
		}
		document.addEventListener($E.end, self, false);

		return self;
	}

	zySlide.prototype = {
		handleEvent: function(event) {
			var self = this;
			switch (event.type) {
				case $E.start:
					self._touchStart(event);
					break;
				case $E.move:
					self._touchMove(event);
					break;
				case $E.end:
				case $E.cancel:
					self._touchEnd(event);
					break;
				case 'click':
					self._click(event);
					break;
				case $E.transEnd:
				if(self.transEnd){
					self.transEnd(event);
					
					if(self.loop){
						if(self.currentPoint == self.maxPoint){
							self.moveToPoint(1, '0');
						}
						else if(self.currentPoint == 0){
							self.moveToPoint(self.maxPoint-1, '0');
						}
					}
				}
					break;
			}
		},
		addSection : function(obj){
			var self = this;
			self.element.appendChild(obj);
			self.refresh();
		},
		getSection : function(i){
			var self = this;
			var obj = self.nodes[i];
			if(obj.childNodes[1] && obj.childNodes[1].childNodes[1])
				return obj.childNodes[1].childNodes[1].childNodes[1];
			else
				return obj;
		},
		refresh: function() {
			var self = this;

		var conf = self.conf;
		var currentPoint = self.currentPoint;
		var nodes = self.element.children.length;
		var ms = '';
		if(nodes>1 && self.loop && !self.addLoop){
			var fisrtChild = self.element.children[0];
			var lastChild = self.element.children[nodes-1];
			
			var newFisrtChild = fisrtChild.cloneNode(true);
			var newLastChild = lastChild.cloneNode(true);
			
			self.element.insertBefore(newLastChild,fisrtChild);
			self.element.appendChild(newFisrtChild);
			self.addLoop = 1;
			
			currentPoint = 1;
			ms = '0';
		}

			// setting max point
			self.maxPoint = conf.point || (function() {
				var childNodes = self.element.childNodes,
					itemLength = 0,
					i = 0,
					len = childNodes.length,
					node;
				for(; i < len; i++) {
					node = childNodes[i];
					if (node.nodeType === 1) {
						self.nodes[itemLength]=node;
						itemLength++;
					}
				}
				if (itemLength > 0) {
					itemLength--;
				}
	
				return itemLength;
			})();
			//logs('self.maxPoint----------------'+self.maxPoint);
			// setting distance
			if(self.dir=="H")
				self.distance = parseInt(conf.distance || window.getComputedStyle(self.element,null).width);
			else
				self.distance = parseInt(conf.distance || window.getComputedStyle(self.element,null).height);
			// setting maxX maxY
			self.maxXY = conf.maxXY ? - conf.maxXY : - self.distance * self.maxPoint;
	
		self.moveToPoint(currentPoint, ms);
		},
		hasNext: function() {
			var self = this;
	
			return self.currentPoint < self.maxPoint;
		},
		hasPrev: function() {
			var self = this;
	
			return self.currentPoint > 0;
		},
		toNext: function() {
			var self = this;

			if (!self.hasNext()) {
				return;
			}
			var nextPoint = self.currentPoint + 1;
			var ms = '';
			if(nextPoint > self.maxPoint){
				ms = '0';
				nextPoint = 0;
			}
	
			self.moveToPoint(nextPoint, ms);
		},
		toPrev: function() {
			var self = this;

			if (!self.hasPrev()) {
				return;
			}

			self.moveToPoint(self.currentPoint - 1);
		},
    	moveToPoint: function(point, ms) {
	        var self = this;
			
			var mss = (ms?ms:200) + 'ms';
	
	            self.currentPoint = 
	                (point < 0) ? 0 :
	                (point > self.maxPoint) ? self.maxPoint :
	                parseInt(point);
				
	        self.element.style.webkitTransitionDuration = mss;
            self._setXY(- self.currentPoint * self.distance);
            

            var ev = document.createEvent('Event');
            ev.initEvent('css3flip.moveend', true, false);
            self.element.dispatchEvent(ev);
        },
        _setXY: function(xy) {
            var self = this;
		if(self.loop){
			var mxdis = -self.maxPoint*self.distance;
			if(xy>0 || xy<mxdis) return;
		}

            self.currentXY = xy;
            if(self.dir=="H")
            	self.element.style.webkitTransform = getTranslateX(xy);
            else
            	self.element.style.webkitTransform = getTranslateY(xy);
        },
        _touchStart: function(event) {
            var self = this;
			self.myClick = true;
			//logs('_touchStart() 00----------->');
            if(self._locked)
            {
           		event.preventDefault();
	            event.stopPropagation();
            }
            
            if (!self.touchEnabled) {
                return;
            }

            if (!$support.touch) {
                event.preventDefault();
            }

            self.element.style.webkitTransitionDuration = '0';
            self.scrolling = true;
            self.moveReady = false;
            self.startPageX = getPage(event, 'pageX');
            self.startPageY = getPage(event, 'pageY');
            if(self.dir=="H")
            	self.basePage = self.startPageX;
            else
            	self.basePage = self.startPageY
            self.direction = 0;
            self.startTime = event.timeStamp;
        },
        _touchMove: function(event) {
            var self = this;
			self.myClick = false;
			//logs('_touchMove() 00----------->');
            if(self._locked)
            {
           		event.preventDefault();
	            event.stopPropagation();
            }
            
            if (!self.scrolling) {
                return;
            }
            var pageX = getPage(event, 'pageX'),
                pageY = getPage(event, 'pageY'),
                distXY,
                newXY,
                deltaX,
                deltaY;
			var MMX = screen.width>1200?15:5;
            
            if (!self.moveReady) {
				var _dx = pageX - self.startPageX;
				var _dy = pageY - self.startPageY;
                deltaX = Math.abs(_dx);
                deltaY = Math.abs(_dy);
				//logs('_touchMove() MMX='+MMX+' -----_dx----->'+_dx+'  _dy---->'+_dy);
				if(deltaX>deltaY && deltaX>MMX){
					if(_dx>0) self.moveDir = 'right';
					else self.moveDir = 'left';
				}
				
                if(self.dir=="H"){
	                if (deltaX>deltaY && deltaX > MMX) {
						if(self._vendor)//Android 4.0 need prevent default
					    {
					   		event.preventDefault();
					    }
	                    self.moveReady = true;
	                    self.element.parentNode.addEventListener('click', self, true);
	                }
	                else if (deltaY > MMX) {
	                    self.scrolling = false;
	                }
                }else{
                	if (deltaY>deltaX && deltaY> MMX) {
						if(self._vendor)//Android 4.0 need prevent default
					    {
					   		event.preventDefault();
					    }
	                    self.moveReady = true;
	                    self.element.parentNode.addEventListener('click', self, true);
	                }
	                else if (deltaX > MMX) {
	                    self.scrolling = false;
	                }
                }
            }
            if (self.moveReady) {
                //event.preventDefault();
                //event.stopPropagation();
				if(self.dir=="H")
					distXY = pageX - self.basePage;
				else
                	distXY = pageY - self.basePage;
                newXY = self.currentXY + distXY;
                if (newXY >= 0 || newXY < self.maxXY) {
                    newXY = Math.round(self.currentXY + distXY / 3);
                }
                self._setXY(newXY);

                self.direction = distXY > 0 ? -1 : 1;
            }
			if(self.dir=="H")	
            	self.basePage = pageX;
            else
            	self.basePage = pageY;
        },
        _touchEnd: function(event) {
            var self = this;
			//logs('_touchEnd() 22----------->'+self.direction);
            if(self._locked)
            {
           		event.preventDefault();
	            event.stopPropagation();
            }
            
            if (!self.scrolling) {

                return;
            }

            self.scrolling = false;
			var ctPoint = self.currentPoint;
            var newPoint = -self.currentXY / self.distance;
            newPoint =
                (self.direction > 0) ? Math.ceil(newPoint) :
                (self.direction < 0) ? Math.floor(newPoint) :
                Math.round(newPoint);

            self.moveToPoint(newPoint);

            setTimeout(function() {
                self.element.parentNode.removeEventListener('click', self, true);
            }, 200);
			
			var myClick = (ctPoint==newPoint)?true:false;
            if(self.endFun)
            	self.endFun(myClick);
        },
        _click: function(event) {
            var self = this;

            event.stopPropagation();
            event.preventDefault();
        },
        destroy: function() {
            var self = this;

            self.element.parentNode.removeEventListener($E.start, self);
            self.element.parentNode.removeEventListener($E.move, self);
            self.element.parentNode.removeEventListener($E.transEnd, self);
            self.element.parentNode.removeEventListener($E.cancel, self);
			document.removeEventListener($E.end, self);
            document.removeEventListener($E.cancel, self);
        }
	}


