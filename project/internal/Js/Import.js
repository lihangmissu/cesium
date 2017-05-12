(function(Map){
	var readData = null; //从excel数据表读取的数据
	var importdata = null;
	var dialogExtendOptions = {
		"closable" : true,
		"maximizable" : true,
		"minimizable" : true,
		"minimizeLocation" : "left",
		"collapsable" : true,
		"dblclick" : "collapse"
	};
	
	function dialogOptions(width,height,title,self){
		return option={
			"title":title,
			"width":width,
			"height":height,
			"resizable" : true,
			"draggable" : true,
			"close" : function(){
				$(this).remove();
				self.importDialog=null;
			}
		};
	}
	
	function dynamicCreateTable(rows,columns,table,flag){
		for(var i=0;i<rows;i++){
			var tr = document.createElement("tr");
			for(var j=0;j<columns;j++){
				if(flag){
					if(i==0){
						var th =  document.createElement("th");
						tr.appendChild(th);
					}else{
						var td =  document.createElement("td");
						tr.appendChild(td);
					}
				}else{
					var td =  document.createElement("td");
					tr.appendChild(td);
				}
			}
			$(table).append($(tr));
		}
	}
	
	_.prototype.containerInit = function(title){
		var self=this;
		this.importDialog && $(this.importDialog).dialog("close");
		this.importDialog && $(this.importDialog).remove();
		var importDialog = document.createElement("div");
		var actionBar = document.createElement("div");
		actionBar.setAttribute("style","width:100%;height:5%;font-size:12px;vertical-align:middle;text-align:center;");
		var information = document.createElement("div");
		information.setAttribute("style","width:100%;height:95%;border-top-color:white;");
		//创建操作栏标签信息
		var form = document.createElement("form");
		form.setAttribute("id","importForm");
		form.setAttribute("name","importForm");
		form.setAttribute("enctype","multipart/form-data");
		var typeSpan = document.createElement("span");
		typeSpan.setAttribute("style","float:left;");
		typeSpan.innerHTML = "数据类型:";
		var typeSelect = document.createElement("select");
		typeSelect.setAttribute("id","dataType");
		typeSelect.setAttribute("name","dataType");
		typeSelect.setAttribute("style","float:left;width:100px;margin-left:5px;");
		typeSelect.options.add(new Option("--请选择--","0"));
		typeSelect.options.add(new Option("风电站","风电站"));
		typeSelect.options.add(new Option("变电站","变电站"));
		typeSelect.options.add(new Option("光伏电站","光伏电站"));
		typeSelect.options.add(new Option("观测站","观测站"));
		typeSelect.options.add(new Option("杆塔","杆塔"));
		typeSelect.options.add(new Option("风机","风机"));
		typeSelect.options.add(new Option("线路","线路"));
		var fileSpan = document.createElement("span");
		fileSpan.setAttribute("style","float:left;margin-left:10px;");
		fileSpan.innerHTML = "选择文件:";
		var fileText = document.createElement("input");
		fileText.setAttribute("id","f_file");
		fileText.setAttribute("type","text");
		fileText.setAttribute("style","float:left;width:180px;margin-left:5px;");
		var file = document.createElement("input");
		file.setAttribute("id","t_file");
		file.setAttribute("type","file");
		file.setAttribute("name","file");
		file.setAttribute("style","float:left;width:60px;height:25px;margin-left:5px;");
		file.setAttribute("accept","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
		var efficacyButton = document.createElement("button");
		efficacyButton.setAttribute("id","efficacybutton");
		efficacyButton.setAttribute("style","float:right;margin-right:10px;");
		efficacyButton.innerHTML = "数据效验";
		var importButton = document.createElement("button");
		importButton.setAttribute("id","importbutton");
		importButton.setAttribute("style","float:right;");
		importButton.innerHTML = "数据导入";
		form.appendChild(typeSpan);
		form.appendChild(typeSelect);
		form.appendChild(fileSpan);
		form.appendChild(fileText);
		form.appendChild(file);
		actionBar.appendChild(importButton);
		actionBar.appendChild(efficacyButton);
		//创建日志标签信息
		var logInformation = document.createElement("div");
		logInformation.setAttribute("id","logInformation");
		logInformation.setAttribute("style","position:relative;float:left;margin-top:10px;font-size:12px;width:30%;height:97%;");
		var logSpan = document.createElement("span");
		logSpan.innerHTML = "日志信息";
		var textarea = document.createElement("textarea");
		textarea.setAttribute("id","logtextarea");
		textarea.setAttribute("style","position:relative;margin-top:5px;font-size:12px;width:96%;height:95%;");
		logInformation.appendChild(logSpan);
		logInformation.appendChild(textarea);
		//创建数据标签信息
		var dataInformation = document.createElement("div");
		dataInformation.setAttribute("id","dataInformation");
		dataInformation.setAttribute("style","position:relative;float:right;margin-top:10px;font-size:12px;width:69%;height:97%;");
		var titleInformation = document.createElement("div");
		titleInformation.setAttribute("style","width:100%;height:20px;");
		var titleSpan = document.createElement("span");
		titleSpan.innerHTML = "导入数据信息";
		titleInformation.appendChild(titleSpan);
		var tableInformation = document.createElement("div");
		tableInformation.setAttribute("style","width:100%;height:97%;overflow:auto;");
		var table = document.createElement("table");
		table.setAttribute("class","importTable")
		table.setAttribute("style","width:100%;height:99%;font-size:small;color:black;border-collapse: collapse;")
		dynamicCreateTable(15,8,table,true);
		tableInformation.append(table);
		dataInformation.appendChild(titleInformation);
		dataInformation.appendChild(tableInformation);
		//加入标签
		actionBar.appendChild(form);
		information.appendChild(logInformation);
		information.appendChild(dataInformation);
		importDialog.appendChild(actionBar);
		importDialog.appendChild(information);
		document.getElementsByTagName("body")[0].appendChild(importDialog);
		$(importDialog).dialog(dialogOptions(800,600,title,self)).dialogExtend(dialogExtendOptions);
		this.importDialog=importDialog;
		return importDialog;
	}
	
	_.prototype.import = function(importDialog){
		//更改选择数据源
		$(importDialog).find("#dataType").bind("change",function(){
			readData = null; 
			importdata = null;
			$(importDialog).find("#f_file").val("");
			$(importDialog).find("#t_file").val("");
			$(importDialog).find("#logtextarea").val("");
			$(importDialog).find(".importTable").empty();
			dynamicCreateTable(15,8,$(importDialog).find(".importTable"),true);
		});
		//选择文件触发并获取文件数据
		$(importDialog).find("#t_file").bind("change",function(){
			$(importDialog).find("#f_file").val($(importDialog).find("#t_file").val());
			//选择导入文件模板,对导入类型进行判断
			if($(importDialog).find("#dataType").val()!="0"){
				var formData = new FormData($(importDialog).find("#importForm")[0]);
			    $.ajax({
			        url: 'fileUpLoadServlet',  //server script to process data
			        type: 'POST',
			        data:formData,
			        cache: false,
			        contentType: false,
			        processData: false,
			        success : function(data){
			        	if(data=="null"){
			        		readData = null; 
			    			importdata = null;
			    			$(importDialog).find("#f_file").val("");
			    			$(importDialog).find("#t_file").val("");
			    			$(importDialog).find("#logtextarea").val("");
			    			$(importDialog).find(".importTable").empty();
			    			dynamicCreateTable(15,8,$(importDialog).find(".importTable"),true);
			        		alert("选择数据源与类型不匹配!","提示");
			        	}else{
			        		readData = data;
			        	}
			        }
			    });
			    $(importDialog).find("#t_file").val("");
			}else{
				$(importDialog).find("#f_file").val("");
				$(importDialog).find("#t_file").val("");
				alert("请选择导入数据类型!","提示");
			}
		});
		
		//数据效验按钮
		$(importDialog).find("#efficacybutton").bind("click",function(){
			//获取导入数据类型
			var type = $(importDialog).find("#dataType").val();
			if(readData==null){
				alert("效验选择的数据源不合法!","提示");
			}else if(readData=="[]"){
				alert("选中数据源无数据,无法进行导入!","提示");
			}else{
				//清空日志信息
				$(importDialog).find("#logtextarea").val("");
				$(importDialog).find(".importTable").empty();
				switch(type){
					case "风电站":importWindFarm(importDialog);break;
					case "光伏电站":importSolar(importDialog);break;
					case "变电站":importSubStation(importDialog);break;
					case "线路":importTransmissionLine(importDialog);break;
					case "风机":importWindGenerator(importDialog);break;
					case "观测站":importObsStation(importDialog);break;
					case "杆塔":importPoleTower(importDialog);break;
					default: alert("选中数据源与导入数据类型不匹配!","提示"); 
				}
			}
		});
		
		//数据导入按钮执行事件
		$(importDialog).find("#importbutton").bind("click",function(){
			if(importdata!=null){
				if(importdata.importData.length!=0){
					var type = $(importDialog).find("#dataType").val();
					switch(type){
						case "风电站":
							$(importDialog).find("#logtextarea").val(importAjax("pGGepl!importAttPgGepl.action"));
							alert("风电站数据导入完成!","提示");
						break;
						case "光伏电站":
							$(importDialog).find("#logtextarea").val(importAjax("pGSolar!importAttPgSolar.action"));
							alert("光伏电站数据导入完成!","提示");
						break;
						case "变电站":
							$(importDialog).find("#logtextarea").val(importAjax("pTSub!importAttPtSub.action"));
							alert("变电站数据导入完成!","提示");
						break;
						case "线路":
							$(importDialog).find("#logtextarea").val(importAjax("attLineInfo!importAttPtLine.action"));
							alert("线路数据导入完成!","提示");
						break;
						case "风机":
							$(importDialog).find("#logtextarea").val(importAjax("windGenerator!importAttWindGenerator.action"));
							alert("风机数据导入完成!","提示");
						break;
						case "观测站":
							$(importDialog).find("#logtextarea").val(importAjax("obsStation!importAttObsStation.action"));
							alert("观测站数据导入完成!","提示");
						break;
						case "杆塔":
							$(importDialog).find("#logtextarea").val(importAjax("pTPole!importAttPTPole.action"));
							alert("杆塔数据导入完成!","提示");
						break;
						default: alert("选中数据源与导入数据类型不匹配!","提示"); 
					}
					readData = null; 
					importdata = null;
					$(importDialog).find("#t_file").val("");
					$(importDialog).find("#f_file").val("");
					$(importDialog).find("#dataType").val("0");
				}else{
					alert("无数据资源导入!","提示");
				}
			}else{
				alert("数据效验未完成,请先效验数据!","提示");
			}
		});
		
	}
	
	function importAjax(url){
		var importlog = null;
		$.ajax({
			type : "POST",
			url : url,
			async : false,
			dataType : "json",
			data : {importjson:JSON.stringify(importdata.importData)},
			success : function(data){
				importlog = data.importlog;
			}
		});
		return importlog;
	}
	
	function getDataAjax(url){
		importdata = null;
		$.ajax({
			type : "POST",
			url : url,
			async : false,
			dataType : "json",
			data : {jsondata:readData},
			success : function(data){
				importdata = $.extend({},importdata,{importData:data.node.DataList,importlog:data.node.LogInfo});
			}
		});
		return importdata;
	}
	
	//导入风电场数据信息
	function importWindFarm(importDialog){
		importdata = null;
		importdata = getDataAjax("pGGepl!efficacyAttPgGepl.action");
		var thead ="<tr><th>编号</th><th>名称</th><th>所属单位</th><th>省公司</th><th>调度单位</th><th>机组台数</th><th>所属市</th><th>占地面积</th>" +
			"<th>电压等级</th><th>装机容量</th><th>实际容量</th><th>小时数</th><th>经纬度</th><th>海拔高度</th>" +
		"</tr>";
		$(importDialog).find("#logtextarea").val(importdata.importlog);
		if(importdata.importData.length==0){
			readData = null; 
			importdata = null;
			$(importDialog).find("#t_file").val("");
			$(importDialog).find("#f_file").val("");
			$(importDialog).find("#dataType").val("0");
			dynamicCreateTable(15,8,$(importDialog).find(".importTable"),true);
		}else{
			$.each(importdata.importData,function(Index,Info){
				thead += "<tr>" +
					"<td>"+Info.code+"</td>" +
					"<td>"+Info.name+"</td>" +
					"<td>"+Info.groupname+"</td>" +
					"<td>"+Info.dwjc+"</td>" +
					"<td>"+Info.dwlx+"</td>" +
					"<td>"+Info.jzts+"</td>" +
					"<td>"+Info.city+"</td>" +
					"<td>"+Info.acreage+"</td>" +
					"<td>"+Info.dydj+"</td>" +
					"<td>"+Info.zjrl+"</td>" +
					"<td>"+Info.sjrl+"</td>" +
					"<td>"+Info.hours+"</td>" +
					"<td>"+Info.geometry+"</td>" +
					"<td>"+Info.height+"</td>" +
				"</tr>";
			});
			if(importdata.importData.length<14){
				$(importDialog).find(".importTable").append(thead);
				dynamicCreateTable(14-importdata.importData.length,14,$(importDialog).find(".importTable"),false);
			}
		}	
	}
	
	//导入光伏电站数据信息
	function importSolar(importDialog){
		importdata = null;
		importdata = getDataAjax("pGSolar!efficacyAttPgSolar.action");
		var thead ="<tr><th>编号</th><th>名称</th><th>所属单位</th><th>所在市</th><th>电池板个数</th><th>接入变电站ID</th>" +
			"<th>电压等级</th><th>装机容量</th><th>实际容量</th><th>经纬度</th><th>海拔高度</th>" +
		"</tr>";
		$(importDialog).find("#logtextarea").val(importdata.importlog);
		if(importdata.importData.length==0){
			readData = null; 
			importdata = null;
			$(importDialog).find("#t_file").val("");
			$(importDialog).find("#f_file").val("");
			$(importDialog).find("#dataType").val("0");
			dynamicCreateTable(15,8,$(importDialog).find(".importTable"),true);
		}else{
			$.each(importdata.importData,function(Index,Info){
				thead+="<tr>" +
						"<td>"+Info.code+"</td>" +
						"<td>"+Info.name+"</td>" +
						"<td>"+Info.unit+"</td>" +
						"<td>"+Info.city+"</td>" +
						"<td>"+Info.nums+"</td>" +
						"<td>"+Info.substationid+"</td>" +
						"<td>"+Info.voltagelevel+"</td>" +
						"<td>"+Info.zjrl+"</td>" +
						"<td>"+Info.capa+"</td>" +
						"<td>"+Info.geometry+"</td>" +
						"<td>"+Info.height+"</td>" +
					"</tr>";
			});
			if(importdata.importData.length<14){
				$(importDialog).find(".importTable").append(thead);
				dynamicCreateTable(14-importdata.importData.length,11,$(importDialog).find(".importTable"),false);
			}
		}	
	}
	
	//导入变电站数据信息
	function importSubStation(importDialog){
		importdata = null;
		importdata = getDataAjax("pTSub!efficacyAttPtSub.action");
		var thead = "<tr><th>编号</th><th>名称</th><th>电压等级</th><th>省份</th><th>经纬度</th><th>海拔高度</th></tr>";
		$(importDialog).find("#logtextarea").val(importdata.importlog);
		if(importdata.importData.length==0){
			readData = null; 
			importdata = null;
			$(importDialog).find("#t_file").val("");
			$(importDialog).find("#f_file").val("");
			$(importDialog).find("#dataType").val("0");
			dynamicCreateTable(15,8,$(importDialog).find(".importTable"),true);
		}else{
			$.each(importdata.importData,function(Index,Info){
				thead+="<tr>" +
							"<td>"+Info.code+"</td>" +
							"<td>"+Info.name+"</td>" +
							"<td>"+Info.voltagelevel+"</td>" +
							"<td>"+Info.province+"</td>" +
							"<td>"+Info.geometry+"</td>" +
							"<td>"+Info.height+"</td>" +
						"</tr>";
			});
			if(importdata.importData.length<14){
				$(importDialog).find(".importTable").append(thead);
				dynamicCreateTable(14-importdata.importData.length,6,$(importDialog).find(".importTable"),false);
			}
		}	
	}
	
	//导入线路数据信息
	function importTransmissionLine (importDialog){
		importdata = null;
		importdata = getDataAjax("pTLine!efficacyAttPtLine.action");
		var thead ="<tr><th>编号</th><th>名称</th><th>办事处</th><th>省份</th><th>所属调度</th><th>电压等级</th><th>启动设备</th><th>结束设备</th></tr>";
		$(importDialog).find("#logtextarea").val(importdata.importlog);
		if(importdata.importData.length==0){
			readData = null; 
			importdata = null;
			$(importDialog).find("#t_file").val("");
			$(importDialog).find("#f_file").val("");
			$(importDialog).find("#dataType").val("0");
			dynamicCreateTable(15,8,$(importDialog).find(".importTable"),true);
		}else{
			$.each(importdata.importData,function(Index,Info){
				thead+="<tr>" +
							"<td>"+Info.lineid+"</td>" +
							"<td>"+Info.name+"</td>" +
							"<td>"+Info.bureau+"</td>" +
							"<td>"+Info.county+"</td>" +
							"<td>"+Info.province+"</td>" +
							"<td>"+Info.voltagelevel+"</td>" +
							"<td>"+Info.startequipment+"</td>" +
							"<td>"+Info.endequipment+"</td>" +
						"</tr>";
			});
			if(importdata.importData.length<14){
				$(importDialog).find(".importTable").append(thead);
				dynamicCreateTable(14-importdata.importData.length,8,$(importDialog).find(".importTable"),false);
			}
		}	
	}
	
	//导入风机数据信息
	function importWindGenerator(importDialog){
		importdata = null;
		importdata = getDataAjax("windGenerator!efficacyAttWindGenerator.action");
		var thead ="<tr><th>编号</th><th>风电场编号</th><th>风电场名称</th><th>风机名称</th><th>装机容量</th><th>风机类型</th><th>经纬度</th><th>海拔高度</th></tr>";
		$(importDialog).find("#logtextarea").val(importdata.importlog);
		if(importdata.importData.length==0){
			readData = null; 
			importdata = null;
			$(importDialog).find("#t_file").val("");
			$(importDialog).find("#f_file").val("");
			$(importDialog).find("#dataType").val("0");
			dynamicCreateTable(15,8,$(importDialog).find(".importTable"),true);
		}else{
			$.each(importdata.importData,function(Index,Info){
				thead+="<tr>" +
							"<td>"+Info.code+"</td>" +
							"<td>"+Info.windfarmid+"</td>" +
							"<td>"+Info.dispatch+"</td>" +
							"<td>"+Info.name+"</td>" +
							"<td>"+Info.capacity+"</td>" +
							"<td>"+Info.model+"</td>" +
							"<td>"+Info.geometry+"</td>" +
							"<td>"+Info.height+"</td>" +
						"</tr>";
			});
			if(importdata.importData.length<14){
				$(importDialog).find(".importTable").append(thead);
				dynamicCreateTable(14-importdata.importData.length,8,$(importDialog).find(".importTable"),false);
			}
		}	
	}
	
	//导入观测站数据信息
	function importObsStation(importDialog){
		importdata = null;
		importdata = getDataAjax("obsStation!efficacyAttObsStation.action");
		var thead="<tr><th>编号</th><th>名称</th><th>省份</th><th>经纬度</th><th>海拔高度</th></tr>";
		$(importDialog).find("#logtextarea").val(importdata.importlog);
		if(importdata.importData.length==0){
			readData = null; 
			importdata = null;
			$(importDialog).find("#t_file").val("");
			$(importDialog).find("#f_file").val("");
			$(importDialog).find("#dataType").val("0");
			dynamicCreateTable(15,8,$(importDialog).find(".importTable"),true);
		}else{
			$.each(importdata.importData,function(Index,Info){
				thead+="<tr>" +
							"<td>"+Info.code+"</td>" +
							"<td>"+Info.name+"</td>" +
							"<td>"+Info.province+"</td>" +
							"<td>"+Info.geometry+"</td>" +
							"<td>"+Info.height+"</td>" +
						"</tr>";
			});
			if(importdata.importData.length<14){
				$(importDialog).find(".importTable").append(thead);
				dynamicCreateTable(14-importdata.importData.length,5,$(importDialog).find(".importTable"),false);
			}
		}	
	}
	
	//导入杆塔数据信息
	function importPoleTower(importDialog){
		importdata = null;
		importdata = getDataAjax("pTPole!efficacyAttPtPole.action");
		var thead="<tr><th>杆塔编号</th><th>名称</th><th>杆塔序号</th><th>告警等级</th><th>线路编号</th><th>线路名称</th><th>电压等级</th>" +
						"<th>省份</th><th>经纬度</th><th>海拔高度</th><th>杆塔高度</th></tr>";
		$(importDialog).find("#logtextarea").val(importdata.importlog);
		if(importdata.importData.length==0){
			readData = null; 
			importdata = null;
			$(importDialog).find("#t_file").val("");
			$(importDialog).find("#f_file").val("");
			$(importDialog).find("#dataType").val("0");
			dynamicCreateTable(15,8,$(importDialog).find(".importTable"),true);
		}else{
			$.each(importdata.importData,function(Index,Info){
				thead+="<tr>" +
							"<td>"+Info.code+"</td>" +
							"<td>"+Info.name+"</td>" +
							"<td>"+Info.ordern+"</td>" +
							"<td>"+Info.level+"</td>" +
							"<td>"+Info.lineid+"</td>" +
							"<td>"+Info.linename+"</td>" +
							"<td>"+Info.voltagelevel+"</td>" +
							"<td>"+Info.unit+"</td>" +
							"<td>"+Info.geometry+"</td>" +
							"<td>"+Info.height+"</td>" +
							"<td>"+Info.poleheight+"</td>" +
						"</tr>";
			});
			if(importdata.importData.length<14){
				$(importDialog).find(".importTable").append(thead);
				dynamicCreateTable(14-importdata.importData.length,11,$(importDialog).find(".importTable"),false);
			}
		}	
	}
	
	
	function _(){}
	Map.Import =_;
})(Map);