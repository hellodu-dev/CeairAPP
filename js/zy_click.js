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
	function getPage (event, page) {
		return $support.touch ? event.changedTouches[0][page] : event[page];
	}
	var zyClick = function(selector,clickFun,css){
		var self = this;
		self._clickFun = clickFun || null;
		self._click=false;
		self.css = css;
		if(typeof selector == 'object')
			self.element = selector;
		else if(typeof selector == 'string')
			self.element = document.getElementById(selector);
		self.attribute=self.element.getAttribute("onclick");
		self.attribute2=self.element.getAttribute("onlongclick");
		self.element.removeAttribute("onclick");
		self.element.removeAttribute("onlongclick");
		self.element.addEventListener($E.start, self, false);
		self.element.addEventListener($E.move, self, false);
		self.element.addEventListener($E.end, self, false);
		if($E.cancel!="")
		{
			self.element.addEventListener($E.cancel, self, false);
			//document.addEventListener($E.cancel, self, false); //P7, S4手机输入法框焦点问题
		}
		//document.addEventListener($E.end, self, false);
		
		return self;
	}

	zyClick.prototype = {
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
			}
		},
        _touchStart: function(event) {
            var self = this;
            self.start = true;
            self._click=true;
            self.startPageX = getPage(event, 'pageX');
            self.startPageY = getPage(event, 'pageY');
            self.startTime = event.timeStamp;
			//logs('[click] _touchStart---->startTime='+event.timeStamp);
            if (self.css && !self.touchTime) {
                self.touchTime=setTimeout(function(){
                    if (self._click && self.element.className.indexOf(self.css)<0) 
                        self.element.className += (" " + self.css);
                }, 50);
			}
			
			self.touchTime2 = setTimeout(function(){
				self.touchTime2 = null;
                if(self.attribute2) eval(self.attribute2);
            }, 1100);
        },
        _touchMove: function(event) {
        	
            var self = this;
			//logs('[click] _touchMove---->startTime='+event.timeStamp);
			if(!self.start)
				return;

            var pageX = getPage(event, 'pageX'),
                pageY = getPage(event, 'pageY'),
                deltaX = pageX - self.startPageX,
                deltaY = pageY - self.startPageY;
			var MMX = screen.width>1200?15:5;
           if((Math.abs(deltaX)>MMX || Math.abs(deltaY)>MMX))
           {
				if (self._click) {
					clearTimeout(self.touchTime);
					self.touchTime = null;
					self._click = false;
					if (self.css) 
						self.element.className = self.element.className.replace(" " + self.css, "");
				}
				
				if (self.touchTime2) {
					clearTimeout(self.touchTime2);
					self.touchTime2 = null;
				}
		   }		
		   else{
		   }
        },
        _touchEnd: function(event) {
        	
            var self = this;
			event.preventDefault();
	        //event.stopPropagation();
			//logs('[click] _touchEnd---->startTime='+event.timeStamp);
			if (self.touchTime2) {
				clearTimeout(self.touchTime2);
				self.touchTime2 = null;
			}
			
            if(self.start == true)
            {
				if (self.touchTime) {
					clearTimeout(self.touchTime);
					self.touchTime=null;
				}
            	self.start = false;
            	if(self.css){
					self.cssTime = setTimeout(function(){
						self.element.className=self.element.className.replace(" "+self.css,"");
						self.cssTime = null;
					}, 100);
				}
            	if(self._click)
            	{
            		self._click=false;
            		if(event.timeStamp - self.startTime>1100){
						if(self.cssTime){
							clearTimeout(self.cssTime);
							self.cssTime = null;
							self.element.className=self.element.className.replace(" "+self.css,"");
						}
						return;
					}
					if(event.type==$E.cancel)
						return;
            		if(self._clickFun)
	           			self._clickFun(self.element);
					if(self.attribute)
						eval(self.attribute);
						
					eventReport();
            	}
            }
        },
        destroy: function() {
            var self = this;

            self.element.removeEventListener($E.start, self);
            self.element.removeEventListener($E.move, self);
            self.element.removeEventListener($E.end, self);
            self.element.removeEventListener($E.cancel, self);
            //document.removeEventListener($E.end, self);
            //document.removeEventListener($E.cancel, self);
        }
	}


