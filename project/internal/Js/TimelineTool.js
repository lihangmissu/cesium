//时间轴的工具类
(function(Map){
	function minInTimeList(time,list){
		var length=list.length-1;
		for (var i = 0; i < list.length; i++) {
			var array_element = list[i];
			if(!(time>array_element)){
				if(i==1){
					return 0;
				}
				return (list[i]-time)>(time-list[i-1])?i-1:i;
			}
			if(i==length){
				return length;
			}
		}
	};
	//构造函数
	function _(timelinecontainer,animationcontainer){
		this.timelinecontainer=timelinecontainer;
		this.animationcontainer=animationcontainer;
		this.timeline=null;
		this.animation=null;
		this.clock=null;
	};
	// Adjust start/end dates in reaction to any calendar/time clicks
    //时间轴的更新和初始化
    _.prototype.initOrUpdate=function(starttime,endtime) {
    	var self=this;
        var startJulian=Cesium.JulianDate.fromIso8601(self.toISOString(starttime));
        var endJulian=Cesium.JulianDate.fromIso8601(self.toISOString(endtime));
        if (startJulian && endJulian) {
            if (Cesium.JulianDate.secondsDifference(endJulian, startJulian) < 0.1) {
            } else {
                if (!self.timeline) {
                	self.makeTimeline(startJulian,endJulian);
                }
                self.clock.startTime = startJulian;
                self.clock.currentTime = startJulian;
                self.clock.stopTime = endJulian;
                self.timeline.zoomTo(startJulian, endJulian);
            }
        }
    };
    //时间轴点击的监听回调事件
    _.prototype.handleSetTime=function(e) {
		var self=this;
		var timeline=self.timeline;
		var clock=self.clock;
		if (Cesium.defined(timeline)) {
            var scrubJulian = e.timeJulian;
            var julianDate=timeline.makeLabel(scrubJulian).replace(/-|\s|:/g,"").substr(0,12);
            var index=minInTimeList(julianDate,heatMapTool.timeList);
            clock.shouldAnimate = false;
            clock.currentTime =  Cesium.JulianDate.fromIso8601(self.toISOString(heatMapTool.timeList[index]));
            if(heatMapTool.monitorDraw!=-1){
				heatMapTool.stopHeat();
				heatMapTool.monitorDraw=0;
			}
            heatMapTool.webgl_option && heatMapTool.someHeat.apply(heatMapTool,[index,function(){
            	if(heatMapTool.monitorDraw!=-1){
					heatMapTool.playFlag=true;
					heatMapTool.dataFlag=true;
					heatMapTool.playHeat(function(){
					});
				}
            }]);
        }
    };
    _.prototype.indexSetTime=function(index){
    	var self=this;
		var timeline=self.timeline;
		var clock=self.clock;
		if (Cesium.defined(timeline)) {
            clock.shouldAnimate = false;
            clock.currentTime =  Cesium.JulianDate.fromIso8601(self.toISOString(heatMapTool.timeList[index]));
        }
    };
    //时间轴更新时间的回调
    _.prototype.handleSetZoom=function (e) {
    	var epochJulian=e.epochJulian;
    	var startJulian=e.startJulian;
    	var endJulian=e.endJulian;
    	var totalSpan=e.totalSpan;
    	var mainTicSpan=e.mainTicSpan;
    	var timeline=this.timeline;
    	var julianDate=timeline.makeLabel(e.epochJulian);
    };
    _.prototype.zoomTo=function(list){
    	var self=this;
        var startJulian=Cesium.JulianDate.fromIso8601(self.toISOString(list[0]));
        var endJulian=Cesium.JulianDate.fromIso8601(self.toISOString(list[list.length-1]));
        if (startJulian && endJulian) {
            if (Cesium.JulianDate.secondsDifference(endJulian, startJulian) < 0.1) {
            } else {
            	self.clock.startTime = startJulian;
            	self.clock.stopTime = endJulian;
            	self.timeline.zoomTo(startJulian, endJulian);
            }
        }
    };
    //时间轴的绘制，对象的生成
    _.prototype.makeTimeline=function(startJulian,endJulian) {
    	var self=this;
    	self.clock = new Cesium.Clock({
    		startTime : startJulian,
    		currentTime : startJulian,
    		stopTime : endJulian,
    		multiplier : 1,
    		clockRange : Cesium.ClockRange.LOOP_STOP,
    		clockStep:  Cesium.ClockStep.SYSTEM_CLOCK_MULTIPLIER,
    		shouldAnimate : true
    	});
    	var timelinecontainer=self.timelinecontainer;
    	var animationcontainer=self.animationcontainer;
    	self.timeline = new Cesium.Timeline(timelinecontainer, self.clock);
    	self.timeline.addEventListener('settime', function(){
    		self.handleSetTime.apply(self,arguments);
    	}, false);
    	self.timeline.addEventListener('setzoom', function(){
    		self.handleSetZoom.apply(self,arguments);
        }, false);
        var clockViewModel = new Cesium.ClockViewModel(self.clock);
        var animationViewModel = new Cesium.AnimationViewModel(clockViewModel);
        self.animation = new Cesium.Animation(animationcontainer, animationViewModel);
        function tick() {
            var time = self.clock.tick();
            Cesium.requestAnimationFrame(tick);
        }
        tick();
    };
    //时间轴所需时间格式的格式化
    _.prototype.toISOString= function(datetime){
    	var datetime=datetime+"";
    	var yyyy=datetime.substr(0,4);
    	var mth=datetime.substr(4,2);
    	var dd=datetime.substr(6,2);
    	var hh=datetime.substr(8,2);
    	var mm=datetime.substr(10,2);
    	return yyyy+"-"+mth+"-"+dd+"T"+hh+":"+mm+":"+"00"+"Z";
	};
	Map.TimelineTool=_;
})(Map);