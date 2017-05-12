//地图工具,最底层的原始对象,提供最外层的命名空间
var Map=(function(){
	//局部变量提供方法所需属性
	Cesium.BingMapsApi.defaultKey=null;
	var attributes;
	var baseIconUrl="project/internal/icon/";
	var iconOption={
		bdz:"bdz.png",
		fengdianchang:"fengdianchang.png",
		ganta:"ganta.png",
		weatherstation:"weatherstation.png",
		windtower:"windTower.png",
		guangfudianchang:"guangfudianchang.png",
		inverter:"inverter.png",
		fengji:"fengji.png",
		obs:"obs.png",
		line_35:"shudianxian.png",
		line_110:"shudianxian.png",
		line_220:"shudianxian.png",
		line_500:"shudianxian.png",
		line_tgy:"shudianxian.png",
		cloudiness:"cloudiness.png",
		height:"height.png",
		humid:"humid.png",
		ice:"ice.png",
		thunder:"thunder.png",
		wind:"wind.png",
		sun:"sun.png",
		temperature:"temp.png",
		humid:"jiangshui.png",
		pressure:"qiya.png",
		clear:"clear.png",
		select:"click.png",
		measure:"chizi.png",
		polygon:"polygon.png",
		baselayerbutton:"bingAerial.png",
		weixing:"weixing.png",
		jiedao:"jiedao.png",
		arcgis:"arcgis.png",
		tianditu:"tianditu.png",
		provence:"xzq.png",
		heatMap:"heatMap.png",
		column:"column.png",
		powerplant:"fengdianchang.png"
	}
	//提供cesium的viewer场景初始化方法
	function viewerInit(divId){
		var viewer= new Cesium.Viewer(divId,{
			animation : false,// 是否创建动画小器件，左下角仪表
			baseLayerPicker : false,// 是否显示图层选择器
			fullscreenButton : true,// 是否显示全屏按钮
			geocoder : false,// 是否显示geocoder小器件，右上角查询按钮
			homeButton : true,// 是否显示Home按钮
			infoBox : true,// 是否显示信息框
			sceneModePicker : true,// 是否显示3D/2D选择器
			selectionIndicator : true,// 是否显示选取指示器组件
			timeline : false,// 是否显示时间轴
			navigationHelpButton : false,// 是否显示右上角的帮助按钮
			scene3DOnly : false,// 如果设置为true，则所有几何图形以3D模式绘制以节约GPU资源
			/*selectedImageryProviderViewModel : imageryViewModels[0],// 当前图像图层的显示模型，仅baseLayerPicker设为true有意义
			imageryProviderViewModels : imageryViewModels,// 可供BaseLayerPicker选择的图像图层ProviderViewModel数组
			terrainProviderViewModels : [],// 可供BaseLayerPicker选择的地形图层ProviderViewModel数组
			selectedTerrainProviderViewModel : undefined,// 当前地形图层的显示模型，仅baseLayerPicker设为true有意义
*/			imageryProvider :  new Cesium.createOpenStreetMapImageryProvider({
				url : 'http://172.16.33.15/osm_hot/'
			}),// 图像图层提供者，仅baseLayerPicker设为false有意义
			terrainProvider : new Cesium.CesiumTerrainProvider({
				url : 'http://172.16.33.15/terrain/'
			}),// 地形图层提供者，仅baseLayerPicker设为false有意义
			skyBox : new Cesium.SkyBox(
			{
				sources : {
					positiveX : 'Cesium/Assets/Textures/SkyBox/tycho2t3_80_px.jpg',
					negativeX : 'Cesium/Assets/Textures/SkyBox/tycho2t3_80_mx.jpg',
					positiveY : 'Cesium/Assets/Textures/SkyBox/tycho2t3_80_py.jpg',
					negativeY : 'Cesium/Assets/Textures/SkyBox/tycho2t3_80_my.jpg',
					positiveZ : 'Cesium/Assets/Textures/SkyBox/tycho2t3_80_pz.jpg',
					negativeZ : 'Cesium/Assets/Textures/SkyBox/tycho2t3_80_mz.jpg'
				}
			}),// 用于渲染星空的SkyBox对象
			fullscreenElement : document.body,// 全屏时渲染的HTML元素,
			useDefaultRenderLoop : true,// 如果需要控制渲染循环，则设为true
			targetFrameRate : undefined,// 使用默认render loop时的帧率
			showRenderLoopErrors : true,// 如果设为true，将在一个HTML面板中显示错误信息
			automaticallyTrackDataSourceClocks : true,// 自动追踪最近添加的数据源的时钟设置
			contextOptions : undefined,// 传递给Scene对象的上下文参数（scene.options）
			sceneMode : Cesium.SceneMode.SCENE3D,// 初始场景模式
			mapProjection : new Cesium.WebMercatorProjection(),// 地图投影体系
			dataSources : new Cesium.DataSourceCollection()// 需要进行可视化的数据源的集合
		});
		var options = {};
		options.defaultResetView = Cesium.Rectangle.fromDegrees(65, -10, 145, 70);
		// Only the compass will show on the map
		options.enableCompass= true;
		options.enableZoomControls= true;
		options.enableDistanceLegend= true;
		options.enableCompassOuterRing= true;
		viewer.extend(Cesium.viewerCesiumNavigationMixin, options);
		Cesium.Camera.DEFAULT_VIEW_RECTANGLE= Cesium.Rectangle.fromDegrees(65, -10, 145, 70);
		Cesium.Camera.DEFAULT_VIEW_FACTOR = 0;
		viewer.camera.flyTo({
	    	destination : Cesium.Rectangle.fromDegrees(65, -10, 145, 70)
		});
		viewer.homeButton.viewModel.command.beforeExecute.addEventListener(function(){
			Cesium.requestAnimationFrame(function() {
				viewer.camera.flyTo({
			    	destination : Cesium.Rectangle.fromDegrees(65, -10, 145, 70)
				});
			});
		});
		//3d转换2D时触发的事件：用于将相机位置移到指定范围
		viewer.scene.morphComplete.addEventListener(function() {
			Cesium.requestAnimationFrame(function() {
				viewer.camera.flyTo({
			    	destination : Cesium.Rectangle.fromDegrees(65, -10, 145, 70)
				});
			});
		});
		
		/*viewer.geocoder.viewModel.search.beforeExecute.addEventListener(function(result){
			var entities=viewer.entities;
			var name=viewer.geocoder.viewModel.searchText;
			console.log(name);
		});
		viewer.geocoder.viewModel.search.afterExecute.addEventListener(function(){
			$("input[type=search]").val();
		});*/
		return viewer;
	};
	//构造函数
	function _(divId){
//		this.container=document.getElementById(divId);
		this.viewer=viewerInit(divId);
		this.scene=this.viewer.scene;
		this.handler=null;
		this.selectedObj=null;
		this.handler=new Cesium.ScreenSpaceEventHandler(this.scene.canvas);
		$(".cesium-viewer-toolbar").append($("#baseLayer"));
	};
	/*options={
	 *     type:"bdz",
	 *     name:"变电站",
	 *     isCheckBox:true,
	 * 	   callback:function(){
	 * 			xxxxx;
	 * 	   }
	 * }
	*/
	//页面中加入按钮的方法
	_.prototype.addToolBar=function(container,options,callback){
		var button=options.callback(container,options,baseIconUrl,iconOption);
		button.onclick=function(ev){
			if(options.isCheckBox){
				if($(button).is(":checked")){
					$(button).prop("checked","checked");
					callback[0](options,button);
				}else{
					$(button).prop("checked",false);
					callback[1](options,button);
				}
			}else{
				callback(options,button);
			}
		}
	};
	//搜索框内容展示与隐藏
	_.prototype.createList=function(list){
    	if(!list){
    		$("#searchContent").empty();
    		$("#searchContent").hide();
    		return;
    	}
    	$("#searchContent").show();
    	$.each(list,function(i){
    		var html="<div class='searchContentList'>"+"<a class="+i+" href='javascript:void(0)'>"+list[i].name+"</a></div>";
    		$("#searchContent").append(html);
    		$(".searchContentList ."+i).on("click",list[i],function(){
    			$(".searchContentList a").css({"background-color":"rgba(42, 42, 42, 0.7)","color":"white"});
    			$(this).css({"background-color":"#ffff00","color":"black"});
    			$("input[type=search]").val(list[i].name);
    			$("#searchContent").hide();
    			$("#searchContent").empty();
    		});
    	});
    };
    //从选取数组中过滤选中对象，制定选中规则
	_.prototype.pickSelect=function(list,chooseDevice,chooseProvence){
		if(list.length==0){
			return "noheat";
		}
		for(var i=0;i<list.length;i++){
			var id=list[i].id;
			if(chooseDevice){
				if(id && id.match(/\d*_(powerplant|fengdianchang|fengji|guangfudianchang|ganta|line|obs|bdz|inverter|windtower|weatherstation)_?\w*/g)){
					return list[i].primitive;
				}
				if(id && id.match(/\d*_polygon_?\w*/g)){
					return id;
				}
			}
			if(chooseProvence){
				if(id && id.match(/\d*_provence_?\w*/g)){
					return id;
				}
			}
		}
		for(var i=0;i<list.length;i++){
			var id=list[i].id;
			if(!id){
				return "heat";
			}
		}
		return "noheat";
	};
	//从四个坐标点中，计算出最小最大边界值
	_.prototype.getMaxAndMinL=function(l1,l2,l3,l4){
		var l=[l1.x>l2.x?l2.x:l1.x,l3.x>l4.x?l4.x:l3.x,l1.x>l2.x?l1.x:l2.x,l3.x>l4.x?l3.x:l4.x,l1.y>l2.y?l2.y:l1.y,l3.y>l4.y?l4.y:l3.y
				,l1.y>l2.y?l1.y:l2.y,l3.y>l4.y?l3.y:l4.y];
		return {
			minx:l[0]>l[1]?l[1]:l[0],
			miny:l[4]>l[5]?l[5]:l[4],
			maxx:l[2]>l[3]?l[2]:l[3],
			maxy:l[6]>l[7]?l[6]:l[7]
		}
	};
	//获取视野范围经纬度点
	_.prototype.getCoordinate=function(value,flag){
		try {
			var self = this;
			var getCor, getCartesian, cartesian1, cartesian2, cartesian3, cartesian4, carto1, carto2, l1, l2, l3, l4, maxAndMinL;
			var container = document.getElementById('cesiumContainer');
			var width = container.clientWidth;
			var height = container.clientHeight;
			var point1 = {
				x : 0,
				y : 0
			};
			var point2 = {
				x : width,
				y : height
			};
			return (getCor = function(point1, point2) {
				cartesian1 = viewer.camera.pickEllipsoid(new Cesium.Cartesian3(
						point1.x, point1.y), viewer.scene.globe.ellipsoid);
				cartesian2 = viewer.camera.pickEllipsoid(new Cesium.Cartesian3(
						point2.x, point2.y), viewer.scene.globe.ellipsoid);
				if (!cartesian1) {
					point1.x += 5.0;
					point1.y += 5.0;
					return getCor(point1, point2);
				}
				if (!cartesian2) {
					point2.x -= 5.0;
					point2.y -= 5.0;
					return getCor(point1, point2);
				}
				carto1 = viewer.scene.globe.ellipsoid
						.cartesianToCartographic(cartesian1);
				l1 = {
					x : Cesium.Math.toDegrees(carto1.longitude),
					y : Cesium.Math.toDegrees(carto1.latitude)
				};
				carto2 = viewer.scene.globe.ellipsoid
						.cartesianToCartographic(cartesian2);
				l2 = {
					x : Cesium.Math.toDegrees(carto2.longitude),
					y : Cesium.Math.toDegrees(carto2.latitude)
				};
				cartesian3 = viewer.camera.pickEllipsoid(new Cesium.Cartesian3(
						point2.x, point1.y), viewer.scene.globe.ellipsoid);
				cartesian4 = viewer.camera.pickEllipsoid(new Cesium.Cartesian3(
						point1.x, point2.y), viewer.scene.globe.ellipsoid);
				point3 = {
					x : point2.x,
					y : point1.y
				}
				point4 = {
					x : point1.x,
					y : point2.y
				};
				(getCartesian = function() {
					if (!cartesian3) {
						point3.x -= 5.0;
						point3.y += 5.0;
						cartesian3 = viewer.camera.pickEllipsoid(
								new Cesium.Cartesian3(point3.x, point3.y),
								viewer.scene.globe.ellipsoid);
						getCartesian();
					}
					if (!cartesian4) {
						point4.x += 5.0;
						point4.y -= 5.0;
						cartesian4 = viewer.camera.pickEllipsoid(
								new Cesium.Cartesian3(point4.x, point4.y),
								viewer.scene.globe.ellipsoid);
						getCartesian();
					}
				})();
				l3 = {
					x : Cesium.Math.toDegrees(viewer.scene.globe.ellipsoid
							.cartesianToCartographic(cartesian3).longitude),
					y : Cesium.Math.toDegrees(viewer.scene.globe.ellipsoid
							.cartesianToCartographic(cartesian3).latitude)
				};
				l4 = {
					x : Cesium.Math.toDegrees(viewer.scene.globe.ellipsoid
							.cartesianToCartographic(cartesian4).longitude),
					y : Cesium.Math.toDegrees(viewer.scene.globe.ellipsoid
							.cartesianToCartographic(cartesian4).latitude)
				};
				maxAndMinL = self.getMaxAndMinL(l1, l2, l3, l4);
				if(flag){
					if (Math.abs(maxAndMinL.maxy - maxAndMinL.miny) > value) {
						if (point2.y < (point1.y+5.0)) {
							return maxAndMinL;
						} else {
							point1.y += 5.0;
							return getCor(point1, point2);
						}
					}
				}
				return maxAndMinL;
			})(point1, point2);
		} catch (e) {
			// TODO: handle exception
		}
	};
	//判断当前图层中加入了哪些线路
	_.prototype.getVoltage=function(){
		var list=[];
		if(drawTool["line_35_data"]){
			list.push(35);
		}
		if(drawTool["line_110_data"]){
			list.push(110);
		}
		if(drawTool["line_220_data"]){
			list.push(220);
		}
		if(drawTool["line_500_data"]){
			list.push(500);
		}
		if(drawTool["line_tgy_data"]){
			list.push("tgy");
		}
		return list;
	};
	//热图网格点视野控制方法
	_.prototype.heatMapPolygonInCull=function(type,cor){
		var self=this;
		var minx=cor.minx;
		var miny=cor.miny;
		var maxx=cor.maxx;
		var maxy=cor.maxy;
		var data=heatMapTool.coordinate;
		var dataFilter=[];
		for (var int = 0; int < data.length; int++) {
			var point=[data[int][1],data[int][0]];
			if ((point[0] > minx && point[0] < maxx) && (point[1] > miny && point[1] < maxy)) {
				dataFilter.push({longitude:data[int][1],latitude:data[int][0],id:int});
			}
		}
		if(!drawTool[type+"_view_data"]){
			drawTool.removePointByPrimitivetypes([type,type+"_label"]);
			drawTool.drawLableByPrimitive(type,drawTool[type+"_option"],dataFilter);
			drawTool[type+"_view_data"]=dataFilter;
		}else{
			var data=self.dataFilter(drawTool[type+"_view_data"],dataFilter);
			drawTool.removePrimitiveByIds([type,type+"_label"],data.remove);
			drawTool.drawLableByPrimitive(type,drawTool[type+"_option"],data.add);
			drawTool[type+"_view_data"]=dataFilter;
		}
	};
	//设备的视野控制方法
	_.prototype.polygonInCull=function(type,cor){
		var self=this;
		var minx=cor.minx;
		var miny=cor.miny;
		var maxx=cor.maxx;
		var maxy=cor.maxy;
		var data=drawTool[type+"_data"];
		var list=type.split("_");
		var flag;
		if(list.length>1){
			flag=list[1];
		}else{
			flag=list[0];
		}
		var dataFilter=[];
		if(type!="ganta_model"){
			for (var int = 0; int < data.length; int++) {
				var point=data[int].geometry?data[int].geometry.split(","):[data[int].longitude,data[int].latitude];
				if ((point[0] > minx && point[0] < maxx) && (point[1] > miny && point[1] < maxy)) {
					dataFilter.push(data[int]);
				}
			}
			if(!drawTool[type+"_view_data"]){
				if(flag=="label"){
					drawTool.removePointByPrimitive(type);
					drawTool.drawLableByPrimitive(type,drawTool[type+"_option"],dataFilter);
				}else if(flag=="model"){
					drawTool.removePointByPrimitive(type);
					drawTool.drawModelByPrimitive(type,drawTool[type+"_option"],dataFilter);
				}else{
					drawTool.removePointByPrimitive(type);
					drawTool.drawPointByPrimitive(type,drawTool[type+"_option"],dataFilter);
				}
				drawTool[type+"_view_data"]=dataFilter;
			}else{
				var data=self.dataFilter(drawTool[type+"_view_data"],dataFilter);
				drawTool.removePrimitiveByIds([type],data.remove);
				if(flag=="label"){
					drawTool.drawLableByPrimitive(type,drawTool[type+"_option"],data.add);
				}else if(flag=="model"){
					drawTool.drawModelByPrimitive(type,drawTool[type+"_option"],data.add);
				}else{
					drawTool.drawPointByPrimitive(type,drawTool[type+"_option"],data.add);
				}
				drawTool[type+"_view_data"]=dataFilter;
			}
		}else{
			var voltages=self.getVoltage();
			//过滤杆塔数据
			$.get("gisPtPoleInfo!findpoleAll.action?voletage="+voltages+"&minx="+minx+"&maxx="+maxx+"&miny="+miny+"&maxy="+maxy,function(data){
				 dataFilter=data.list;
					if(!drawTool[type+"_view_data"]){
						if(flag=="label"){
							drawTool.removePointByPrimitive(type);
							drawTool.drawLableByPrimitive(type,drawTool[type+"_option"],dataFilter);
						}else if(flag=="model"){
							drawTool.removePointByPrimitive(type);
							drawTool.drawModelByPrimitive(type,drawTool[type+"_option"],dataFilter);
						}else{
							drawTool.removePointByPrimitive(type);
							drawTool.drawPointByPrimitive(type,drawTool[type+"_option"],dataFilter);
						}
						drawTool[type+"_view_data"]=dataFilter;
					}else{
						var data=self.dataFilter(drawTool[type+"_view_data"],dataFilter);
						drawTool.removePrimitiveByIds([type],data.remove);
						if(flag=="label"){
							drawTool.drawLableByPrimitive(type,drawTool[type+"_option"],data.add);
						}else if(flag=="model"){
							drawTool.drawModelByPrimitive(type,drawTool[type+"_option"],data.add);
						}else{
							drawTool.drawPointByPrimitive(type,drawTool[type+"_option"],data.add);
						}
						drawTool[type+"_view_data"]=dataFilter;
					}
					
			});
		}
		
	};
	//视野控制时筛选出新加入数据和移出数据
	_.prototype.dataFilter=function(viewdata,dataFilter){
		return {
			add:Array.minus(dataFilter,viewdata),
			remove:Array.minus(viewdata,dataFilter)
		}
	};
	//地平线过滤
	_.prototype.horizonCull=function(cameraPosition,type){
		var rX = 6378137.0;
		var rY = 6378137.0;
		var rZ = 6356752.3142451793;
		// Vector CV
		var cvX = cameraPosition.x / rX;
		var cvY = cameraPosition.y / rY;
		var cvZ = cameraPosition.z / rZ;
		
		var tX,tY,tZ,vtX,vtY,vtZ,vtMagnitudeSquared,vtDotVc,position;
		var vhMagnitudeSquared = cvX * cvX + cvY * cvY + cvZ * cvZ - 1.0;
		var newData=[];
		var data=drawTool[type+"_data"];
		$.each(data, function(i) {
			var positions=[data[i].geometry.split(",")[0],
							data[i].geometry.split(",")[1], data[i].height];
			position=Cesium.Cartesian3.fromDegrees(positions[0],positions[1],positions[2]);
			tX= position.x / rX;
			tY = position.y / rY;
			tZ = position.z / rZ;
			vtX = tX - cvX;
			vtY = tY - cvY;
			vtZ = tZ - cvZ;
			vtMagnitudeSquared = vtX * vtX + vtY * vtY + vtZ * vtZ;
			vtDotVc = -(vtX * cvX + vtY * cvY + vtZ * cvZ);
			if(vtDotVc < vhMagnitudeSquared &&
			                 vtDotVc * vtDotVc / vtMagnitudeSquared > vhMagnitudeSquared){
				newData.push(data[i]);
			}
		});
		drawTool.removePointByPrimitive(type);
		drawTool.drawPointByPrimitive(type,drawTool[type+"_option"],newData);
	};
	//距离过滤
	_.prototype.distanceCull=function(cameraPosition,type,range){
		var self=this;
		var data=drawTool[type+"_data"];
		var list=type.split("_");
		var flag;
		if(list.length>1){
			flag=list[1];
		}else{
			flag=list[0];
		}
		var dataFilter=[];
		var point=[Cesium.Math.toDegrees(cameraPosition.longitude),Cesium.Math.toDegrees(cameraPosition.latitude)];
		for (var int = 0; int < data.length; int++) {
			var point1=data[int].geometry.split(",");
			if(self.getDistance(point1,point)<range){
				dataFilter.push(data[int]);
			}
		}
		if(flag=="label"){
			drawTool.removePointByPrimitive(type);
			drawTool.drawLableByPrimitive(type,drawTool[type+"_option"],dataFilter);
		}else if(flag=="model"){
			drawTool.removePointByPrimitive(type);
			drawTool.drawModelByPrimitive(type,drawTool[type+"_option"],dataFilter);
		}else{
			drawTool.removePointByPrimitive(type);
			drawTool.drawPointByPrimitive(type,drawTool[type+"_option"],dataFilter);
		}
	};
	//测距方法
	_.prototype.getDistance=function(point1,point2){
		var units = "kilometers";
		var point11 = {
		  "type": "Feature",
		  "properties": {},
		  "geometry": {
		    "type": "Point",
		    "coordinates": point1
		  }
		};
		var point21 = {
		  "type": "Feature",
		  "properties": {},
		  "geometry": {
		    "type": "Point",
		    "coordinates": point2
		  }
		};
		return raincal.distance(point11, point21, units);
	};
	//数组形式点的测距
	_.prototype.getDistanceByList=function(positions){
		var viewer=this.viewer;
		var distance=0;
		var units = "kilometers";
		for (var int = 0; int < positions.length-1; int++) {
			var carto1 = viewer.scene.globe.ellipsoid.cartesianToCartographic(positions[int]);
			var carto2=	viewer.scene.globe.ellipsoid.cartesianToCartographic(positions[int+1]);
	        var lon1 = Cesium.Math.toDegrees(carto1.longitude);
	        var lat1 = Cesium.Math.toDegrees(carto1.latitude);
	        var lon2 = Cesium.Math.toDegrees(carto2.longitude);
	        var lat2 = Cesium.Math.toDegrees(carto2.latitude);
	        distance=distance+(function(lon1,lat1,lon2,lat2)
	    	{
	        	var point1 = {
      			  "type": "Feature",
      			  "properties": {},
      			  "geometry": {
      			    "type": "Point",
      			    "coordinates": [lon1,lat1]
      			  }
          		};
          		var point2 = {
      			  "type": "Feature",
      			  "properties": {},
      			  "geometry": {
      			    "type": "Point",
      			    "coordinates": [lon2,lat2]
      			  }
          		};
          		
          		return raincal.distance(point1, point2, units);
	     	})(lon1,lat1,lon2,lat2);
		}
		return distance;
	};
	//自定义多边形
	_.prototype.polygon=function(poly){
		var self=this;
		var viewer=self.viewer;
		var scene=self.scene;
		var positions=[];
		var minPoints=3;
		self.handler.setInputAction(function(movement) {
			var cartesian = scene.camera.pickEllipsoid(movement.position, scene.globe.ellipsoid);
			var carto1 = viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
	        var lon1 = Cesium.Math.toDegrees(carto1.longitude);
	        var lat1 = Cesium.Math.toDegrees(carto1.latitude);
	        var id=(drawTool["polygon_point"]?drawTool["polygon_point"].length:0)+"polygon_point";
	        drawTool.drawPointByPrimitive("polygon_point",{color:Cesium.Color.RED,outlineColor:Cesium.Color.WHITE,outlineWidth:2,pixelSize:5},[{geometry:lon1+","+lat1,height:100,id:id}]);
	        if(movement.position != null) {
	            if (cartesian) {
	                if(positions.length == 0) {
	                    positions.push(cartesian.clone());
	                }
	                if(positions.length >= minPoints) {
	                	poly.positions = positions;
	                	poly._createPrimitive = true;
	                }
	                positions.push(cartesian);
	            }
	        }
    	}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

		self.handler.setInputAction(function(movement) {
            var position = movement.endPosition;
            if(position != null) {
                if(positions.length == 0) {
                } else {
                    var cartesian = scene.camera.pickEllipsoid(position, scene.globe.ellipsoid);
                    if (cartesian) {
                        positions.pop();
                        cartesian.y += (1 + Math.random());
                        positions.push(cartesian);
                        if(positions.length >= minPoints) {
                        	poly.positions = positions;
                        	poly._createPrimitive = true;
    	                }
                    }
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

		self.handler.setInputAction(function(movement) {
			var collection=drawTool["polygon_point"];
			var carto1,lon1,lat1;
			self.polygonPosition=[];
			for (var int = 0; int < collection.length-1; int++) {
				carto1= viewer.scene.globe.ellipsoid.cartesianToCartographic(collection.get(int).position);
				lon1 = Cesium.Math.toDegrees(carto1.longitude);
		        lat1 = Cesium.Math.toDegrees(carto1.latitude);
		        self.polygonPosition.push([lon1,lat1]);
			}
			self.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
			self.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
			self.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
			self.select();
        }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
	};
	//测距
	_.prototype.measure=function(poly,mark){
		var self=this;
		var viewer=self.viewer;
		var scene=self.scene;
		var positions=[];
		var minPoints=2;
		self.handler.setInputAction(function(movement) {
	        if(movement.position != null) {
	            var cartesian = scene.camera.pickEllipsoid(movement.position, scene.globe.ellipsoid);
	            if (cartesian) {
	            	var carto1 = viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
			        var lon1 = Cesium.Math.toDegrees(carto1.longitude);
			        var lat1 = Cesium.Math.toDegrees(carto1.latitude);
			        var id=(drawTool["measure_point"]?drawTool["measure_point"].length:0)+"measure_point";
			        drawTool.drawPointByPrimitive("measure_point",{color:Cesium.Color.RED,outlineColor:Cesium.Color.WHITE,outlineWidth:3,pixelSize:7},[{geometry:lon1+","+lat1,height:100,id:id}]);
	                if(positions.length == 0) {
	                    positions.push(cartesian.clone());
	                    mark.text="0";
	                }
	                if(positions.length >= minPoints) {
	                    poly.positions = positions;
	                }
	                positions.push(cartesian);
	            }
	        }
    	}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

		self.handler.setInputAction(function(movement) {
            var position = movement.endPosition;
            var cartesian = scene.camera.pickEllipsoid(position, scene.globe.ellipsoid);
            if(position != null) {
                if(positions.length == 0) {
                	mark.position=cartesian;
                } else {
                    if (cartesian) {
                        positions.pop();
                        positions.push(cartesian);
                        if(positions.length >= minPoints) {
    	                    poly.positions = positions;
    	                    var s=self.getDistanceByList(positions);
    	                    mark.text=s.toFixed(2)+"公里";
    	                }
                        mark.position=cartesian;
                    }
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

		self.handler.setInputAction(function(movement) {
			self.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
			self.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
			self.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
	};
	//省份选中
	_.prototype.provenceSelect=function(){
		var self=this;
		self.handler.setInputAction(function(movement) {
			var cartesian = viewer.scene.camera.pickEllipsoid(movement.position, viewer.scene.globe.ellipsoid);
			if(cartesian){
				var carto1 = viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
		        var lon1 = Cesium.Math.toDegrees(carto1.longitude);
		        var lat1 = Cesium.Math.toDegrees(carto1.latitude);
				var pickedObject = viewer.scene.drillPick(movement.position,4);
				var device=self.pickSelect(pickedObject,false,true);
				if(device=="noheat")
					return;
				if(device.match(/\d*_provence_outline/g)){
					device=device.replace(/outline/g,"fill");
				}
				if(attributes){
					attributes.color = Cesium.ColorGeometryInstanceAttribute.toValue( Cesium.Color.WHITE.withAlpha(0.1));
				}
				attributes = drawTool["provence"].get(0).getGeometryInstanceAttributes(device);
				attributes.color = Cesium.ColorGeometryInstanceAttribute.toValue( Cesium.Color.RED);
				self.selectedObj={
					attributes:attributes,
					type:"provence",
					id:device
				};
			}
		}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
	};
	//单机选中
	_.prototype.select=function(poly){
		var self=this;
		self.handler.setInputAction(function(movement) {
			var cartesian = viewer.scene.camera.pickEllipsoid(movement.position, viewer.scene.globe.ellipsoid);
			if(cartesian){
				var carto1 = viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
		        var lon1 = Cesium.Math.toDegrees(carto1.longitude);
		        var lat1 = Cesium.Math.toDegrees(carto1.latitude);
				var pickedObject = viewer.scene.drillPick(movement.position,4);
				var device=self.pickSelect(pickedObject,true,false);
				poly && (poly.position=cartesian);
				if(device=="noheat"){
					self.selectedObj={
						type:"noheat",
						x:lon1,
						y:lat1
					}
				}else if(device=="heat"){
					self.selectedObj={
						type:"heat",
						x:lon1,
						y:lat1
					}
				}else if((typeof(device)=="string") && device.match(/\d*_polygon_?\w*/g)){
					var idAndType=device.split("_");
					self.selectedObj={
						position:self.polygonPosition,
						type:idAndType[1]
					};
				}else{
					var carto=viewer.scene.globe.ellipsoid.cartesianToCartographic(device.position);
					var lon = Cesium.Math.toDegrees(carto.longitude);
		        	var lat = Cesium.Math.toDegrees(carto.latitude);
		        	var height=carto.height;
		        	var idAndType=device.id.split("_");
					self.selectedObj={
						x:lon,
						y:lat,
						z:height,
						type:idAndType[1],
						id:idAndType[0]
					}
					console.log(self.selectedObj);
				}
				self.popup(device,self.selectedObj,cartesian);
				/*var c={x:0,y:0};
				self.removeHandler && self.removeHandler.call();
				$("#trackPopUpContent").show();
				self.removeHandler=viewer.scene.postRender.addEventListener(function(){
	    		    var changedC = Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, cartesian);
	    		    if(changedC){
	    		    	// If things moved, move the popUp too
		    			if ((c.x !== changedC.x) || (c.y !== changedC.y)) {
		    				var x=changedC.x-$("#trackPopUpContent").width()/2;
		    				var y=changedC.y-$("#trackPopUpContent").height();
		    				$("#trackPopUpContent").css({"transform":"translate3d("+x+"px, "+y+"px, 0px)"});
		    				c = changedC;
		    			}
	    		    }
	    		});
				$(".leaflet-popup-close-button").bind("click",function(){
					$("#trackPopUpContent").hide();
					$("#trackPopUpLink").empty();
					self.removeHandler.call();
					return false;
				});*/
			}
		}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
	};
	//清除事件
	_.prototype.clear=function(callback){
		var self=this;
		self.removeHandler && self.removeHandler.call();
		$("#trackPopUpContent").hide();
		self.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
		self.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
		self.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
		callback && callback();
	};
	//绑定监听事件
	_.prototype.addEventListener=function(name,option){
		var self=this;
		var viewer=this.viewer;
		var scene=viewer.scene;
		switch(name){
			case "click":
				var handler=new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
				handler.setInputAction(function(movement) {
					var nav=document.getElementsByClassName("cesium-baseLayerPicker-dropDown-visible")[0];
					if(nav){
						nav.className = "cesium-baseLayerPicker-dropDown"; 
					}
					$("#searchContent").hide();
					$("#rightMenu").css("visibility","hidden");
					var pickedObject = viewer.scene.drillPick(movement.position,4);
					var device=self.pickSelect(pickedObject,true,false);
					if(device.id && device.id.match(/\d*_obs_?\w*/g)&&device.layer!=3){
						var idAndType=device.id.split("_");
						var id = idAndType[0];
						var type = idAndType[1];
						var layer = device.layer;
						$.get("obsStation!findAllObsStationByLayer.action?layer="+layer+"&id="+id,function(data){
							var ellipsoid = viewer.scene.globe.ellipsoid; 
							var cartesian = viewer.camera.pickEllipsoid(movement.position, ellipsoid); 
							//将笛卡尔坐标转换为地理坐标                
							var cartographic = ellipsoid.cartesianToCartographic(cartesian);                
							//将弧度转为度的十进制度表示                
							var longitudeString = Cesium.Math.toDegrees(cartographic.longitude);                
							var latitudeString = Cesium.Math.toDegrees(cartographic.latitude);    
							viewer.camera.flyTo({
						        destination : Cesium.Cartesian3.fromDegrees(longitudeString, latitudeString, layer==1?700000:500000),
						        orientation : {
						            heading : Cesium.Math.toRadians(0.0),
						            pitch : Cesium.Math.toRadians(-90.0),
						            roll : 0.0
						        },
						        duration:0.5,
						        complete : function() {
						        	drawTool.removePointByPrimitivetypes([type+"_"+layer,type+"_label"+"_"+layer]);
						        }
						    });
							drawTool.drawObservationStationPointByPrimitive(type,{},data.list,layer+1);
						});
					}
				}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
				break;
			case "dbclick":
				callback();
				break;
			case "mousemove":
				callback();
				break;
			case "viewerControl":
				viewer.camera.moveEnd.addEventListener(function(){
					var cameraPosition=viewer.camera.positionCartographic;
					var cameraHeight = viewer.camera.positionCartographic.height;
					var cor=self.getCoordinate(0.1);
					for (var int = 0; int < option["type"].length; int++) {
						if(drawTool[option["type"][int]+"_data"]){
							if(option["type"][int]=="obs"){
								if(cameraHeight>option["height"][int]){
									if(drawTool[option["type"][int]+"_1"].length==0){
										drawTool.drawObservationStationPointByPrimitive(option["type"][int],{},drawTool[option["type"][int]+"_data"],1);
										drawTool.removePointByPrimitivetypes([option["type"][int]+"_"+2,option["type"][int]+"_label"+"_"+2,option["type"][int]+"_"+3,option["type"][int]+"_label"+"_"+3]);
									}
								}
							}else{
								if(cameraHeight<option["height"][int]){
									self.polygonInCull(option["type"][int],cor);
								}else{
									drawTool.removePointByPrimitive(option["type"][int]);
									drawTool[option["type"][int]+"_view_data"]=null;
								}
							}
						}else{
							if(heatMapTool.value && option["type"][int]=="heat_map" ){
								if(cameraHeight<option["height"][int]){
									self.heatMapPolygonInCull(option["type"][int],cor);
								}else{
									drawTool.removePointByPrimitivetypes([option["type"][int],option["type"][int]+"_label"]);
									drawTool[option["type"][int]+"_view_data"]=null;
								}
							}
							if(option["type"][int].match(/ganta_model/g) && self.getVoltage().length>0){
								if(cameraHeight<option["height"][int]){
									cor=self.getCoordinate(0.1,true);
									self.polygonInCull(option["type"][int],cor);
								}else{
									drawTool.removePointByPrimitive(option["type"][int]);
									drawTool[option["type"][int]+"_view_data"]=null;
								}
							}
						}
					}
				});
				break;
			default:
				break;
		}
	};
	//移出监听事件
	_.prototype.removeEventListener=function(name){
		switch(name){
			case "click":
				self.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
				break;
			case "dbclick":
				self.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
				break;
			case "mousemove":
				self.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
				break;
			case "measure":
				var handler=this.getHandler(true);
				callback();
				break;
			case "select":
				var handler=this.getHandler(true);
				callback();
				break;
			default:
				break;
		}
	};
	_.prototype.popupCallback=function(cartesian,tbody){
		var self=this;
		var c={x:0,y:0};
		$("#trackPopUpLink").append(tbody);
		self.removeHandler && self.removeHandler.call();
		$("#trackPopUpContent").show();
		self.removeHandler=viewer.scene.postRender.addEventListener(function(){
		    var changedC = Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, cartesian);
		    if(changedC){
		    	// If things moved, move the popUp too
    			if ((c.x !== changedC.x) || (c.y !== changedC.y)) {
    				var x=changedC.x-$("#trackPopUpContent").width()/2;
    				var y=changedC.y-$("#trackPopUpContent").height();
    				$("#trackPopUpContent").css({"transform":"translate3d("+x+"px, "+y+"px, 0px)"});
    				c = changedC;
    			}
		    }
		});
		$(".leaflet-popup-close-button").bind("click",function(){
			$("#trackPopUpContent").hide();
			$("#trackPopUpLink").empty();
			self.removeHandler.call();
			return false;
		});
	};
	//吹出功能
	_.prototype.popup=function(device,selectedObj,cartesian){
		var self=this;
		$("#trackPopUpLink").empty();
		var selectedObj=map.selectedObj;
		var tbody;
		if(selectedObj.type!="heat" && selectedObj.type!="noheat"){
			var type=selectedObj.type;
			var id=selectedObj.id;
			var field = null;
			$.ajax({
    			type : "POST",
    			url : 'sysFieldConfig!findAllPopupByType.action',
    			dataType : "json",
    			data : {type:type},
    			success : function(data){
    				if(data.list.length>0){
    					field = data.list;
    					if(type=="weatherstation"){
    						rightMenuEvent.getDeviceInformation("attWeatherStationInfo!findByGISId.action",id,function(obj){
    							return rightMenuEvent.createSpanContent(field,obj);
    						},function(tbody){
    							//泡泡提示消息展示
    							self.popupCallback(cartesian,tbody);
    						});
    					}else if(type=="fengdianchang"){
    						rightMenuEvent.getDeviceInformation("attWindInfo!findByGISId.action",id,function(obj){
    							return rightMenuEvent.createSpanContent(field,obj);
    						},function(tbody){
    							//泡泡提示消息展示
    							self.popupCallback(cartesian,tbody);
    						});
    					}else if(type=="fengji" || type=="fengjimodel"){
    						rightMenuEvent.getDeviceInformation("attFanInfo!findByGISId.action",id,function(obj){
    							return rightMenuEvent.createSpanContent(field,obj);
    						},function(tbody){
    							//泡泡提示消息展示
    							self.popupCallback(cartesian,tbody);
    						});
    					}else if(type=="obs" || type=="obsmodel"){
    						rightMenuEvent.getDeviceInformation("obsStation!findByGISId.action",id,function(obj){
    							return rightMenuEvent.createSpanContent(field,obj);
    						},function(tbody){
    							//泡泡提示消息展示
    							self.popupCallback(cartesian,tbody);
    						});
    					}else if(type=="bdz" || type=="bdzmodel"){
    						rightMenuEvent.getDeviceInformation("attSubstationInfo!findByGISId.action",id,function(obj){
    							return rightMenuEvent.createSpanContent(field,obj);
    						},function(tbody){
    							//泡泡提示消息展示
    							self.popupCallback(cartesian,tbody);
    						});
    					}else if(type=="ganta" || type=="gantamodel"){
    						rightMenuEvent.getDeviceInformation("attPhotovoltaicInfo!findByGISId.action",id,function(obj){
    							return rightMenuEvent.createSpanContent(field,obj);
    						},function(tbody){
    							//泡泡提示消息展示
    							self.popupCallback(cartesian,tbody);
    						});
    					}else if(type=="guangfudianchang" || type=="guangfudianchangmodel"){
    						rightMenuEvent.getDeviceInformation("attPhotovoltaicInfo!findByGISId.action",id,function(obj){
    							return rightMenuEvent.createSpanContent(field,obj);
    						},function(tbody){
    							//泡泡提示消息展示
    							self.popupCallback(cartesian,tbody);
    						});
    					}else if(type=="powerplant"){
    						rightMenuEvent.getDeviceInformation("attPowerPlantInfo!findByGISId.action",id,function(obj){
    							return rightMenuEvent.createSpanContent(field,obj);
    						},function(tbody){
    							//泡泡提示消息展示
    							self.popupCallback(cartesian,tbody);
    						});
    					}else if(type=="inverter"){
    						rightMenuEvent.getDeviceInformation("attPvInverterInfo!findByGISId.action",id,function(obj){
    							return rightMenuEvent.createSpanContent(field,obj);
    						},function(tbody){
    							//泡泡提示消息展示
    							self.popupCallback(cartesian,tbody);
    						});
    					}else if(type=="windtower"){
    						rightMenuEvent.getDeviceInformation("attWindTowerInfo!findByGISId.action",id,function(obj){
    							return rightMenuEvent.createSpanContent(field,obj);
    						},function(tbody){
    							//泡泡提示消息展示
    							self.popupCallback(cartesian,tbody);
    						});
    					}else if(type=="line"){
    						
    					}else if(type=="polygon"){
    						selectedObj.position.push(selectedObj.position[0]);
    						var coordinate=[];
    						coordinate.push(selectedObj.position);
    						var polygons = {
    							"type": "FeatureCollection",
    							"features": [
    					             {
    					            	 "type": "Feature",
    					            	 "properties": {},
    					            	 "geometry": {
    					            		 "type": "Polygon",
    					            		 "coordinates":coordinate
    					            	 }
    					             }
    				             ]
    						};
    						var area = raincal.area(polygons);
    						var areaStr=area/(10000*1000000)+"";
    						var areaValueList=areaStr.split(".");
    						areaValue=areaValueList[0]+"."+areaValueList[1].substr(0,4);
    						tbody="<span style='font-size:12pt;font-weight:bold'>" +"面积:"+areaValue+"万平方公里"+"</span>"
    						$("#trackPopUpLink").append(tbody);
    					}
    				}
    			}
    		});
		}else{
			if(selectedObj.type=="noheat"){
				tbody ="<span style='font-size:12pt;font-weight:bold'>" +"经度:"+selectedObj.x+"</span>"+
				"<span style='font-size:12pt;font-weight:bold'>" +"纬度:"+selectedObj.y+"</span>";
				self.popupCallback(cartesian,tbody);
			}else{
				var x=selectedObj.x;
				var y=selectedObj.y;
		        $.ajax({
					type : "POST",
					url : "findhabsedataservlet",
					data: {
						type : "BasicInformation",
						Points : x+","+y,
						WeatherType : heatMapTool["type"],
						PackTime : pack,
						CalculateTime : heatMapTool.predictionTime
					},
					success : function(data){
						tbody ="<span style='font-size:12pt;font-weight:bold'>" +"经度:"+selectedObj.x+"</span>"+
						"<span style='font-size:12pt;font-weight:bold'>" +"纬度:"+selectedObj.y+"</span>"+
						"<span style='font-size:12pt;font-weight:bold'>" +"信息:"+data+"</span>";
						self.popupCallback(cartesian,tbody);
					}
				});
			}
		}
	}
	return _;
})();