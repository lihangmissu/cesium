/*
 * 绘制点线面的工具类
 * 
 * */
(function(Map){
	//方法所用到的一些基本属性，用局部变量表示
	var material = Cesium.Material.fromType(Cesium.Material.ColorType);
    material.uniforms.color = new Cesium.Color(1.0, 1.0, 0.0, 0.5);
    var feature={
		warn:{
			"0": {color:Cesium.Color.ORANGE,width:5},
			"1": {color:Cesium.Color.RED,width:5.5},
			"2": {color:Cesium.Color.BLUE,width:6},
			"3": {color:Cesium.Color.GREEN,width:6.5},
			"4": {color:Cesium.Color.PURPLE,width:7}
		}
    };
    var defaultShapeOptions = {
        ellipsoid: Cesium.Ellipsoid.WGS84,
        textureRotationAngle: 0.0,
        height: 0.0,
        asynchronous: true,
        show: true,
        debugShowBoundingVolume: false
    }
    var defaultSurfaceOptions = copyOptions(defaultShapeOptions, {
        appearance: new Cesium.EllipsoidSurfaceAppearance({
            aboveGround : false
        }),
    	material : material,
        granularity: Math.PI / 180.0
    });
    //绘制工具可变几何图形的基类，提供自定义多边形，测距等所需要的底层类
    var ChangeablePrimitive = (function() {
        function _() {
        }

        _.prototype.initialiseOptions = function(options) {
            fillOptions(this, options);
            this._ellipsoid = undefined;
            this._granularity = undefined;
            this._height = undefined;
            this._textureRotationAngle = undefined;
            this._id = undefined;

            // set the flags to initiate a first drawing
            this._createPrimitive = true;
            this._primitive = undefined;
            this._outlinePolygon = undefined;

        }

        _.prototype.setAttribute = function(name, value) {
            this[name] = value;
            this._createPrimitive = true;
        };

        _.prototype.getAttribute = function(name) {
            return this[name];
        };

        /**
         * @private
         */
        _.prototype.update = function(context, frameState, commandList) {

            if (!Cesium.defined(this.ellipsoid)) {
                throw new Cesium.DeveloperError('this.ellipsoid must be defined.');
            }

            if (!Cesium.defined(this.appearance)) {
                throw new Cesium.DeveloperError('this.material must be defined.');
            }

            if (this.granularity < 0.0) {
                throw new Cesium.DeveloperError('this.granularity and scene2D/scene3D overrides must be greater than zero.');
            }

            if (!this.show) {
                return;
            }

            if (!this._createPrimitive && (!Cesium.defined(this._primitive))) {
                // No positions/hierarchy to draw
                return;
            }

            if (this._createPrimitive ||
                (this._ellipsoid !== this.ellipsoid) ||
                (this._granularity !== this.granularity) ||
                (this._height !== this.height) ||
                (this._textureRotationAngle !== this.textureRotationAngle) ||
                (this._id !== this.id)) {

                var geometry = this.getGeometry();
                if(!geometry) {
                    return;
                }

                this._createPrimitive = false;
                this._ellipsoid = this.ellipsoid;
                this._granularity = this.granularity;
                this._height = this.height;
                this._textureRotationAngle = this.textureRotationAngle;
                this._id = this.id;

                this._primitive = this._primitive && this._primitive.destroy();

                this._primitive = new Cesium.Primitive({
                    geometryInstances : new Cesium.GeometryInstance({
                        geometry : geometry,
                        id : this.id,
                        pickPrimitive : this
                    }),
                    appearance : this.appearance,
                    asynchronous : this.asynchronous
                });

                this._outlinePolygon = this._outlinePolygon && this._outlinePolygon.destroy();
                if(this.strokeColor && this.getOutlineGeometry) {
                    // create the highlighting frame
                    this._outlinePolygon = new Cesium.Primitive({
                        geometryInstances : new Cesium.GeometryInstance({
                            geometry : this.getOutlineGeometry(),
                            attributes : {
                                color : Cesium.ColorGeometryInstanceAttribute.fromColor(this.strokeColor)
                            }
                        }),
                        appearance : new Cesium.PerInstanceColorAppearance({
                            flat : true,
                            renderState : {
                                depthTest : {
                                    enabled : true
                                },
                                lineWidth : Math.min(this.strokeWidth || 4.0, context._aliasedLineWidthRange[1])
                            }
                        })
                    });
                }
            }

            var primitive = this._primitive;
            primitive.appearance.material = this.material;
            primitive.debugShowBoundingVolume = this.debugShowBoundingVolume;
            primitive.update(context, frameState, commandList);
            this._outlinePolygon && this._outlinePolygon.update(context, frameState, commandList);

        };

        _.prototype.isDestroyed = function() {
            return false;
        };

        _.prototype.destroy = function() {
            this._primitive = this._primitive && this._primitive.destroy();
            return Cesium.destroyObject(this);
        };

        _.prototype.setStrokeStyle = function(strokeColor, strokeWidth) {
            if(!this.strokeColor || !this.strokeColor.equals(strokeColor) || this.strokeWidth != strokeWidth) {
                this._createPrimitive = true;
                this.strokeColor = strokeColor;
                this.strokeWidth = strokeWidth;
            }
        }

        return _;
    })();
    //在上述基类的基础上扩展的多边形可变几何类
	var PolygonPrimitive = (function() {
    	
        function _(options) {

            options = copyOptions(options, defaultSurfaceOptions);

            this.initialiseOptions(options);

            this.isPolygon = true;

        }

        _.prototype = new ChangeablePrimitive();

        _.prototype.setPositions = function(positions) {
            this.setAttribute('positions', positions);
        };

        _.prototype.getPositions = function() {
            return this.getAttribute('positions');
        };

        _.prototype.getGeometry = function() {

            if (!Cesium.defined(this.positions) || this.positions.length < 3) {
                return;
            }

            return Cesium.PolygonGeometry.fromPositions({
                positions : this.positions,
                height : this.height,
                vertexFormat : Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
                stRotation : this.textureRotationAngle,
                ellipsoid : this.ellipsoid,
                granularity : this.granularity
            });
        };

        _.prototype.getOutlineGeometry = function() {
            return Cesium.PolygonOutlineGeometry.fromPositions({
                positions : this.getPositions()
            });
        }

        return _;
    })();
	//方法所需通用属性，用局部变量表示
	var pointCommonOption={
		color:Cesium.Color.YELLOW,
		outlineColor :Cesium.Color.WHITE,
		outlineWidth:3,
		pixelSize :6
	};
	var GetTogetherCommonOption={
		pixelSize:20,
		color:new Cesium.Color(0,1,0,0.5),
		outlineColor:new Cesium.Color(0,1,0,0.3),
		outlineWidth : 3,
		maxRate:1/5000
	};
	
	var lineCommonOption={
		color:Cesium.Color.YELLOW,
		width:2
	};
	var polygonCommonOption={
			
	};
	var columnCommonOption={
		font : '20px sans-serif',
		fillColor : Cesium.Color.WHITE,
		outlineColor : Cesium.Color.BLACK,
		style : Cesium.LabelStyle.FILL,
		pixelOffset :  new Cesium.Cartesian2(0,-15),
		eyeOffset : Cesium.Cartesian3.ZERO,
		horizontalOrigin : Cesium.HorizontalOrigin.CENTER,
		verticalOrigin : Cesium.VerticalOrigin.CENTER,
		scale : 1.0
	}
	var modelCommonOption={
			 url : 'project/internal/data/3Dmodels/gt.gltf',
			 show : true,                     // default
			 scale : 1.0,                     // double size
			 minimumPixelSize : 40,          // never smaller than 128 pixels
			 maximumScale: 20000,             // never larger than 20000 * model size (overrides minimumPixelSize)
			 allowPicking : false,            // not pickable
			 debugShowBoundingVolume : false, // default
			 debugWireframe : false
		};
	var modelOption={
		fengji_model:{
			 url : 'project/internal/data/3Dmodels/fjd.gltf',
			 show : true,                     // default
			 scale : 1.0,                     // double size
			 minimumPixelSize : 100,          // never smaller than 128 pixels
			 maximumScale: 20000,             // never larger than 20000 * model size (overrides minimumPixelSize)
			 allowPicking : false,            // not pickable
			 debugShowBoundingVolume : false, // default
			 debugWireframe : false
			
		},
		ganta_model:{
			 url : 'project/internal/data/3Dmodels/gt.gltf',
			 show : true,                     // default
			 scale : 1.0,                     // double size
			 minimumPixelSize : 100,          // never smaller than 128 pixels
			 maximumScale: 100,             // never larger than 20000 * model size (overrides minimumPixelSize)
			 allowPicking : false,            // not pickable
			 debugShowBoundingVolume : false, // default
			 debugWireframe : false
		},
		guangfudianchang_model:{
			 url : 'project/internal/data/3Dmodels/gfb.gltf',
			 show : true,                     // default
			 scale : 1.0,                     // double size
			 minimumPixelSize : 100,          // never smaller than 128 pixels
			 maximumScale: 20000,             // never larger than 20000 * model size (overrides minimumPixelSize)
			 allowPicking : false,            // not pickable
			 debugShowBoundingVolume : false, // default
			 debugWireframe : false
		},
		fengdianchang_model:{
			 url : 'project/internal/data/3Dmodels/fj.gltf',
			 show : true,                     // default
			 scale : 1.0,                     // double size
			 minimumPixelSize : 100,          // never smaller than 128 pixels
			 maximumScale: 20000,             // never larger than 20000 * model size (overrides minimumPixelSize)
			 allowPicking : false,            // not pickable
			 debugShowBoundingVolume : false, // default
			 debugWireframe : false
		}
	}
	var lableOption={
		font : '30px sans-serif',
		fillColor : Cesium.Color.WHITE,
		outlineColor : Cesium.Color.BLACK,
		style : Cesium.LabelStyle.FILL,
		pixelOffset : Cesium.Cartesian2.ZERO,
		eyeOffset : Cesium.Cartesian3.ZERO,
		horizontalOrigin : Cesium.HorizontalOrigin.LEFT,
		verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
		scale : 1.0
	}
	
	var GetTogetherlableOption={
		font : '10px 宋体',
	        verticalOrigin : Cesium.VerticalOrigin.BOTTOM, //垂直方向以底部来计算标签的位置
	        pixelOffset : new Cesium.Cartesian2(-7,5),//偏移量
	        fillColor : Cesium.Color.BLACK
	}
	
	function fillOptions(options, defaultOptions) {
        options = options || {};
        var option;
        for(option in defaultOptions) {
            if(options[option] === undefined) {
                options[option] = clone(defaultOptions[option]);
            }
        }
    }
    function clone(from, to) {
        if (from == null || typeof from != "object") return from;
        if (from.constructor != Object && from.constructor != Array) return from;
        if (from.constructor == Date || from.constructor == RegExp || from.constructor == Function ||
            from.constructor == String || from.constructor == Number || from.constructor == Boolean)
            return new from.constructor(from);

        to = to || new from.constructor();

        for (var name in from) {
            to[name] = typeof to[name] == "undefined" ? clone(from[name], null) : to[name];
        }

        return to;
    }
    function copyOptions(options, defaultOptions) {
        var newOptions = clone(options), option;
        for(option in defaultOptions) {
            if(newOptions[option] === undefined) {
                newOptions[option] = clone(defaultOptions[option]);
            }
        }
        return newOptions;
    }
    
    
    //绘制工具的构造函数
	function _(viewer){
		this.viewer=viewer;
		this.scene=viewer.scene;
	};
	
	/*
	 * 绘制点设备方法
	 * type:绘制设备点类型
	 * option:设置属性样式对象
	 * data:绘制数据源
	 * */
	_.prototype.drawPointByPrimitive=function(type,option,data){
		var option=$.extend(pointCommonOption,option);
		this[type]=this[type] || this.scene.primitives.add(new Cesium.PointPrimitiveCollection());
		this[type+"_option"]=option;
		var points=this[type];
		$.each(data, function(i) {
			var position=data[i].geometry?[data[i].geometry.split(",")[0],data[i].geometry.split(",")[1], data[i].height]:[data[i].longitude,data[i].latitude, data[i].height?data[i].height:0];
			var id=data[i].gisid+"_"+type;
			var point=points.add({
				id:id,
				color :option.color,
				outlineColor :option.outlineColor,
				outlineWidth :option.outlineWidth ,
				pixelSize: option.pixelSize,
				position: Cesium.Cartesian3.fromDegrees(position[0], position[1],position[2]),
				translucencyByDistance : new Cesium.NearFarScalar(1.5e5, 1.0, 2.5e7, 1),
				scaleByDistance : new Cesium.NearFarScalar(1.5e5, 1.0, 2.5e7, 0.3)
			});
		});
	};
	
	/*
	 * 绘制观测站
	 * type:绘制设备点类型
	 * option:设置属性样式对象
	 * data:绘制数据源
	 * */
	_.prototype.drawObservationStationPointByPrimitive=function(type,option,data,layer){
		var pointOption=$.extend(GetTogetherCommonOption,option);
		var defaultpointOption=$.extend(pointCommonOption,option);
		var lableOption=$.extend(GetTogetherlableOption,option);
		var defaultlableOption=$.extend(lableOption,option);
		this[type+"_"+layer]=this[type+"_"+layer] || this.scene.primitives.add(new Cesium.PointPrimitiveCollection());
		this[type+"_option"]=pointOption;
		this[type+"_view_data"]=data;
		this[type+"_label"+"_"+layer]=this[type+"_label"+"_"+layer] || this.scene.primitives.add(new Cesium.LabelCollection());
		var points=this[type+"_"+layer];
		var lablelayer=this[type+"_label"+"_"+layer];
		$.each(data, function(i) {
			var pointId=data[i].gisid+"_"+type;
			var lableId=data[i].gisid+"_"+type+"_"+"label";
			var count=data[i].obscount;
			var name = data[i].name+"";
			var position=[data[i].geometry.split(",")[0],
							data[i].geometry.split(",")[1], data[i].height];
			var point,label;
			if(count!=1){
				if(count<10){
					pointOption.color = Cesium.Color.fromBytes(145,212,103,255);
					pointOption.outlineColor = Cesium.Color.fromBytes(196,223,172,255);
					lableOption.pixelOffset = new Cesium.Cartesian2(-3,5);//偏移量
				}else if(count>=10 && count<100){
					pointOption.color = Cesium.Color.fromBytes(237,202,63,255);
					pointOption.outlineColor = Cesium.Color.fromBytes(232,214,140,255);
					lableOption.pixelOffset = new Cesium.Cartesian2(-5.5,4.5);//偏移量
				}else{
					pointOption.color = Cesium.Color.fromBytes(242,150,77,255);
					pointOption.outlineColor = Cesium.Color.fromBytes(241,170,127,255);
					lableOption.pixelOffset = new Cesium.Cartesian2(-8,4);//偏移量
				}
				point=points.add({
					id:pointId,
					pixelSize : pointOption.pixelSize,
			        color : pointOption.color,
			        outlineColor : pointOption.outlineColor,
			        outlineWidth : pointOption.outlineWidth,
			        maxRate : pointOption.maxRate,
			        position: Cesium.Cartesian3.fromDegrees(position[0], position[1],position[2])
				});
				lable = lablelayer.add({
					id:lableId,
					show : true,
					position : Cesium.Cartesian3.fromDegrees(position[0], position[1],position[2]),
					text : count+"",
					font : lableOption.font,
				    verticalOrigin :lableOption.verticalOrigin, //垂直方向以底部来计算标签的位置
				    pixelOffset : lableOption.pixelOffset,//偏移量
				    fillColor : lableOption.fillColor
				});
			}else{
				point=points.add({
					id:pointId,
					color :defaultpointOption.color,
					outlineColor :defaultpointOption.outlineColor,
					outlineWidth :defaultpointOption.outlineWidth ,
					pixelSize: defaultpointOption.pixelSize,
					position: Cesium.Cartesian3.fromDegrees(position[0], position[1],position[2]),
					translucencyByDistance : new Cesium.NearFarScalar(1.5e5, 1.0, 2.5e7, 0.3),
					scaleByDistance : new Cesium.NearFarScalar(1.5e5, 1.0, 2.5e7, 0.3)
				});
				lable = lablelayer.add({
					id:lableId,
					show : true,
					position : Cesium.Cartesian3.fromDegrees(position[0], position[1],position[2]),
					text : defaultlableOption.text?defaultlableOption.text:name,
					font : "18px 宋体",
					fillColor : Cesium.Color.RED,
					outlineColor : defaultlableOption.outlineColor,
					style : Cesium.LabelStyle.FILL,
					pixelOffset : new Cesium.Cartesian2(-18,-9),
					eyeOffset : defaultlableOption.eyeOffset,
					horizontalOrigin : defaultlableOption.horizontalOrigin,
				  	verticalOrigin :  Cesium.VerticalOrigin.BOTTOM, //垂直方向以底部来计算标签的位置
				  	scale : defaultlableOption.scale
				});
			}
			lable.layer=layer;
			point.layer=layer;
		});
	};
	
	//绘制图片
	_.prototype.drawBillboardByPrimitive=function(type,option,data,typename){
		var self=this;
		var option=$.extend(pointCommonOption,option);
		self[type]=self[type] || self.scene.primitives.add(new Cesium.BillboardCollection());
		self[type+"_line"]=self[type+"_line"] || self.scene.primitives.add(new Cesium.PolylineCollection());
		self["pinBuilder"]=self["pinBuilder"] || new Cesium.PinBuilder();
		self[type+"_option"]=option;
		var pinBuilder=self["pinBuilder"];
		var billboards=self[type];
		var polylines=self[type+"_line"];
		var warn=feature[type];
		var list=[];
		var flag=false;
		var array;
		for (var int = 0; int < data.length; int++) {
			if(!flag){
				array=new Array();
				array.push(data[int]);
				if(int==data.length-1){
					list.push(array);
					break;
				}
				flag=true;
			}
			if((data[int].ORDERN+1)==data[int+1].ORDERN && (data[int].LINEID==data[int+1].LINEID) && (data[int].warnLevel==data[int+1].warnLevel)){
				array.push(data[int+1]);
				if(int==data.length-2){
					list.push(array);
					break;
				}
			}else{
				list.push(array);
				flag=false;
			}
		}
		$.each(list, function(i,n) {
			if(n.length==1){
				var n=n[0];
				var color=warn[n.warnLevel].color;
				var position=[n.GEOMETRY.split(",")[0],
				              n.GEOMETRY.split(",")[1], n.HEIGHT];
				var billboard=billboards.add({
					position:Cesium.Cartesian3.fromDegrees(position[0], position[1],position[2]),
					image :pinBuilder.fromText(typename, color, 100).toDataURL(),
					verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
					pixelOffsetScaleByDistance:new Cesium.NearFarScalar(1.5e5, 1.0, 2.5e7, 0.3),
					scaleByDistance :new Cesium.NearFarScalar(1.5e5, 1.0, 2.5e7, 0.3),
					translucencyByDistance :new Cesium.NearFarScalar(1.5e5, 1.0, 2.5e7, 0.3)
				});
			}else{
				var n1=n[0];
				var color=warn[n1.warnLevel].color;
				var position=[n1.GEOMETRY.split(",")[0],
				              n1.GEOMETRY.split(",")[1], n1.HEIGHT];
				var billboard=billboards.add({
					position:Cesium.Cartesian3.fromDegrees(position[0], position[1],position[2]),
					image :pinBuilder.fromText(typename, color, 100).toDataURL(),
					verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
					pixelOffsetScaleByDistance:new Cesium.NearFarScalar(1.5e5, 1.0, 2.5e7, 0.3),
					scaleByDistance :new Cesium.NearFarScalar(1.5e5, 1.0, 2.5e7, 0.3),
					translucencyByDistance :new Cesium.NearFarScalar(1.5e5, 1.0, 2.5e7, 0.3)
				});
				var position=[];
				for (var int = 0; int < n.length; int++) {
					position.push(n[int].GEOMETRY.split(",")[0]);
					position.push(n[int].GEOMETRY.split(",")[1]);
					position.push(n[int].HEIGHT);
				}
				var width=warn[n[0].warnLevel].width;
				var color=warn[n[0].warnLevel].color;
				polylines.add({
					width : 2,
					material : Cesium.Material.fromType('PolylineOutline', {
				        color:Cesium.Color.RED
				    }),
					positions : Cesium.Cartesian3.fromDegreesArrayHeights(position)
//					distanceDisplayCondition:new Cesium.DistanceDisplayCondition(1.5e5, 2.5e5)
				});
			}
		});
	};
	/*
	 * 绘制模型方法
	 * type:绘制设备点类型
	 * option:设置属性样式对象
	 * data:绘制数据源
	 * */
	_.prototype.drawModelByPrimitive=function(type,option,data){
		var self=this;
		var opt=$.extend(modelCommonOption,modelOption[type.match(/.*_model/g)[0]]);
		self[type]=self[type] || self.scene.primitives.add(new Cesium.PrimitiveCollection());
		var modellayer=self[type];
		$.each(data, function(i) {
			var position=data[i].geometry?[data[i].geometry.split(",")[0],data[i].geometry.split(",")[1], data[i].height]:[data[i].longitude,data[i].latitude, data[i].height?data[i].height:0];
			var heading = -90;
			var pitch = 0;
			var roll = 0.1;
			var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
/*
			var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(
				    Cesium.Cartesian3.fromDegrees(position[0],position[1],position[2]));*/
			var modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(Cesium.Cartesian3.fromDegrees(position[0],position[1],position[2]),
					hpr);
			var id=data[i].id+"_"+type;
			var model = modellayer.add(Cesium.Model.fromGltf({
				id:id,
				url : opt.url,
				asynchronous:true,
			    modelMatrix : modelMatrix,
			    show : opt.show,                // default
			    scale :opt.scale,                 // double size
			    minimumPixelSize : opt.minimumPixelSize,          // never smaller than 128 pixels
			    maximumScale: opt.maximumScale,             // never larger than 20000 * model size (overrides minimumPixelSize)
			    allowPicking : opt.allowPicking,            // not pickable
			    debugShowBoundingVolume : opt.debugShowBoundingVolume, // default
			    debugWireframe : opt.debugWireframe
			}));
		});
	};
	
	/*
	 * 绘制lable方法
	 * type:绘制lable类型
	 * option:设置属性样式对象
	 * data:绘制数据源
	 * */
	_.prototype.drawLableByPrimitive=function(type,option,data){
		var self=this;
		var option=$.extend(lableOption,option);
		self[type]=self[type] || self.scene.primitives.add(new Cesium.PointPrimitiveCollection());
		self[type+"_label"]=self[type+"_label"] || self.scene.primitives.add(new Cesium.LabelCollection());
		var pointlayer=self[type];
		var lablelayer=self[type+"_label"];
		$.each(data, function(i) {
			var position=data[i].geometry?[data[i].geometry.split(",")[0],data[i].geometry.split(",")[1], data[i].height]:[data[i].longitude,data[i].latitude, data[i].height?data[i].height:100];
			var name=data[i].name?data[i].name+"":(heatMapTool.value?heatMapTool.value[i].toFixed(2):"");
			var id=data[i].id+"_"+type;
			var point=pointlayer.add({
				id:id,
				color :option.color,
				outlineColor :option.outlineColor,
				outlineWidth :option.outlineWidth ,
				pixelSize: option.pixelSize,
				position: Cesium.Cartesian3.fromDegrees(position[0], position[1],position[2]),
				translucencyByDistance : new Cesium.NearFarScalar(1.5e5, 1.0, 2.5e7, 1),
				scaleByDistance : new Cesium.NearFarScalar(1.5e5, 1.0, 2.5e7, 0.3)
			});
			var lab = lablelayer.add({
				id:id,
				show : true,
				position : Cesium.Cartesian3.fromDegrees(position[0], position[1],position[2]),
				text : option.text?option.text:name,
				font : option.font,
				fillColor : option.fillColor,
				outlineColor : option.outlineColor,
				style : option.style,
				pixelOffset : option.pixelOffset,
				eyeOffset : option.eyeOffset,
				horizontalOrigin : option.horizontalOrigin,
			  	verticalOrigin : option.verticalOrigin,
			  	scale : option.scale
			});
		});
	};
	
	/*
	 * 删除点设备方法
	 * */
	_.prototype.removePointByPrimitive=function(type){
		this[type] && this[type].removeAll();
	};

	/*
	 * 删除点设备方法,支持数组删除
	 * */
	_.prototype.removePointByPrimitivetypes=function(types){
		var self=this;
		$.each(types, function(i) {
			self[types[i]] && self[types[i]].removeAll();
		});
		
	};
	/*
	 * 删除点设备方法,删除视野之外数据
	 * */
	_.prototype.removePrimitiveByIds=function(types,data){
		var self=this;
		$.each(types, function(k) {
			var collection=self[types[k]];
			for(var i=0;i<data.length;i++){
				for(var j=0;j<collection.length;j++){
					if(collection.get(j).id.match(/\d*/g)[0]==data[i].id){
						collection.remove(collection.get(j));
				    }
				}
			}
		});
	};
	/*
	 * 删除点设备方法,按照电压等级删除
	 * */
	_.prototype.removeModelPrimitiveByVoltage=function(valtage){
		var self=this;
		var collection=self["ganta_model"];
		var data=drawTool["ganta_model_view_data"];
		if(data){
			for(var i=0;i<data.length;i++){
				for(var j=0;j<collection.length;j++){
					if((collection.get(j).id.match(/\d*/g)[0]==data[i].id) && ((data[i].voltagelevel==valtage)||((valtage=="tgy") && (data[i].voltagelevel>500)))){
						collection.remove(collection.get(j));
				    }
				}
			}
		}
	};
	/*
	 * 绘制线设备方法
	 * type:绘制设备线类型
	 * option:设置属性样式对象
	 * data:绘制数据源
	 * 
	_.prototype.drawPolylineByPrimitive=function(type,option,data){
		var scene=this.viewer.scene;
		var option=$.extend(lineCommonOption,option);
		this[type]=this[type] || this.scene.primitives.add(new Cesium.PrimitiveCollection());
		var polylines=this[type];
		var instances = [];
		$.each(data, function(i) {
			var lineArray=data[i].geometry.split(",");
			instances.push(new Cesium.GeometryInstance({
				geometry : new Cesium.PolylineGeometry({
					positions  : Cesium.Cartesian3.fromDegreesArrayHeights(lineArray)
				}),
				width : 2,
				vertexFormat : Cesium.PolylineMaterialAppearance.VERTEX_FORMAT
		    }));
		});
		polylines.add(new Cesium.Primitive({
			geometryInstances : instances,
			appearance : new Cesium.PolylineMaterialAppearance({
			    material : Cesium.Material.fromType('PolylineOutline',{
			    	color:Cesium.Color.RED
			    })
			})
		}));
	};*/
	/*
	 * 绘制线设备方法
	 * type:绘制设备线类型
	 * option:设置属性样式对象
	 * data:绘制数据源
	 * 
	 * */
	_.prototype.drawPolylineByPrimitive=function(type,option,data){
		var scene=this.viewer.scene;
		var option=$.extend(lineCommonOption,option);
		this[type]=this[type] || this.scene.primitives.add(new Cesium.PolylineCollection());
		var polylines=this[type];
		$.each(data, function(i) {
			var lineArray=data[i].geometry.split(",");
			for (var int = 0; int < lineArray.length; int++) {
				if((int-2)%3==0){
					lineArray[int]=parseFloat(lineArray[int])+30;
				}
			}
			var id=data[i].id;
			polylines.add({
				id:id,
				width : option.width,
				material : Cesium.Material.fromType('PolylineOutline', {
			        color:option.color,
			        outlineColor:option.color
			    }),
				positions : Cesium.Cartesian3.fromDegreesArrayHeights(lineArray)
//				distanceDisplayCondition:new Cesium.DistanceDisplayCondition(1.5e5, 2.5e5)
			});
		});
	};
	/*
	 * 绘制自定义多边形
	 * 
	 * */
	_.prototype.drawPolygonByChangeablePrimitive=function(type,option,data){
		var scene=this.viewer.scene;
		var option=$.extend(polygonCommonOption,option);
		this[type]=this[type] || this.scene.primitives.add(new Cesium.PrimitiveCollection());
		var polygon=this[type];
		var options = copyOptions(option, defaultSurfaceOptions);
    	var poly = new PolygonPrimitive(options);
	    poly.asynchronous = false;
	    poly.id=data.id;
	    polygon.add(poly);
	};
	/*
	 * 绘制边界
	 * 
	 * */
	_.prototype.drawPolygonByPrimitive=function(type,option,data){
		var scene=this.viewer.scene;
		var option=$.extend(polygonCommonOption,option);
		this[type]=this[type] || this.scene.primitives.add(new Cesium.PrimitiveCollection());
		var polygon=this[type];
		var instances1 = [];
		var instances2 = [];
		$.each(data.features, function(infoIndex, info) {
			var origcor = info.geometry.coordinates;
			var array=[];
			var newcor = [];
			var addadd = 2;
			/*if (origcor.length > 100)
			addadd = 20;*/
			for (var cnt = 0; cnt < origcor.length; cnt += addadd) {
				var newArray=[];
				newcor.push(origcor[cnt]);
				newcor.push(origcor[cnt + 1]);
				newArray.push(origcor[cnt]);
				newArray.push(origcor[cnt+1]);
				array.push(newArray);
			}
			var outlineid=info.id+"_provence_outline";
			var id=info.id+"_provence_fill";
			instances1.push(new Cesium.GeometryInstance({
				geometry : new Cesium.PolygonOutlineGeometry({
					polygonHierarchy : new Cesium.PolygonHierarchy(
				    	Cesium.Cartesian3.fromDegreesArray(newcor)
				  	),
				}),
				id:outlineid,
				attributes : {
					color:new Cesium.ColorGeometryInstanceAttribute(1.0, 1.0, 1.0, 1.0)
				}
		    }));
			instances2.push(new Cesium.GeometryInstance({
				geometry : Cesium.PolygonGeometry.fromPositions({
					 positions : Cesium.Cartesian3.fromDegreesArray(newcor)
				}),
				id:id,
				attributes : {
					color : new Cesium.ColorGeometryInstanceAttribute(1.0, 1.0, 1.0, 0.1)
				}
		    }));
		});
		polygon.add(new Cesium.Primitive({
			geometryInstances : instances2,
			appearance : new Cesium.PerInstanceColorAppearance( {
		        flat : true
		    })
		}));
		polygon.add(new Cesium.Primitive({
			geometryInstances : instances1,
			appearance : new Cesium.PerInstanceColorAppearance( {
		        flat : true
		    })
		}));
	};
	/*
	 * 绘制柱状图
	 * 
	 * */
	_.prototype.drawColumnByPrimitive=function(type,option,data){
		var self=this;
		var scene=self.viewer.scene;
		var option=$.extend(columnCommonOption,option);
		self[type]=self[type] || self.scene.primitives.add(new Cesium.PrimitiveCollection());
		self[type+"_label"]=self[type+"_label"] || self.scene.primitives.add(new Cesium.LabelCollection());
		var lablelayer=self[type+"_label"];
		var polygon=self[type];
		var instances1 = [];
		$.each(data, function(infoIndex, info) {
			var name=Math.random().toFixed(2);
			instances1.push(new Cesium.GeometryInstance({
				geometry : new Cesium.EllipseGeometry({
					center : Cesium.Cartesian3.fromDegrees(info.longitude,info.latitude),
					semiMinorAxis : 100000.0,
					semiMajorAxis : 100000.0,
					extrudedHeight:name*200000+300000.0,
					vertexFormat : Cesium.VertexFormat.POSITION_AND_NORMAL 
				}),
				attributes : {
				    color : Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.fromRandom({alpha : 1.0}))
				}
		    }));
			lablelayer.add({
				show : true,
				position : Cesium.Cartesian3.fromDegrees(info.longitude,info.latitude,name*200000+300000.0),
				text : option.text?option.text:name+"",
				font : option.font,
				fillColor : option.fillColor,
				outlineColor : option.outlineColor,
				style : option.style,
				pixelOffset : option.pixelOffset,
				eyeOffset : option.eyeOffset,
				horizontalOrigin : option.horizontalOrigin,
			  	verticalOrigin : option.verticalOrigin,
			  	scale : option.scale
			});
		});
		polygon.add(new Cesium.Primitive({
			geometryInstances : instances1,
			appearance : new Cesium.PerInstanceColorAppearance()
		}));
	};
	Map.DrawGeometry=_;
})(Map);