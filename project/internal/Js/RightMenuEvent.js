(function(Map){
	
	_.prototype.getDeviceInformation=function(url,gisid,callback,callback2){
		var obj = null;
		$.ajax({
			type : "POST",
			url : url,
			dataType : "json",
			data : {gisid:gisid},
			success : function(data){
				obj = data.obj;
				var tbody=callback(obj);
				callback2(tbody);
			}
		});
	}
	_.prototype.getDeviceInfo=function(url,callback,callback2){
		var obj = null;
		$.ajax({
			type : "POST",
			url : url,
			dataType : "json",
			success : function(data){
				var list=data.list;
				var obj=callback(list);
				callback2(obj);
			}
		});
	}
	//遍历根基对象属性获取对象的值
	_.prototype.formatting=function(obj,consult){
		for (var key in obj){
			if(consult.replace(/_/g,'').toLocaleUpperCase()==key.toLocaleUpperCase()){
				if(obj[key]==null){
					return "";
				}else{
					return obj[key];
				}
			}
		}
	}
	_.prototype.createSpanContent=function(field,obj){
		var self=this;
		var tbody = "";
		if(field[0].logoId==1){
			tbody +="<span style='font-size:12pt;font-weight:bold'>" +field[0].fieldNote+":"+self.formatting(obj,field[0].fieldName)+"</span>";
		}
		for(var int = 1; int < field.length; int = int+2){
			if((field.length-1)%2==0){
				tbody +="<span style='font-size:12pt;font-weight:bold'>" +field[int].fieldNote+":"+self.formatting(obj,field[int].fieldName)+"</span>"+
				"<span style='font-size:12pt;font-weight:bold'>" +field[int+1].fieldNote+":"+self.formatting(obj,field[int+1].fieldName)+"</span>";
			}else{
				if(int == (field.length-1)){
					tbody +="<span style='font-size:12pt;font-weight:bold'>" +field[0].fieldNote+":"+self.formatting(obj,field[0].fieldName)+"</span>";
				}else{
					tbody +="<span style='font-size:12pt;font-weight:bold'>" +field[int].fieldNote+":"+self.formatting(obj,field[int].fieldName)+"</span>"+
					"<span style='font-size:12pt;font-weight:bold'>" +field[int+1].fieldNote+":"+self.formatting(obj,field[int+1].fieldName)+"</span>";
				}
			}
		}
		return tbody;
	};
	_.prototype.createTableContentByList=function(field,list){
		var self=this;
		var tbody = "";
		var thead="";
		$.each(list,function(index,info){
			tbody +="<tr>";
			for(var int = 0; int < field.length; int++){
				tbody +="<td>"+self.formatting(info,field[int].fieldName)+"</td>";
			}
			tbody +="</tr>";
		});
		thead+="<tr>";
		for(var int = 0; int < field.length; int++){
			thead +="<td>"+field[int].fieldNote+"</td>";
		}
		thead+="</tr>";
		return {
			thead:thead,
			tbody:tbody
		};
	}
	_.prototype.createTableContent=function(field,obj){
		var self=this;
		var tbody = "";
		if(field[0].logoId==1){
			tbody +="<tr>" +
						"<td colspan='2'>"+field[0].fieldNote+"</td>" +
						"<td colspan='2'>"+self.formatting(obj,field[0].fieldName)+"</td>" +
					"</tr>"
		}
		for(var int = 1; int < field.length; int = int+2){
			if((field.length-1)%2==0){
				tbody +="<tr>" +
							"<td>"+field[int].fieldNote+"</td>" +
							"<td>"+self.formatting(obj,field[int].fieldName)+"</td>" +
							"<td>"+field[int+1].fieldNote+"</td>" +
							"<td>"+self.formatting(obj,field[int+1].fieldName)+"</td>" +
						"</tr>";
			}else{
				if(int == (field.length-1)){
					tbody +="<tr>" +
								"<td colspan='2'>"+field[int].fieldNote+"</td>" +
								"<td colspan='2'>"+self.formatting(obj,field[int].fieldName)+"</td>" +
							"</tr>";
				}else{
					tbody +="<tr>" +
								"<td>"+field[int].fieldNote+"</td>" +
								"<td>"+self.formatting(obj,field[int].fieldName)+"</td>" +
								"<td>"+field[int+1].fieldNote+"</td>" +
								"<td>"+self.formatting(obj,field[int+1].fieldName)+"</td>" +
							"</tr>";
				}
			}
		}
		return tbody;
	}
	//基础信息
	_.prototype.baseInfo = function(){
		var self=this;
		$("#baseInfo table thead").empty();
		$("#baseInfo table tbody").empty();
		var selectedObj=map.selectedObj;
		var tbody,thead;
		if(selectedObj.type!="heat" && selectedObj.type!="noheat"){
			var type=selectedObj.type;
			var id=selectedObj.id;
			var field = null;
			$.ajax({
    			type : "POST",
    			url : 'sysFieldConfig!findAllSysFieldConfigbyType.action',
    			dataType : "json",
    			data : {type:type},
    			success : function(data){
    				if(data.list.length>0){
    					field = data.list;
    					if(type=="weatherstation"){
    						self.getDeviceInformation("attWeatherStationInfo!findByGISId.action",id,function(obj){
    							return self.createTableContent(field,obj);
    						},function(tbody){
    							$("#baseInfo table tbody").append(tbody);
    	        				$("#baseInfo").dialog("open");
    						});
    					}else if(type=="fengdianchang"){
    						self.getDeviceInformation("attWindInfo!findByGISId.action",id,function(obj){
    							return self.createTableContent(field,obj);
    						},function(tbody){
    							$("#baseInfo table tbody").append(tbody);
    	        				$("#baseInfo").dialog("open");
    						});
    					}else if(type=="fengji" || type=="fengjimodel"){
    						self.getDeviceInformation("attFanInfo!findByGISId.action",id,function(obj){
    							return self.createTableContent(field,obj);
    						},function(tbody){
    							$("#baseInfo table tbody").append(tbody);
    	        				$("#baseInfo").dialog("open");
    						});
    					}else if(type=="obs" || type=="obsmodel"){
    						self.getDeviceInformation("obsStation!findByGISId.action",id,function(obj){
    							return self.createTableContent(field,obj);
    						},function(tbody){
    							$("#baseInfo table tbody").append(tbody);
    	        				$("#baseInfo").dialog("open");
    						});
    					}else if(type=="bdz" || type=="bdzmodel"){
    						self.getDeviceInformation("attSubstationInfo!findByGISId.action",id,function(obj){
    							return self.createTableContent(field,obj);
    						},function(tbody){
    							$("#baseInfo table tbody").append(tbody);
    	        				$("#baseInfo").dialog("open");
    						});
    					}else if(type=="ganta" || type=="gantamodel"){
    						self.getDeviceInformation("attPhotovoltaicInfo!findByGISId.action",id,function(obj){
    							return self.createTableContent(field,obj);
    						},function(tbody){
    							$("#baseInfo table tbody").append(tbody);
    	        				$("#baseInfo").dialog("open");
    						});
    					}else if(type=="guangfudianchang" || type=="guangfudianchangmodel"){
    						self.getDeviceInformation("attPhotovoltaicInfo!findByGISId.action",id,function(obj){
    							return self.createTableContent(field,obj);
    						},function(tbody){
    							$("#baseInfo table tbody").append(tbody);
    	        				$("#baseInfo").dialog("open");
    						});
    					}else if(type=="powerplant"){
    						self.getDeviceInformation("attPowerPlantInfo!findByGISId.action",id,function(obj){
    							return self.createTableContent(field,obj);
    						},function(tbody){
    							$("#baseInfo table tbody").append(tbody);
    	        				$("#baseInfo").dialog("open");
    						});
    					}else if(type=="inverter"){
    						self.getDeviceInformation("attPvInverterInfo!findByGISId.action",id,function(obj){
    							return self.createTableContent(field,obj);
    						},function(tbody){
    							$("#baseInfo table tbody").append(tbody);
    	        				$("#baseInfo").dialog("open");
    						});
    					}else if(type=="windtower"){
    						self.getDeviceInformation("attWindTowerInfo!findByGISId.action",id,function(obj){
    							return self.createTableContent(field,obj);
    						},function(tbody){
    							$("#baseInfo table tbody").append(tbody);
    	        				$("#baseInfo").dialog("open");
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
    						thead="<tr><td>面积</td></tr>";
    						tbody="<tr>\n" +
    						"  <td>"+areaValue+"万平方公里"+"</td>\n" + 
    						"</tr>";
    						$("#baseInfo table thead").append(thead);
	        				$("#baseInfo table tbody").append(tbody);
	        				$("#baseInfo").dialog("open");
    					}
    				}
    			}
    		});
		}else{
			if(selectedObj.type=="noheat"){
				thead="<tr><td>经度</td><td>纬度</td></tr>";
				tbody="<tr>\n" +
				"  <td>"+selectedObj.x+"</td>\n" + 
				"  <td>"+selectedObj.y+"</td>\n" + 
				"</tr>";
				$("#baseInfo table thead").append(thead);
				$("#baseInfo table tbody").append(tbody);
				$("#baseInfo").dialog("open");
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
						thead="<tr><td>经度</td><td>纬度</td><td>信息</td></tr>";
						tbody="<tr>\n" +
						"  <td>"+x+"</td>\n" + 
						"  <td>"+y+"</td>\n" + 
						"  <td>"+data+"</td>\n" + 
						"</tr>";
						$("#baseInfo table thead").append(thead);
	    				$("#baseInfo table tbody").append(tbody);
	    				$("#baseInfo").dialog("open");
					}
				});
			}
		}
	};
	
	//预测发布时间查询
	_.prototype.forecastReleaseTimeQuery =function(){
		var obj = map.selectedObj;
		var geodata= obj.x + "," + obj.y;
		if(obj.type=="polygon"){
			var position=[];
			for (var int = 0; int < obj.position.length; int++) {
				position.push(obj.position.formatString());
			}
			geodata=position.formatString();
		}
		var param={
			feature :heatMapTool["type"]?heatMapTool["type"]:"temperature",
			pack:pack,
			geotype :obj.type,
			geodata :geodata
		};
		var dialogdiv = echart.containerInit("package","预测发布时间查询",true,false,param.feature);
		$.get("dataPackage!oneDayPackageList.action?day="+pack.substr(0,8)).done(function(data){
			var currentPackagelist= eval('('+data.oneDayPackageList+')');
			$(dialogdiv).find(".package").empty();
			$.each(currentPackagelist,function(index,value){
				var textValue = scollDateTool.formatDateToString(value);
				var option="<option value='"+value+"'>"+textValue+"</option>";
				$(dialogdiv).find(".package").append(option);
			});
		});
		scollDateTool.scollDateInit($(dialogdiv).find(".date"),"date",echart.formatDate(pack),function(dateText,inst){
			var day = dateText.replace(/-/g,"");
			$.get("dataPackage!oneDayPackageList.action?day="+day).done(function(data){
				var currentPackagelist= eval('('+data.oneDayPackageList+')');
				$(dialogdiv).find(".package").empty();
    			$.each(currentPackagelist,function(index,value){
    				var textValue = scollDateTool.formatDateToString(value);
    				var option="<option value='"+value+"'>"+textValue+"</option>";
    				$(dialogdiv).find(".package").append(option);
    			});
			});
		});
		$(dialogdiv).find(".containerbtn").bind("click",function(){
			param.feature=echart.featureArray.length>0?echart.featureArray+"":heatMapTool["type"];
			param.pack=$(dialogdiv).find(".package").val();
			echart.echartReder("weatherInfoChart!showCurInfo.action",param,echart.featureArray.length>1?true:false);
		});
		echart.echartReder("weatherInfoChart!showCurInfo.action",param,false);
	}
	
	//预测发布时段查询
	_.prototype.forecastTimeQuantumQuery = function(){
		var obj = map.selectedObj;
		var geodata= obj.x + "," + obj.y;
		if(obj.type=="polygon"){
			var position=[];
			for (var int = 0; int < obj.position.length; int++) {
				position.push(obj.position.formatString());
			}
			geodata=position.formatString();
		}
		var param={
			feature :heatMapTool["type"]?heatMapTool["type"]:"temperature",
			geotype :obj.type,
			geodata : geodata
		};
		var dialogdiv = echart.containerInit("timeinterval","预测发布时段查询",true,false,param.feature);
		scollDateTool.scollDateInit($(dialogdiv).find('.hisStartTime'),"datetime",echart.formatDateTime(pack,0),null);
		scollDateTool.scollDateInit($(dialogdiv).find('.hisEndTime'),"datetime",echart.formatDateTime(pack,3),null);
		var starttime=$(dialogdiv).find(".hisStartTime").val().replace(/-|\s|:/g,"");
		var stoptime=$(dialogdiv).find('.hisEndTime').val().replace(/-|\s|:/g,"");
		$(dialogdiv).find(".containerbtn").bind("click",function(){
			starttime=$(echart.dialogdiv).find(".hisStartTime").val().replace(/-|\s|:/g,"");
			stoptime=$(echart.dialogdiv).find('.hisEndTime').val().replace(/-|\s|:/g,"");
			param.feature=echart.featureArray.length>0?echart.featureArray+"":heatMapTool["type"],
			param=$.extend({},param,{starttime:starttime,stoptime:stoptime});
			echart.echartReder("weatherInfoChart!TimeQuantum.action",param,echart.featureArray.length>1?true:false);
		});
		param = $.extend({},param,{starttime:starttime,stoptime:stoptime});
		echart.echartReder("weatherInfoChart!TimeQuantum.action",param,false);
		
	}
	
	//月均气象统计
	_.prototype.monthlyAverageMeteorologicalStatistics = function(){
		alert("月均气象统计");
	}
	
	//气象监测与预测
	_.prototype.meteorologicalMonitoringAndForecasting = function(){
		var obj = map.selectedObj;
		var param={
			feature :heatMapTool["type"]?heatMapTool["type"]:"temperature",
			pack:pack,
			geodata :obj.x + "," + obj.y,
			stationId:obj.id
		};
		var dialogdiv = echart.containerInit("timeinterval","预测与监测查询",false,false,null);
		scollDateTool.scollDateInit($(dialogdiv).find('.hisStartTime'),"datetime",echart.formatDateTime(pack,0),null);
		scollDateTool.scollDateInit($(dialogdiv).find('.hisEndTime'),"datetime",echart.formatDateTime(pack,3),null);
		var starttime=$(dialogdiv).find(".hisStartTime").val().replace(/-|\s|:/g,"");
		var stoptime=$(dialogdiv).find('.hisEndTime').val().replace(/-|\s|:/g,"");
		$(echart.dialogdiv).find(".containerbtn").bind("click",function(){
			starttime=$(dialogdiv).find(".hisStartTime").val().replace(/-|\s|:/g,"");
			stoptime=$(dialogdiv).find('.hisEndTime').val().replace(/-|\s|:/g,"");
			param=$.extend({},param,{starttime:starttime,stoptime:stoptime});
			echart.echartReder("weatherInfoChart!focastAndMonitor.action",param,false);
		});
		param = $.extend({},param,{starttime:starttime,stoptime:stoptime});
		echart.echartReder("weatherInfoChart!focastAndMonitor.action",param,false);
	}
	//遥测数据
	_.prototype.yaoce = function(){
		var obj = map.selectedObj;
		var param={
			stationId:obj.id
		};
		var dialogdiv = echart.containerInit("timeinterval","遥测数据查询",false,false,null);
		var titleDiv=dialogdiv.getElementsByClassName("titlediv")[0];
		var selectText=document.createElement("span");
		selectText.style.marginLeft="40px";
		selectText.innerHTML="遥测指标";
		var select=document.createElement("select");
		titleDiv.insertBefore(select,titleDiv.getElementsByClassName("containerbtn")[0]);
		titleDiv.insertBefore(selectText,select); 
		$.ajax({
			type : "POST",
			url : 'weatherInfoChart!yaocePowerTypeSelect.action',
			data:param,
			dataType : "json",
			success : function(data){
				$.each(data.list,function (index,value){
					$(select).append("<option value='"+value.powerType+"'>"+value.powerName+"</option>");
				});
				scollDateTool.scollDateInit($(dialogdiv).find('.hisStartTime'),"datetime",echart.formatDateTime(pack,0),null);
				scollDateTool.scollDateInit($(dialogdiv).find('.hisEndTime'),"datetime",echart.formatDateTime(pack,3),null);
				var starttime=$(dialogdiv).find(".hisStartTime").val().replace(/-|\s|:/g,"");
				var stoptime=$(dialogdiv).find('.hisEndTime').val().replace(/-|\s|:/g,"");
				$(echart.dialogdiv).find(".containerbtn").bind("click",function(){
					starttime=$(dialogdiv).find(".hisStartTime").val().replace(/-|\s|:/g,"");
					stoptime=$(dialogdiv).find('.hisEndTime').val().replace(/-|\s|:/g,"");
					param=$.extend({},param,{starttime:starttime,stoptime:stoptime,powerType:$(select).val()});
					echart.echartReder("weatherInfoChart!yaoce.action",param,false);
				});
			}
		});
	}
	//实测数据
	_.prototype.actualMeasurement = function(){
		var obj = map.selectedObj;
		var param={
			geotype:obj.type,
			stationId:obj.id
		};
		var dialogdiv = echart.containerInit("timeinterval","实测数据查询",false,false,null);
		scollDateTool.scollDateInit($(dialogdiv).find('.hisStartTime'),"datetime",echart.formatDateTime(pack,0),null);
		scollDateTool.scollDateInit($(dialogdiv).find('.hisEndTime'),"datetime",echart.formatDateTime(pack,3),null);
		var starttime=$(dialogdiv).find(".hisStartTime").val().replace(/-|\s|:/g,"");
		var stoptime=$(dialogdiv).find('.hisEndTime').val().replace(/-|\s|:/g,"");
		$(echart.dialogdiv).find(".containerbtn").bind("click",function(){
			starttime=$(dialogdiv).find(".hisStartTime").val().replace(/-|\s|:/g,"");
			stoptime=$(dialogdiv).find('.hisEndTime').val().replace(/-|\s|:/g,"");
			param=$.extend({},param,{starttime:starttime,stoptime:stoptime});
			echart.echartReder("weatherInfoChart!realMeature.action",param,false);
		});
		param=$.extend({},param,{starttime:starttime,stoptime:stoptime});
		echart.echartReder("weatherInfoChart!realMeature.action",param,false);
	}
	
	//预测偏差
	_.prototype.predictionBias = function(){
		var obj = map.selectedObj;
		var param={
			station_Id:obj.id
		};
		var dialogdiv = echart.containerInit("timeinterval","预测偏差",false,true,null);
		scollDateTool.scollDateInit($(dialogdiv).find('.hisStartTime'),"datetime",echart.formatDateTime(pack,0),null);
		scollDateTool.scollDateInit($(dialogdiv).find('.hisEndTime'),"datetime",echart.formatDateTime(pack,3),null);
		$.ajax({
			type : "POST",
			url : 'weatherType!findAll.action',
			dataType : "json",
			async : false,
			success : function(data){
				$(dialogdiv).find(".featureType").empty();
				$.each(data.list,function (index,value){
					$(dialogdiv).find(".featureType").append("<option value='"+value.predictionerror+"'>"+value.name+"</option>");
				});
			}
		});
		var featureType=$(dialogdiv).find('.featureType').val();
		var starttime=$(dialogdiv).find(".hisStartTime").val().replace(/-|\s|:/g,"");
		var stoptime=$(dialogdiv).find('.hisEndTime').val().replace(/-|\s|:/g,"");
		$(dialogdiv).find(".containerbtn").bind("click",function(){
			featureType=$(dialogdiv).find('.featureType').val();
			starttime=$(dialogdiv).find(".hisStartTime").val().replace(/-|\s|:/g,"");
			stoptime=$(dialogdiv).find('.hisEndTime').val().replace(/-|\s|:/g,"");
			param=$.extend({},param,{starttime:starttime,stoptime:stoptime,vars:featureType});
			echart.echartReder("weatherInfoChart!MonitoringBias.action",param,false);
		});
		param=$.extend({},param,{starttime:starttime,stoptime:stoptime,vars:featureType});
		echart.echartReder("weatherInfoChart!MonitoringBias.action",param,false);
	}
	
	
	function _(){
	}
	Map.RightMenuEvent=_;
})(Map);