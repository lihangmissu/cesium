(function(Map){
	var ThresholdInitial = null; 
	var ShowSetting = null;
	var dialogExtendOptions = {
		"closable" : true,
		"maximizable" : true,
		"minimizable" : true,
		"minimizeLocation" : "left",
		"collapsable" : true,
		"dblclick" : "collapse"
	};
				
	function dialogOptions(width,height,title){
		return {
			"title":title,
			"width":width,
			"height":height,
			"resizable" : true,
			"draggable" : true
		};
	}
	
	//动态创建table的tr和td,并生成行tr信息
	function dynamicCreateTable(rows,columns,table){
		for(var i=0;i<rows;i++){
			var tr = document.createElement("tr");
			for(var j=0;j<columns;j++){
				var td =  document.createElement("td");
				tr.appendChild(td);
			}
			table.append($(tr));
		}
	}
	
	//格式化日期时间格式
	function formatDateTimeString(time,type){
		time = time+"";
		if(type){
			return timeString = time.substr(0, 4) + "-" + time.substr(4, 2) + "-" + time.substr(6, 2) + "_" + time.substr(8, 2) + ":" + time.substr(10, 2);
		}else{
			return timeString = time.substr(0, 4) + "-" + time.substr(4, 2) + "-" + time.substr(6, 2) + " " + time.substr(8, 2) + ":" + time.substr(10, 2);
		}
	};
	
	//数据字符的转义
	function alarmTypeEsc(data){
		switch(data){
			case "ICE" : return "覆冰";break;
			case "Rain" : return "降水";break;
			case "ThunderWarning" : return "雷电";break;
			case "TWarning" : return "温度";break;
			case "WndWarning" : return "大风";break;
			case "WIND" : return "大风";break;
			case "THUNDER" : return "雷电";break;
			case "Temperature" : return "温度";break;
			default: alert("你没有选择"); 
		}
	}
	
	//根据时间段获取告警线路名称并绑定到下拉列表
	function getLineNameByDateTime(alarmDialog){
		$.ajax({
			type : "POST",
			url : "alarmHbase!GetAlarmQueryCriteria.action",
			dataType : "json",
			data : {
				starttime:$(alarmDialog).find(".startTime").val().replace(/-|\s|:/g,""),
				endtime:$(alarmDialog).find(".endTime").val().replace(/-|\s|:/g,""),
			},
			success : function(data){
				$(alarmDialog).find(".lineName").empty();
				$.each(data.lineAlarm,function(Index,Info){
					option ="<option value='"+Info.lineid+"'>"+Info.linename+"</option>";
					$(alarmDialog).find(".lineName").append(option);
				});
			}
		});
	}
	//告警类型
	function getAlarmType(alarmDialog,flag){
		$.ajax({
			type : "POST",
			url : "alarmHbase!findGroupbyAlarmSet.action",
			dataType : "json",
			success : function(data){
				$(alarmDialog).find(".alarmType").empty();
				var option_1 ="<option value='all'>--请选择--</option>";
				var option_2 ="<option value='all'>--请选择--</option>";
				$.each(data.alarmset,function(Index,Info){
					option_1 +="<option value='"+Info.alarmType+"'>"+alarmTypeEsc(Info.alarmType)+"</option>";
					option_2 +="<option value='"+Info.type+"'>"+alarmTypeEsc(Info.alarmType)+"</option>";
				});
				if(flag){
					$(alarmDialog).find(".alarmType").append(option_1);
				}else{
					$(alarmDialog).find(".alarmType").append(option_2);
				}
				
			}
		});
	}
	
	//根据线路告警类型获取线路告警等级
	function getLineAlarmLevel(alarmDialog){
		$.ajax({
			type : "POST",
			url : "alarmHbase!GetAlarmLevelByalarmtype.action",
			dataType : "json",
			data :{alarmtype:$(alarmDialog).find(".alarmType").val()},
			success : function(data){
				$(alarmDialog).find(".alarmlevel").empty();
				var option="<option value='all'>--请选择--</option>";
				$.each(data.alarmsetlevel,function(Index,Info){
					option+="<option value='"+Info.level+"'>"+Info.level+"</option>";
				});
				$(alarmDialog).find(".alarmlevel").append(option);
			}
		});
	}
	
	
	//根据时间段获取获取告警时间
	function getAlarmTime(alarmDialog){
		$.ajax({
			type : "POST",
			url : "alarmHbase!GetPackTime.action",
			dataType : "json",
			data : {
				starttime:$(alarmDialog).find(".startTime").val().replace(/-|\s|:/g,"").substr(0,8),
				endtime:$(alarmDialog).find(".endTime").val().replace(/-|\s|:/g,"").substr(0,8)
			},
			success : function(data){
				var packtime=data.packTime;
				$(alarmDialog).find(".alarmTime").empty();
				var opt="<option value='all'>--全部--</option>";
				if(packtime.length>0){
					if(packtime.indexOf(",")>0){
						//表示存在多个包结果
						var arr=packtime.split(","); //字符分割 
						for (var i=0;i<arr.length;i++ ) { 
							opt+="<option value='"+arr[i]+"'>"+formatDateTimeString(arr[i],true)+"</option>";
						} 
					}else{
						//表示存在一个包结果
						opt+="<option value='"+packtime+"'>"+formatDateTimeString(packtime,true)+"</option>";
					}
				}
				$(alarmDialog).find(".alarmTime").append(opt);
			}
		});
	}
	
	//线路告警查询
	_.prototype.lineAlarmQuery = function(){
		$("#alarmTable tr:not(:first)").remove();
		$("#alarmDialog").dialog(dialogOptions(800,600,"线路告警查询")).dialogExtend(dialogExtendOptions);
		dynamicCreateTable(14,10,$("#alarmDialog table[class='titleTable']"));
		scollDateTool.scollDateInit($("#alarmDialog").find('.startTime'),"datetime",echart.formatDateTime(pack,0),null);
		scollDateTool.scollDateInit($("#alarmDialog").find('.endTime'),"datetime",echart.formatDateTime(pack,3),null);
		getLineNameByDateTime($("#alarmDialog")); //根据时间段获取告警线路名称
		getAlarmType($("#alarmDialog"),true); //获取线路告警类型
		getLineAlarmLevel($("#alarmDialog")); //获取线路告警等级
		getAlarmTime($("#alarmDialog")); //获取线路告警时间
		$("#alarmDialog input").bind('change',function(){
			getLineNameByDateTime($("#alarmDialog")); //根据时间段获取告警线路名称
			getAlarmTime($("#alarmDialog")); //获取线路告警时间
		});
		$("#alarmDialog select[class='alarmType']").bind('change',function(){
			getLineAlarmLevel($("#alarmDialog")); //获取线路告警等级
		});
		$("#alarmDialog button[class='alarmQuery']").bind("click",function(){
			//数据验证
			var startTime = $("#alarmDialog input[class='startTime']").val().replace(/-|\s|:/g,"");
			var endTime = $("#alarmDialog input[class='endTime']").val().replace(/-|\s|:/g,"");
			var lineid =  $("#alarmDialog select[class='lineName']").val();
			var alarmType = $("#alarmDialog select[class='alarmType']").val();
			var alarmLevel = $("#alarmDialog select[class='alarmlevel']").val();
			var packTime = $("#alarmDialog select[class='alarmTime']").val();
			if(parseFloat(startTime)>parseFloat(endTime)){
				alert("查询开始时间不得大于结束时间!","提示");
			}else{
				if(alarmType=="all"){
					alert("请选择查询告警类型!","提示");
				}else{
					$.ajax({
						type : "POST",
						url : "alarmHbase!LineAlarmSelect.action",
						dataType : "json",
						data : {
							starttime:startTime,
							endtime:endTime,
							packagetime:packTime,
							linename:line,
							alarmtype:alarmType,
							alarmLevel:alarmLevel
						},
						success : function(data){
							if(data.list.length>0){
								$("#alarmTable tr:not(:first)").remove();
								$.each(data.list,function(index,Info){
									var tbody = "<tr>" +
										"<td>"+Info.ID+"</td>" +
										"<td>"+Info.NAME+"</td>" +
										"<td>"+Info.LINENAME+"</td>" +
										"<td>"+Info.VOLTAGELEVEL+"</td>" +
										"<td>"+Info.UNIT+"</td>" +
										"<td>"+alarmTypeEsc(alarmType)+"</td>" +
										"<td>"+Info.warnLevel+"</td>" +
										"<td>"+Info.warnValue+"</td>" +
										"<td>"+formatDateTimeString(Info.t1,false)+"</td>" +
										"<td>"+formatDateTimeString(Info.t2,false)+"</td>" +
									"</tr>"
									$("#alarmTable").append(tbody);
								});
								if(data.list.length<14){
									dynamicCreateTable(14-data.list.length,10,$("#alarmDialog table[class='titleTable']"));
								}
							}else{
								$("#alarmTable tr:not(:first)").remove();
								dynamicCreateTable(14,10,$("#alarmDialog table[class='titleTable']"));
							}
						}
					});
				}
			}
		});
	}
	
	//根据告警类型获取告警阈值
	function getAlarmThreshold(ThresholdSetting){
		$.ajax({
			type : "POST",
			url : "alarmSet!findAlarmSetByType.action",
			dataType : "json",
			data : {type:$(ThresholdSetting).find(".alarmType").val()},
			success : function(data){
				ThresholdInitial=data.list;
				$(ThresholdSetting).find(".alarmThreshold").empty();
				$.each(data.list,function(Index,Info){
					var temp = alarmTypeEsc(Info.type) +" 预警,预警等级 "+Info.level+",开始值 "+Info.mininum+
					",结束值 "+Info.maxinum+",颜色 "+Info.name+",rgb("+Info.rgb+")";
					var option = "<option value='"+temp+"'>"+temp+"</option>"
					$(ThresholdSetting).find(".alarmThreshold").append(option);
				});
			}
		});
	}
	
	//去除字符串中所有空格
	 function removeAllSpace(str){
	     return str.replace(/\s+/g,"");
	 }
	
	//数据效验验证是否为正整数（不包括0）
	function isPositiveInteger(string) {
		string = removeAllSpace(string)
	    var reg = /^\d+$/;
	    return reg.test(string);
	}
	
	//数据效验是否为数字
	function isNumber(string){
		string = removeAllSpace(string)
		var reg = new RegExp(/\d+/g);
		return reg.test(string);
	}
	
	//验证颜色值RGB取值及范围
	function checkIsRgbValue(colorValue){
		var reg = /^\d+$/;
		if(reg.test(colorValue)){
			if(parseInt(colorValue)>=0 && parseInt(colorValue)<=255){
				return true;
			}else{
				return false;
			}
		}else{
			return false;
		}
	}
	
	//用于阈值编辑对象
	function obj(level,maxinum,mininum,name,rgb,type,alarmtype,alarmname){
		this.id=id;
		this.level=level;
		this.maxinum=maxinum;
		this.mininum=mininum;
		this.name=name;
		this.rgb=rgb;
		this.type=type;
		this.alarmtype=alarmtype;
		this.alarmname=alarmname;
	}
	
	
	//告警阈值设置
	_.prototype.alarmThresholdSetting = function(){
		$("#alarmThresholdSetting").dialog(dialogOptions(640,480,"告警阈值设置")).dialogExtend(dialogExtendOptions);
		getAlarmType($("#alarmThresholdSetting"),false); //获取告警类型
		$("#alarmThresholdSetting").find(".alarmType").bind("change",function(){ //告警类型改变切换显示当前告警阈值
			ThresholdInitial = null;
			$("#alarmThresholdSetting").find(".alarmLevel").val("");
			$("#alarmThresholdSetting").find(".startValue").val("");
			$("#alarmThresholdSetting").find(".endValue").val("");
			$("#alarmThresholdSetting").find(".colorText").val("");
			$("#alarmThresholdSetting").find(".RValue,.GValue,.BValue").val("");
			getAlarmThreshold($("#alarmThresholdSetting"));
		});
		$("#alarmThresholdSetting").find(".alarmThreshold").bind('change',function(){ //点击选中已有告警阈值信息执行操作
			if($("#alarmThresholdSetting").find(".alarmThreshold").val()){
				$("#alarmThresholdSetting").find(".alarmDetails").empty();
				var val = $("#alarmThresholdSetting").find(".alarmThreshold").val()+"";
				var color = val.split(",")[5]+","+val.split(",")[6]+","+val.split(",")[7];
				var Details=document.createElement("span");
				Details.setAttribute("style","font-size:12px;");
				Details.innerHTML =val.split(",")[0]+","+val.split(",")[1]+","+val.split(",")[2]+","+val.split(",")[3]+","+val.split(",")[4];
				$("#alarmThresholdSetting").find(".alarmDetails").append($(Details));
				var ColorDiv = document.createElement("div");
				ColorDiv.setAttribute("class","colordiv")
				ColorDiv.setAttribute("style","width:25px;height:15px;float:right;position:relative;margin-top:1px;margin-right:5px;background-color:"+color+";");
				$("#alarmThresholdSetting").find(".alarmDetails").append($(ColorDiv));
				//将选中信息结果展示在修改框
				$("#alarmThresholdSetting").find(".alarmLevel").val(val.split(",")[1].split(" ")[1]);
				$("#alarmThresholdSetting").find(".startValue").val(val.split(",")[2].split(" ")[1]);
				$("#alarmThresholdSetting").find(".endValue").val(val.split(",")[3].split(" ")[1]);
				$("#alarmThresholdSetting").find(".colorText").val(val.split(",")[4].split(" ")[1]);
				$("#alarmThresholdSetting").find(".RValue").val(color.substring(4,color.length-1).split(",")[0]);
				$("#alarmThresholdSetting").find(".GValue").val(color.substring(4,color.length-1).split(",")[1]);
				$("#alarmThresholdSetting").find(".BValue").val(color.substring(4,color.length-1).split(",")[2]);
			}
		});
		$("#alarmThresholdSetting").find(".addButton").bind('click',function(){ //添加按钮
			if($("#alarmThresholdSetting").find(".alarmType").val()=="all"){
				alert("请选择告警类型","提示");
			}else{
				var alarmType=$("#alarmThresholdSetting").find(".alarmType").val();
				var alarmLevel = $("#alarmThresholdSetting").find(".alarmLevel").val();
				var startValue = $("#alarmThresholdSetting").find(".startValue").val();
				var endValue = $("#alarmThresholdSetting").find(".endValue").val();
				var colorText = $("#alarmThresholdSetting").find(".colorText").val();
				var rValue = $("#alarmThresholdSetting").find(".RValue").val();
				var gValue = $("#alarmThresholdSetting").find(".GValue").val();
				var bValue = $("#alarmThresholdSetting").find(".BValue").val();
				if(!isPositiveInteger(alarmLevel)){
					alert("告警等级不能为空,且只能是大于0的正整数!","提示");
				}else{
					if(!isNumber(startValue)){
						alert("开始值不能为空,且只能是数字!","提示");
					}else{
						if(!isNumber(endValue)){
							alert("结束值不能为空,且只能是数字!","提示");
						}else{
							if(colorText==""){
								alert("告警颜色不能为空,建议使用纯色(如红色、蓝色、绿色等)!","提示");
							}else{
								if(rValue=="" || gValue=="" || bValue==""){
									alert("RGB对应的颜色值不为空!","提示");
								}else{
									if(!checkIsRgbValue(rValue) || !checkIsRgbValue(gValue) || !checkIsRgbValue(bValue)){
										alert("RGB颜色值请输入0~255之间范围的正整数!","提示");
									}else{
										if($("#alarmThresholdSetting").find(".alarmThreshold").prop('selectedIndex')!=-1){
											var optionIndex = $("#alarmThresholdSetting").find(".alarmThreshold").prop('selectedIndex');
											ThresholdInitial.splice(optionIndex,1);
											$("#alarmThresholdSetting").find('.alarmThreshold option:eq('+optionIndex+')').remove(); 
										}
										//获取添加展示的值
										var temp = alarmTypeEsc(alarmType)+" 预警,预警等级 "+alarmLevel+",开始值 "+startValue+",结束值 "+
										endValue+",颜色 "+colorText+",rgb("+rValue+","+gValue+","+bValue+")";
										//获取线路告警查询类型
										var alarmTypeText = alarmTypeEsc(alarmType);  //与数据库alarmName对应
										var alarmTypeValue = "";   //与数据库里alarmType对应
										if(alarmType=="THUNDER"){alarmTypeValue="ThunderWarning"}
										else if(alarmType=="Temperature"){alarmTypeValue="TWarning"}
										else if(alarmType=="WIND"){alarmTypeValue="WndWarning"}
										else{alarmTypeValue = alarmType}
										var rgb = rValue+","+gValue+","+rValue;
										var option = "<option value='"+temp+"'>"+temp+"</option>"
										$("#alarmThresholdSetting").find(".alarmThreshold").append(option);
										ThresholdInitial.push(new obj(0,parseInt(alarmLevel),parseFloat(endValue),parseFloat(startValue),colorText,rgb,alarmType,alarmTypeValue,alarmTypeText));
										$("#alarmThresholdSetting").find(".alarmLevel").val("");
										$("#alarmThresholdSetting").find(".startValue").val("");
										$("#alarmThresholdSetting").find(".endValue").val("");
										$("#alarmThresholdSetting").find(".colorText").val("");
										$("#alarmThresholdSetting").find(".RValue").val("");
										$("#alarmThresholdSetting").find(".GValue").val("");
										$("#alarmThresholdSetting").find(".BValue").val("");
										$("#alarmThresholdSetting").find(".alarmDetails").empty();
									}
								}
							}
						}
					}
				}
			}
		});
		$("#alarmThresholdSetting").find(".delButton").bind('click',function(){ //删除按钮
			if($("#alarmThresholdSetting").find(".alarmThreshold").prop('selectedIndex')!=-1){
				var optionIndex = $("#alarmThresholdSetting").find(".alarmThreshold").prop('selectedIndex');
				ThresholdInitial.splice(optionIndex,1);
				$("#alarmThresholdSetting").find('.alarmThreshold option:eq('+optionIndex+')').remove(); 
				$("#alarmThresholdSetting").find(".alarmLevel").val("");
				$("#alarmThresholdSetting").find(".startValue").val("");
				$("#alarmThresholdSetting").find(".endValue").val("");
				$("#alarmThresholdSetting").find(".colorText").val("");
				$("#alarmThresholdSetting").find(".RValue").val("");
				$("#alarmThresholdSetting").find(".GValue").val("");
				$("#alarmThresholdSetting").find(".BValue").val("");
				$("#alarmThresholdSetting").find(".alarmDetails").empty();
			}
		});
		$("#alarmThresholdSetting").find(".okButton").bind('click',function(){  //保存确定按钮
			//向数据库进行更新保存
			$.ajax({
				type : "POST",
				url : "alarmSet!saveOrUpdateAttAlarmSet.action",
				dataType : "json",
				data : {jsondata:JSON.stringify(ThresholdInitial)},
				success : function(data){
					alert("告警阈值设置成功!","提示");
					$("#alarmThresholdSetting").find(".alarmThreshold option").remove();
					$("#alarmThresholdSetting").find(".alarmType").val("all");
					$("#alarmThresholdSetting").find(".alarmLevel").val("");
					$("#alarmThresholdSetting").find(".startValue").val("");
					$("#alarmThresholdSetting").find(".endValue").val("");
					$("#alarmThresholdSetting").find(".colorText").val("");
					$("#alarmThresholdSetting").find(".RValue").val("");
					$("#alarmThresholdSetting").find(".GValue").val("");
					$("#alarmThresholdSetting").find(".BValue").val("");
					$("#alarmThresholdSetting").find(".alarmDetails").empty();
					$("#alarmThresholdSetting").dialog("close");
				}
			});
		});
	}
	
	//动态获取并创建需要设置显示状态
	function getShowStatus(alarmShowSetting){
		$(alarmShowSetting).find(".showContainerdiv").empty();
		$.ajax({
			type : "POST",
			url : "attAlarmMessage!findAll.action",
			dataType : "json",
			success : function(data){
				ShowSetting = data.list;
				var column="";
				var wind="";
				var ice="";
				var rain="";
				var thunder="";
				var temperature="";
				$.each(data.list,function(Index,Info){
					if(Info.prompt=="1"){
						column+=
							"<td style='width:250px;'>" +
								"<input type='checkbox' style='position:relative; top:2px;' value='"+Info.id+"' checked='checked' /><span style='font-size:12px;'>" +Info.name+"</span>"+
							"</td>";
					}else{
						column+=
							"<td style='width:250px;'>" +
								"<input type='checkbox' style='position:relative; top:2px;' value='"+Info.id+"'/><span style='font-size:12px;'>" +Info.name+"</span>"+
							"</td>";
					}
					//判断类型
					if(Info.type=="wind"){
						wind+=column;
						column="";
					}else if(Info.type=="ICE"){
						ice+=column;
						column="";
					}else if(Info.type=="rain"){
						rain+=column;
						column="";
					}else if(Info.type=="thunder"){
						thunder+=column;
						column="";
					}else if(Info.type=="temperature "){
						temperature+=column;
						column="";
					}
				});
				var tbody="<tr style='height:25px;'><td colspan='3'><hr></td></tr><tr><td style='width:150px;'><span style='font-size:16px;'>大风</span></td>"+wind+"</tr>" +
				"<tr style='height:25px;'><td colspan='3'><hr></td></tr><tr><td style='width:150px;'><span style='font-size:16px;'>覆冰</span></td>"+ice+"</tr>" +
				"<tr style='height:25px;'><td colspan='3'><hr></td></tr><tr><td style='width:150px;'><span style='font-size:16px;'>降水</span></td>"+rain+"</tr>" +
				"<tr style='height:25px;'><td colspan='3'><hr></td></tr><tr><td style='width:150px;'><span style='font-size:16px;'>雷电</span></td>"+thunder+"</tr>" +
				"<tr style='height:25px;'><td colspan='3'><hr></td></tr><tr><td style='width:150px;'><span style='font-size:16px;'>温度</span></td>"+temperature+"</tr>";
				$(alarmShowSetting).find(".showContainerdiv").append(tbody);
			}
		});	
	}
	
	//告警显示设置
	_.prototype.alarmShowSetting = function(){
		$("#alarmShowSetting").dialog(dialogOptions(640,480,"告警显示设置")).dialogExtend(dialogExtendOptions);
		getShowStatus($("#alarmShowSetting"));  //动态获取并生成设置显示状态
		//全部选中按钮
		$("#alarmShowSetting").find(".btnAllChoice").bind('click',function(){
			//获取当前元素下的所有子元素(input标签)
			var input =document.getElementsByClassName("showContainerdiv")[0].getElementsByTagName("input");
			//根据所选择条件查询风场信息
			for(var i = 0;i< input.length; i++){
				input[i].checked=true;
			}
		});
		
		//全部不选中按钮
		$("#alarmShowSetting").find(".btnNotAllChoice").bind('click',function(){
			//获取当前元素下的所有子元素(input标签)
			var input =document.getElementsByClassName("showContainerdiv")[0].getElementsByTagName("input");
			//根据所选择条件查询风场信息
			for(var i = 0;i< input.length; i++){
				input[i].checked=false;
			}
		});
		$("#alarmShowSetting").find(".btnPitchOn").bind('click',function(){
			//获取当前元素下的所有子元素(input标签)
			var input =document.getElementsByClassName("showContainerdiv")[0].getElementsByTagName("input");
			//根据所选择条件查询风场信息
			for(var i = 0;i< input.length; i++){
				if(input[i].checked==true){
					//选中了
					$.each(ShowSetting,function(Index,Info){
						if(Info.id==input[i].value){
							Info.prompt="1";
						}
					});
				}else{
					//未选择
					$.each(ShowSetting,function(Index,Info){
						if(Info.id==input[i].value){
							Info.prompt="0";
						}
					});
				}
			}
			
			$.ajax({
				type : "POST",
				url : "attAlarmMessage!saveOrUpdateAlarm.action",
				dataType: "json",
				traditional:true,
		        data : {jsondata:JSON.stringify(ShowSetting)},
				success : function(data){
					//关闭右键菜单管理
					$("#alarmShowSetting").dialog("close");
				}
			});
		});
	}
	
	//权限设置
	_.prototype.systemPowerSetting = function(){
		var powerDialog = powerSetting.containerInit("权限管理");
		powerSetting.createTreeMenuRole(powerDialog,"Tree");
		powerSetting.createRightMenuRole(powerDialog,"Menu");
		//切换用户
		$(powerDialog).find(".roleType").bind("change",function(){
			powerSetting.createTreeMenuRole(powerDialog,"Tree");
			powerSetting.createRightMenuRole(powerDialog,"Menu");
		});
		//保存设置
		$(powerDialog).find("button").bind("click",function(){
			powerSetting.savaMenuRoleSetting(powerDialog);
		});
	}
	
	//数据导入
	_.prototype.importData = function(){
		var importDialog = importData.containerInit("数据导入");
		importData.import(importDialog);
		
	}
	_.prototype.powerechart=function(){
		$("#powerechart").dialog(dialogOptions(800,600,"出力数据展示")).dialogExtend(dialogExtendOptions);
		scollDateTool.scollDateInit($("#powerechart").find('.startTime'),"datetime",echart.formatDateTime(pack,0),null);
		scollDateTool.scollDateInit($("#powerechart").find('.endTime'),"datetime",echart.formatDateTime(pack,3),null);
		$.ajax({
			url:"sysProvinceCode!findAll.action",
			type:"POST",
			success:function(data){
				$("#powerechart").find(".province").empty();
				$.each(data.list,function(index,info){
					$("#powerechart").find(".province").append("<option value='"+info.provinceName+"'>"+info.provinceName+"</option>");
				});
			}
		});
		$.ajax({
			url:"sysDeviceCode!findAll.action",
			type:"POST",
			success:function(data){
				$("#powerechart").find(".deviceType").empty();
				$.each(data.list,function(index,info){
					$("#powerechart").find(".deviceType").append("<option value='"+info.deviceLayerName+"'>"+info.deviceName+"</option>");
				});
			}
		});
		function callback(obj){
			//泡泡提示消息展示
			$("#deviceTable thead").empty();
			$("#deviceTable tbody").empty();
			$("#deviceTable thead").append(obj.thead);
			$("#deviceTable tbody").append(obj.tbody);
			$("#echartDataDiv a").bind("click",function(){
				$(".echartDataDiv").hide();
				$(".deviceInfo").show();
			});
			$("#deviceTable tbody tr").bind('click',function(){
				$(".echartDataDiv").show();
				$(".deviceInfo").hide();
				var id=$(this).find("td:eq(0)").text();
				var param={
					stationId:id
				};
				$.ajax({
					type : "POST",
					url : 'weatherInfoChart!yaocePowerTypeSelect.action',
					data:{
						stationId:id,
					},
					dataType : "json",
					success : function(data){
						$.each(data.list,function (index,value){
							$(".echartDataDiv").find("select").append("<option value='"+value.powerType+"'>"+value.powerName+"</option>");
						});
						scollDateTool.scollDateInit($(".echartDataDiv").find('.startTime'),"datetime",echart.formatDateTime(pack,0),null);
						scollDateTool.scollDateInit($(".echartDataDiv").find('.endTime'),"datetime",echart.formatDateTime(pack,3),null);
						var starttime=$(".echartDataDiv").find('.startTime').val().replace(/-|\s|:/g,"");
						var stoptime=$(".echartDataDiv").find('.endTime').val().replace(/-|\s|:/g,"");
						$(".echartDataDiv button").bind("click",function(){
							echart.containerInit(null,null,false,false,null,document.getElementById("echartDataDivChart"));
							starttime=$(".echartDataDiv").find('.startTime').val().replace(/-|\s|:/g,"");
							stoptime=$(".echartDataDiv").find('.endTime').val().replace(/-|\s|:/g,"");
							param=$.extend({},param,{starttime:starttime,stoptime:stoptime,powerType:$(".echartDataDiv").find("select").val()});
							echart.echartReder("weatherInfoChart!yaoce.action",param,false);
						});
					}
				});
			});
		}
		$("#powerechart").find(".powerDeviceButton").bind('click',function(){
			var type=$("#powerechart").find(".deviceType").val();
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
    						rightMenuEvent.getDeviceInfo("attWeatherStationInfo!findAll.action",function(list){
    							return rightMenuEvent.createTableContentByList(field,list);
    						},function(obj){
    							callback(obj);
    						});
    					}else if(type=="fengdianchang"){
    						rightMenuEvent.getDeviceInfo("attWindInfo!findAll.action",function(list){
    							return rightMenuEvent.createTableContentByList(field,list);
    						},function(obj){
    							callback(obj);
    						});
    					}else if(type=="fengji" || type=="fengjimodel"){
    						rightMenuEvent.getDeviceInfo("attFanInfo!findAll.action",function(list){
    							return rightMenuEvent.createTableContentByList(field,list);
    						},function(obj){
    							//泡泡提示消息展示
    							callback(obj);
    						});
    					}else if(type=="obs" || type=="obsmodel"){
    						rightMenuEvent.getDeviceInfo("obsStation!findAll.action",function(list){
    							return rightMenuEvent.createTableContentByList(field,list);
    						},function(obj){
    							//泡泡提示消息展示
    							callback(obj);
    						});
    					}else if(type=="bdz" || type=="bdzmodel"){
    						rightMenuEvent.getDeviceInfo("attSubstationInfo!findAll.action",function(list){
    							return rightMenuEvent.createTableContentByList(field,list);
    						},function(obj){
    							//泡泡提示消息展示
    							callback(obj);
    						});
    					}else if(type=="ganta" || type=="gantamodel"){
    						rightMenuEvent.getDeviceInfo("attPhotovoltaicInfo!findAll.action",function(list){
    							return rightMenuEvent.createTableContentByList(field,list);
    						},function(obj){
    							//泡泡提示消息展示
    							callback(obj);
    						});
    					}else if(type=="guangfudianchang" || type=="guangfudianchangmodel"){
    						rightMenuEvent.getDeviceInfo("attPhotovoltaicInfo!findAll.action",function(list){
    							return rightMenuEvent.createTableContentByList(field,list);
    						},function(obj){
    							//泡泡提示消息展示
    							callback(obj);
    						});
    					}else if(type=="powerplant"){
    						rightMenuEvent.getDeviceInfo("attPowerPlantInfo!findAll.action",function(list){
    							return rightMenuEvent.createTableContentByList(field,list);
    						},function(obj){
    							//泡泡提示消息展示
    							callback(obj);
    						});
    					}else if(type=="inverter"){
    						rightMenuEvent.getDeviceInfo("attPvInverterInfo!findAll.action",function(list){
    							return rightMenuEvent.createTableContentByList(field,list);
    						},function(obj){
    							callback(obj);
    						});
    					}else if(type=="windtower"){
    						rightMenuEvent.getDeviceInfo("attWindTowerInfo!findAll.action",function(list){
    							return rightMenuEvent.createTableContentByList(field,list);
    						},function(obj){
    							callback(obj);
    						});
    					}else if(type=="line"){
    						
    					}
    				}
    			}
    		});
		});
	};
	
	function _(){
	}
	Map.MenuEvent = _;
	
})(Map);