	/*
	 * 绘制云图工具
	 * 
	 * */
(function(Map) {
	//构造函数
	function _(viewer) {
		this.viewer = viewer;
		this.scene = viewer.scene;
		this.webgl_option = null;
		this.globalDensityArray=[];
		this.coordinate=[];
		this.densityMask_withTaiwan=[];
		this.heatMO=null;
		this.pack=null;
		this.timeList=[];
		this.index=0;
		this.index1=0;
		this.playFlag=true;
		this.dataFlag=true;
		this.type=null;
		this.monitorDraw=-1;
		this.hextoRGB={
			red : function(h) {
				return parseInt((this.cutHex(h)).substring(0, 2), 16)
			},
			green : function(h) {
				return parseInt((this.cutHex(h)).substring(2, 4), 16)
			},
			blue : function(h) {
				return parseInt((this.cutHex(h)).substring(4, 6), 16)
			},
			cutHex : function(h) {
				return h.charAt(0) == "#" ? h.substring(1, 7) : h
			}
		};
		this.initCoordinateAndBorder();
	};
	//云图对于包和时间段的初始化方法
	_.prototype.initPackAndTimeList=function(pack,timeList){
		this.pack=pack+"";
		this.timeList=timeList;
	};
	//云图初始化网格点和截取边界所需的数据
	_.prototype.initCoordinateAndBorder=function(){
		var self=this;
		//颜色与值获取、与热图数据获取后，生成heatMap
		$.when($.getJSON("project/internal/data/coordinate.json"),$.getJSON("project/internal/data/densityMask_withTaiwan.json")).done(function(data1,data2){
			self.coordinate=data1[0];
			self.densityMask_withTaiwan=data2[0];
		}).fail(function(data1,data2){
			alert("绘制热图工具初始化失败");
		});
	};
	//RGB转16进制
	_.prototype.RGBToHex=function(rgb){
		var regexp = /[0-9]{0,3}/g;  
		var re = rgb.match(regexp);//利用正则表达式去掉多余的部分，将rgb中的数字提取
		var hexColor = "#"; var hex = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];  
		for (var i = 0; i < re.length; i++) {
			var r = null, c = re[i], l = c; 
	        var hexAr = [];
	        while (c > 16){
	        	r = c % 16;
	        	c = (c / 16) >> 0; 
	        	hexAr.push(hex[r]);  
	        }
	        hexAr.push(hex[c]);
	        if(l < 16&&l != ""){        
	        	hexAr.push(0)
	        }
	        hexColor += hexAr.reverse().join(''); 
    	}  
		return hexColor;  
	};
	//用于生成热图所需的颜色与数值映射对象
	_.prototype.init_Webgl_option=function(data){
		$("#gradX").show();
		var self=this;
		var colorStr=[];
		var valueStr=[];
		$.each(data,function(i){
			if(i==0){
				valueStr.push(parseFloat(data[i].mininum));
				valueStr.push(parseFloat(data[i].maxinum));
			}else{
				valueStr.push(parseFloat(data[i].maxinum));
			}
			var colorString=self.RGBToHex("RGB("+data[i].rgb+")");
			colorStr.push(colorString);
		});
		self.init_color_board(colorStr,valueStr);
		var webgl_option = {
			color:colorStr,
			value:valueStr,
			alpha: 0.5
		};
		return webgl_option;
	};
	//获取颜色和值后生成比色卡
	_.prototype.init_color_board=function(color,value){
		$("#gradR").empty();
		if(value.length>20){
			var length=value.length/(value.length>40?4:2);
			for (var int = 0; int < length; int++) {
				var div="<div style='height:"+100/(length)+"%;line-height:25%;'>"+value[int*(value.length>40?4:2)]+"</div>";
				$("#gradR").append(div);
			}
		}else{
			for (var int = 0; int < value.length; int++) {
				var div="<div style='height:"+100/(value.length-1)+"%;line-height:25%;'>"+value[int]+"</div>";
				$("#gradR").append(div);
			}
		}
		var colorStr="";
		for (var int = 0; int < color.length-1; int++) {
			if(int==color.length-2){
				colorStr+=color[int]+" "+(100/color.length)*(int+1)+"%"+","+color[int+1]+" "+(100/color.length)*(int+1)+"%";
			}else{
				colorStr+=color[int]+" "+(100/color.length)*(int+1)+"%"+","+color[int+1]+" "+(100/color.length)*(int+1)+"%"+",";
			}
		}
		var userAgent = navigator.userAgent;
		if (userAgent.indexOf("Firefox") > -1) {
			style_str="-moz-linear-gradient("+"top,"+colorStr+")";
	    } //判断是否Firefox浏览器
	    if (userAgent.indexOf("Chrome") > -1){
	    	style_str="-webkit-linear-gradient("+"top,"+colorStr+")";
	    }
//	    style_str="-webkit-linear-gradient("+"top,"+colorStr+")";
		$("#gradL").css("background",style_str);
	};
	//点击事件加载云图的入口方法
	_.prototype.initHeat=function(options){
		var self=this;
		self.globalDensityArray=[];
		self.index=0;
		var webglurl=self.getWebglUrl(options["type"]);
		var heaturl=self.getHeatUrl(0,options["type"]);
		$("#loading").show();
		$.when($.get(webglurl),$.getJSON(heaturl)).done(function(data1,data2){
			$("#type").show();
			$("#type span").text(options["name"]);
			self.value=data2[0];
			self.drawHeat(self.init_Webgl_option(data1[0].list),data2[0]);
			timelineTool.indexSetTime.apply(timelineTool,[0]);
			$("#heatMap").prop("checked",true);
		}).fail(function(data1,data2){
			$("#loading").hide();
			alert("数据错误");
		});
	};
	//处理数据，绘制云图的中间方法
	_.prototype.drawHeat=function(webgl_option, data){
		this.initHeatData(webgl_option, data);
		this.updateHeat();
	};
	//绘制云图的方法
	_.prototype.updateHeat=function(callback){
		var scene=this.scene;
		var globalDensityArray=this.globalDensityArray;
		var _triangles = globalDensityArray.shift();
		if(!_triangles)
			return;
		this.clearHeat();
		callback && callback();
		this.heatMO = scene.primitives.add(new Cesium.Primitive({
			geometryInstances : new Cesium.GeometryInstance({
				geometry : MultiColorTriangleGeometry
					.createGeometry(new MultiColorTriangleGeometry({
						triangles : _triangles
				}))
			}),
			asynchronous : false,
			appearance : new MultiColorTriangleAppearance({
				 translucent : true
			})
		}));
		$("#loading").hide();
	};
	//处理数据的方法
	_.prototype.initHeatData=function(webgl_option,data){
		var coordinate=this.coordinate;
		var densityMask_withTaiwan=this.densityMask_withTaiwan;
		var globalDensityArray=this.globalDensityArray;
		this.webgl_option = webgl_option;
		var _height;
		if (!_height) {
			_height = 10000;
		}
		var dataMiniScale = 2.0;
		var defaultDirection = undefined;
		var lonlatTolerant = 4;
		var d1, d2, d3, d4;

		var vertices = [];
		/* var lonl = 651, latl = 483, lonl2 = (lonl+1)*.5; */
		var lonl = 610, latl = 465, lonl2;
		if (lonl % 2)
			lonl2 = (lonl + 1) * .5;
		else
			lonl2 = (lonl) * .5;
		for (cnt = 0; cnt < coordinate.length; cnt += dataMiniScale) {
			vertices.push(new Vertex({
				vertexFormat : Cesium.VertexFormat.POSITION_AND_COLOR,
				position : Cesium.Cartesian3.fromDegrees(
						coordinate[cnt][1], coordinate[cnt][0],
						10000),
				height : 10000,
				color : this.getColor(data[cnt])
			}));
		}
		var isSame = function(p1, p2, p3, p4, q1, q2, q3, q4) {
			var pa = vertices[p1].color.alpha == vertices[p2].color.alpha
					&& vertices[p2].color.alpha == vertices[p3].color.alpha
					&& vertices[p3].color.alpha == vertices[p4].color.alpha, pr = vertices[p1].color.red == vertices[p2].color.red
					&& vertices[p2].color.red == vertices[p3].color.red
					&& vertices[p3].color.red == vertices[p4].color.red, pg = vertices[p1].color.green == vertices[p2].color.green
					&& vertices[p2].color.green == vertices[p3].color.green
					&& vertices[p3].color.green == vertices[p4].color.green, pb = vertices[p1].color.blue == vertices[p2].color.blue
					&& vertices[p2].color.blue == vertices[p3].color.blue
					&& vertices[p3].color.blue == vertices[p4].color.blue, qa = vertices[q1].color.alpha == vertices[q2].color.alpha
					&& vertices[q2].color.alpha == vertices[q3].color.alpha
					&& vertices[q3].color.alpha == vertices[q4].color.alpha, qr = vertices[q1].color.red == vertices[q2].color.red
					&& vertices[q2].color.red == vertices[q3].color.red
					&& vertices[q3].color.red == vertices[q4].color.red, qg = vertices[q1].color.green == vertices[q2].color.green
					&& vertices[q2].color.green == vertices[q3].color.green
					&& vertices[q3].color.green == vertices[q4].color.green, qb = vertices[q1].color.blue == vertices[q2].color.blue
					&& vertices[q2].color.blue == vertices[q3].color.blue
					&& vertices[q3].color.blue == vertices[q4].color.blue;

			var pq = vertices[p1].color.alpha === vertices[q1].color.alpha
					&& vertices[p1].color.red === vertices[q1].color.red
					&& vertices[p1].color.green === vertices[q1].color.green
					&& vertices[p1].color.blue === vertices[q1].color.blue;

			if (pa && pr && pg && pb && qa && qr && qg && qb && pq)
				return true;
			else
				return false;
		};

		var rectFloodFactor = function(p1, p2, p3, p4, q1, q2, q3, q4,
				direction) {
			if (direction == defaultDirection)
				direction = 0 || 1 || 0;
			if (direction) {
				return isSame(p1, p2, p3, p4, q1, q2, q3, q4);
			} else {
				return isSame(p1, p2, p3, p4, q1, q2, q3, q4);
			}
		};

		var triangles = [];
		if (0 || 1 || 0) {
			var isReady = false;
			var rectlength = 0;
			var allTri = 0, curTri = 0;
			var drawRect = function() {
				if (isReady) {
					triangles.push(new Triangle({
						vertices : [ vertices[d1], vertices[d3], vertices[d4] ]
					}));
					triangles.push(new Triangle({
						vertices : [ vertices[d1], vertices[d4], vertices[d2] ]
					}));
					isReady = false;
					rectlength = 0;

				}
			};
			for (var j = 0; j < latl - 1; j += dataMiniScale) {
				for (var i = 0; i < lonl2 - 2; i++) {
					var reverseValue = !(j % 2 == 0 ? true : false);
					var p1, p2, p3, p4;
					if (lonl % 2) {
						p1 = j * (lonl2 - 1) + (0 | ((j + 1) * .5)) + i, p2 = j
								* (lonl2 - 1) + (0 | ((j + 1) * .5)) + i + 1;
						p3 = (j + dataMiniScale) * (lonl2 - 1)
								+ (0 | ((j + 1 + 1) * .5)) + i,
								p4 = (j + dataMiniScale) * (lonl2 - 1)
										+ (0 | ((j + 1 + 1) * .5)) + i + 1;
					} else {
						p1 = j * (lonl2) + (0 && ((j + 1) * .5)) + i, p2 = j
								* (lonl2) + (0 && ((j + 1) * .5)) + i + 1;
						p3 = (j + dataMiniScale) * (lonl2)
								+ (0 && ((j + 1 + 1) * .5)) + i,
								p4 = (j + dataMiniScale) * (lonl2)
										+ (0 && ((j + 1 + 1) * .5)) + i + 1;
					}
					var isInSideBoundary = densityMask_withTaiwan[p1] == 1
							&& densityMask_withTaiwan[p2] == 1
							&& densityMask_withTaiwan[p3] == 1
							&& densityMask_withTaiwan[p4] == 1;

					if (isInSideBoundary) {

						if (isReady == false) {
							d1 = p1, d2 = p2, d3 = p3, d4 = p4;
							isReady = true;
							rectlength = 1;
						} else {
							if (rectFloodFactor(d1, d2, d3, d4, p1, p2, p3, p4)) {
								d2 = p2, d4 = p4;
								rectlength++;
							} else {
								drawRect(reverseValue);
								d1 = p1, d2 = p2, d3 = p3, d4 = p4;
								isReady = true;
								rectlength = 1;
							}
						}
					} else
						drawRect(reverseValue);

					if (i == lonl2 - 3 || rectlength > lonlatTolerant)
						drawRect(reverseValue);
				}
			}
		};
		globalDensityArray.push(triangles);
	};
	//根据网格点的值获取颜色的方法
	_.prototype.getColor=function(_value) {
		var webgl_option=this.webgl_option;
		var hextoRGB=this.hextoRGB;
		var _cnt = 0;
		for(_cnt=1; _cnt<webgl_option.value.length; _cnt++){
			if(_value<=webgl_option.value[_cnt])
				break;
		}
		var final_color = webgl_option.color[_cnt>0?(_cnt==webgl_option.value.length?_cnt-2:_cnt-1):0];
		return {alpha: webgl_option.alpha,
				blue: hextoRGB.blue(final_color)/255.0,
				green: hextoRGB.green(final_color)/255.0, 
				red: hextoRGB.red(final_color)/255.0
		};
	};
	//清除云图的方法
	_.prototype.clearHeat=function(){
		var scene=this.scene;
		var heatMO=this.heatMO;
		if (heatMO != null) {
			scene.primitives.remove(heatMO);
			heatMO = null;
		}
	};
	//获取云图加载URL的方法
	_.prototype.getHeatUrl=function(index1){
		var self=this;
		if(index1!=undefined){
			self.predictionTime=this.timeList[index1];
		}else{
			self.predictionTime=this.timeList[++this.index1];
		}
		if(!self.predictionTime){
			self.predictionTime=this.timeList[0];
			self.index1=0;
			self.index=0;
		}
		var _name="findhabsedataservlet?type="+this.type+"&predictionTime="+self.predictionTime+"&currentPackage="+this.pack;
		return _name;
	};
	//获取云图比色卡URL方法
	_.prototype.getWebglUrl=function(type){
		this.type=type;
		return "weatherRGB!findWeatherRGBByType.action?type="+type;
	};
	//播放按钮的入口方法
	_.prototype.playHeat=function(callback){
		var self=this;
		self.playFlag=true;
		self.dataFlag=true;
		self.globalDensityArray=[];
		var getData;
		self.index1=self.index;
		self.monitorDraw = window.setInterval(function(){
			var flag=self.playFlag;
			if(flag){
				if(self.globalDensityArray.length>=1){
					self.updateHeat(function(){
						timelineTool.indexSetTime.apply(timelineTool,[++self.index]);
					});
					callback();
				}
			}
		},800);
		(getData=function(){
			if(self.dataFlag){
				if(self.globalDensityArray.length>=5){
					window.setTimeout(function(){
						if(self.dataFlag){
							getData();
						}
					},800);
				}else{
					var heatUrl=self.getHeatUrl();
					$.get(heatUrl).done(function(data){
						if(self.dataFlag){
							self.initHeatData(self.webgl_option,data);
						}
						getData();
					});
				}
			}
		})();
	};
	//播放条中下一个的方法
	_.prototype.nextHeat=function(callback){
		var self=this;
		self.globalDensityArray=[];
		var heatUrl=self.getHeatUrl(++self.index);
		$.get(heatUrl).done(function(data){
			self.value=data;
			self.initHeatData(self.webgl_option,data);
			self.updateHeat(function(){
				timelineTool.indexSetTime.apply(timelineTool,[self.index]);
			});
			callback(self.monitorDraw);
		});
	};
	//播放条中上一个的方法
	_.prototype.prevHeat=function(callback){
		var self=this;
		self.globalDensityArray=[];
		var heatUrl=self.getHeatUrl(--self.index);
		$.get(heatUrl).done(function(data){
			self.value=data;
			self.initHeatData(self.webgl_option,data);
			self.updateHeat(function(){
				timelineTool.indexSetTime.apply(timelineTool,[self.index]);
			});
			callback(self.monitorDraw);
		});
	};
	//timeline中点击或者拖拽到某个刻度时的方法
	_.prototype.someHeat=function(index,callback){
		var self=this;
		self.globalDensityArray=[];
		var heatUrl=self.getHeatUrl(index);
		self.index=index;
		$.get(heatUrl).done(function(data){
			self.value=data;
			self.initHeatData(self.webgl_option,data);
			self.updateHeat(function(){
			});
			callback();
		});
	};
	//播放条中暂停的方法
	_.prototype.stopHeat=function(callback){
		if(this.monitorDraw!=-1){
			window.clearInterval(this.monitorDraw);
			this.playFlag=false;
			this.dataFlag=false;
			this.monitorDraw=-1;
			callback && callback();
		}
	};
	Map.HeatMapTool =_;
})(Map);