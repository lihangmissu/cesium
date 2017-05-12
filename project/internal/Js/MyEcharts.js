(function(Map){
	function _(){
		this.option=null;
		this.myChart=null;
		this.featureArray=[];
	};
	var commonOption={
		tooltip : {
			trigger : 'axis'
		},
		calculable : true,
		toolbox: {
	        feature: {
	            dataView: {show: true, readOnly: false},
	            restore: {show: true},
	            saveAsImage: {show: true}
	        },
	        iconStyle:{
	        	normal:{
	        		color:"#fff",
	        		shadowColor:"#FFFFFF"
	        	}
	        }
	    },
	};
	function dialogOptions(width,height,title,flag){
		var buttons={
			buttons:[{
				text: "确定",
				icons: {
					primary: "ui-icon-heart"
				},
				click: function() {
					$(this).dialog( "close" );
					$(this).remove();
				}
			}]
		};
		var option={
			"title":title,
			"width":width,
			"height":height,
			"modal": true,
			"resizable" : true,
			"draggable" : true,
			"close" : function(){
				$(this).remove();
			},
			resize:function(){
				echarts.getInstanceByDom(this.getElementsByClassName("echart")[0]).resize();
			}
		};
		return flag?$.extend({},option,buttons):option;
	}
	var dialogExtendOptions = {
		"closable" : true,
		"maximizable" : true,
		"minimizable" : true,
		"minimizeLocation" : "left",
		"collapsable" : true,
		"dblclick" : "collapse"
	};
	_.prototype.factorselectiondialog=function(featureType){
		var featureArray=this.featureArray;
		var selectdialog = document.createElement("div");
		selectdialog.setAttribute("class","selectiondialog");
		selectdialog.setAttribute("style","font-size:12px;");
		var selectiontitle = document.createElement("div");
		selectiontitle.setAttribute("class","selectiontitle");
		var titlespan = document.createElement("span");
		titlespan.innerHTML="查询条件:&nbsp;&nbsp;";
		selectiontitle.appendChild(titlespan);
		var titleinput = document.createElement("input");
		titleinput.setAttribute("class","titleinput");
		selectiontitle.appendChild(titleinput);
		var titlesearch=document.createElement("button");
		titlesearch.setAttribute("class","titlesearch");
		titlesearch.innerHTML="查询";
		selectiontitle.appendChild(titlesearch);
		var selectionleft = document.createElement("div");
		selectionleft.setAttribute("class","selectionleft");
		var selectionright = document.createElement("div");
		selectionright.setAttribute("class","selectionright");
		selectdialog.appendChild(selectiontitle);
		selectdialog.appendChild(selectionleft);
		selectdialog.appendChild(selectionright);
		//动态向selectionleft添加列表
		var featuretext = ["覆冰","雷电","大风","辐照度","湿度","温度","高度","气压","云量"];
		var featurevalue = ["ice","thunder","wind","sun","humid","temperature","height","pressure","cloudiness"];
		var content="";
		for(var i =0 ; i<featuretext.length; i++){
			content +="<div class='contentdiv' value='"+featurevalue[i]+"'>"+featuretext[i]+"</div>"
		}
		selectionleft.innerHTML=content;
		var currentvalue = featureType;
		var currenttext = escapefeature(currentvalue);
		var currentrightdiv = document.createElement("div");
		currentrightdiv.setAttribute("class","selectionrightdiv");
		currentrightdiv.setAttribute("value",currentvalue);
		currentrightdiv.innerHTML = currenttext;
		selectionright.appendChild(currentrightdiv);
		featureArray.push(currentvalue);
		document.getElementsByTagName("body")[0].appendChild(selectdialog);
		$(selectionleft).find("div").bind("click",function(){
			var value=$(this).attr("value");
			var txt = $(this).text();
			//遍历是否已选择当前元素
			if(featureArray.indexOf(value)==-1){
				var selectionrightdiv = document.createElement("div");
				selectionrightdiv.setAttribute("class","selectionrightdiv");
				selectionrightdiv.setAttribute("value",value);
				selectionrightdiv.innerHTML = txt;
				selectionright.appendChild(selectionrightdiv);
				featureArray.push(value);
			}
		});
		$(selectionright).on("click","div",function(){
			var value=$(this).attr("value");
			featureArray.remove(value);
			$(this).remove();
		});
		return {selectiondialog:selectdialog};
	};
	function escapefeature(value){
		var text="";
		switch(value) { 
			case "ice" : text="覆冰"; break;
			case "thunder" : text="雷电"; break;
			case "wind" : text="大风"; break;
			case "sun" : text="辐照度"; break;
			case "humid" : text="湿度"; break;
			case "temperature" : text="温度"; break;
			case "height" : text="高度"; break;
			case "pressure" : text="气压"; break;
			case "cloudiness" : text="云量"; break;
		}
		return text;
	};
	_.prototype.containerInit=function(type,title,flag,elementFlag,featureType,container){
		if(container){
			this.container=container;
			return;
		}
		var self=this;
		var dialogdiv;
		var featureArray=this.featureArray;
		if(type=="package"){
			dialogdiv = document.createElement("div");
			dialogdiv.setAttribute("class","dialogdiv");
			dialogdiv.setAttribute("style","overflow:hidden;");
			var titlediv = document.createElement("div");
			titlediv.setAttribute("class","titlediv");
			titlediv.setAttribute("style","font-size:12px;");
			titlediv.style.width = "98%";
			titlediv.style.height = "8%";
			var input = document.createElement("input");
			var select = document.createElement("select");
			input.style.width="120px";
			input.setAttribute("class","date");
			select.style.width="150px";
			select.setAttribute("class","package");
			var span1 = document.createElement("span");
			span1.innerHTML="发布日期:&nbsp;&nbsp;";
			span1.style.marginLeft="40px";
			var span2 = document.createElement("span");
			span2.innerHTML=" 发布时间:&nbsp;&nbsp;";
			span2.style.marginLeft="40px";
			var selectbutton=document.createElement("button");
			selectbutton.setAttribute("class","containerbtn");
			selectbutton.innerHTML="查询";
			selectbutton.style.right="30px";
			selectbutton.style.position="absolute";
			titlediv.appendChild(span1);
			titlediv.appendChild(input);
			titlediv.appendChild(span2);
			titlediv.appendChild(select);
			titlediv.appendChild(selectbutton);
			dialogdiv.appendChild(titlediv);
			var div = document.createElement("div");
			div.setAttribute("class","echart");
			div.setAttribute("style","position:absolute; top:8%;");
			div.style.width = "95%";
			div.style.height = "92%";
			dialogdiv.appendChild(div);
			document.getElementsByTagName("body")[0].appendChild(dialogdiv);
		}else if(type=="timeinterval"){
			var dialogdiv = document.createElement("div");
			dialogdiv.setAttribute("class","dialogdiv");
			dialogdiv.setAttribute("style","overflow:hidden;");
			var titlediv = document.createElement("div");
			titlediv.setAttribute("class","titlediv");
			titlediv.setAttribute("style","font-size:12px;");
			titlediv.style.width = "98%";
			titlediv.style.height = "8%";
			var input1 = document.createElement("input");
			var input2 = document.createElement("input");
			var select = document.createElement("select");
			input1.style.width="130px";
			input1.setAttribute("class","hisStartTime");
			input2.style.width="130px";
			input2.setAttribute("class","hisEndTime");
			select.style.width="120px";
			select.setAttribute("class","featureType");
			var span1 = document.createElement("span");
			span1.innerHTML="开始时间:&nbsp;&nbsp;";
			span1.style.marginLeft="40px";
			var span2 = document.createElement("span");
			span2.innerHTML=" 结束时间:&nbsp;&nbsp;";
			span2.style.marginLeft="40px";
			var span3 = document.createElement("span");
			span3.innerHTML=" 要素类型:&nbsp;&nbsp;";
			span3.style.marginLeft="40px";
			var selectbutton=document.createElement("button");
			selectbutton.setAttribute("class","containerbtn");
			selectbutton.innerHTML="查询";
			selectbutton.style.right="30px";
			selectbutton.style.position="absolute";
			titlediv.appendChild(span1);
			titlediv.appendChild(input1);
			titlediv.appendChild(span2);
			titlediv.appendChild(input2);
			if(elementFlag){
				titlediv.appendChild(span3);
				titlediv.appendChild(select);
			}
			titlediv.appendChild(selectbutton);
			dialogdiv.appendChild(titlediv);
			var div = document.createElement("div");
			div.setAttribute("class","echart");
			div.setAttribute("style","position:absolute; top:8%;");
			div.style.width = "95%";
			div.style.height = "92%";
			dialogdiv.appendChild(div);
			document.getElementsByTagName("body")[0].appendChild(dialogdiv);
		}
		if(flag){
			var typebutton = document.createElement("button");
			typebutton.setAttribute("class","typebtn");
			typebutton.innerHTML="选择类型";
			typebutton.style.right="100px";
			typebutton.style.position="absolute";
			dialogdiv.getElementsByClassName("titlediv")[0].appendChild(typebutton);
		}
		$(dialogdiv).dialog(dialogOptions(800,600,title)).dialogExtend(dialogExtendOptions);
		$(dialogdiv).dialog({draggable: false}).closest('.ui-dialog').draggable();
		if(flag){
			$(dialogdiv).find(".typebtn").bind("click",function(){
				featureArray.splice(0,featureArray.length);
				var selectiondialog= self.factorselectiondialog(featureType).selectiondialog;
				$(selectiondialog).dialog(dialogOptions(400,300,"要素选择",true)).dialogExtend(dialogExtendOptions);
			});
		}
		this.dialogdiv=dialogdiv;
		this.container=this.dialogdiv.getElementsByClassName("echart")[0];
		return dialogdiv;
	};
	
	_.prototype.formatDate=function(time){
		var timeString = time.substr(0, 4) + "/" + time.substr(4, 2) + "/" + time.substr(6, 2);
		var time = new Date(timeString);
		return time;
	}
	
	_.prototype.formatDateTime=function(time,i){
		var timeString = time.substr(0, 4) + "/" + time.substr(4, 2) + "/" + time.substr(6, 2) + " " + time.substr(8, 2)+":"+time.substr(10, 2)+":00";
		var time = new Date(timeString);
		time.setDate(parseInt(time.getDate())+i);
		return time;
	};
	
	_.prototype.dataFormat=function(data,flag){
		var data=eval('('+data.chartStr+')');
		if(data){
			var xAxis=data.xAxis;
			var list=data.series;
			var yAxis=[];
			//粉红,橙红,青色,绿宝石,酸橙,纯黄,金,灰色,海军蓝,天蓝
			var colors=['#FFC0CB','#FF4500','#708090','#00FFFF','#00CED1','#00FF00','#FFFF00','#FFD700','#808080','#000080','#87CEEB'];
			var series=[];
			var legend=[];
			$.each(list,function(i,n){
				if(flag){
					series.push({
			            name:n.name,
			            type:'line',
			            yAxisIndex: i,
			            data:n.data,
			            symbol: 'none',
			            markPoint: {
			                data: [
			                    {type: 'max', name: '最大值'},
			                    {type: 'min', name: '最小值'}
			                ]
			            }/*,
			            markLine: {
			                data: [
			                    {type: 'average', name: '平均值'}
			                ]
			            }*/
			        });
					if(i%2==0){
						yAxis.push({
			                 type: 'value',
			                 name: n.name,
			                 nameGap:25,
			                 position: 'left',
			                 offset: i==0?0:40,
	                		 splitLine: {
                	            show: false
	                		 },
			                 axisLine: {
			                     lineStyle: {
			                         color: colors[i]
			                     }
			                 },
			                 axisLabel: {
			                     formatter: '{value} '+n.formatter,
			                     rotate:90
			                 }
			     		});
					}else{
						yAxis.push({
			                 type: 'value',
			                 name: n.name,
			                 nameGap:25,
			                 position: 'right',
			                 offset: i==1?0:40,
	                		 splitLine: {
                	            show: false
	                		 },
			                 axisLine: {
			                     lineStyle: {
			                         color: colors[i]
			                     }
			                 },
			                 axisLabel: {
			                	 formatter: '{value} '+n.formatter,
			                	 rotate:-90
			                 }
			     		});
					}
				}else{
					series.push({
			            name:n.name,
			            type:'line',
			            data:n.data,
			            symbol: 'none',
			            markPoint: {
			                data: [
			                    {type: 'max', name: '最大值'},
			                    {type: 'min', name: '最小值'}
			                ]
			            }/*,
			            markLine: {
			                data: [
			                    {type: 'average', name: '平均值'}
			                ]
			            }*/
			        });
				}
				legend.push(n.name);
			});
			if(!flag){
				yAxis.push({
		            type: 'value',
		            position: 'left',
		            nameGap:25,
		            axisLine: {
		                lineStyle: {
		                    color: colors[0]
		                }
		            },
		            axisLabel: {
		                formatter: '{value} '+list[0].formatter
		            }
				});
			}
			return {
				color:colors,
				grid: {
			        right: '12%',
			        left: '12%'
			    },
				legend :  {
					textStyle: {
			            color: '#fff',
			            fontSize: 16
			        },
			        data:legend
			    },
				xAxis : [
		            {
		                type: 'category',
		                axisTick: {
		                    alignWithLabel: true
		                },
		                axisLine: {
		                    lineStyle: {
		                        color: '#ccc'
		                    }
		                },
		                data: xAxis
		            }
		        ],
				yAxis:yAxis,
				series : series
			};
		}else{
			return null;
		}
		
	};
	_.prototype.optionInit=function(data,flag){
		var option=this.dataFormat(data,flag);
		return $.extend({},commonOption,option);
	};
	_.prototype.echartReder=function(url,param,flag){
		var self=this;
		var container=this.container;
		this.myChart = echarts.init(container);
		var myChart=this.myChart;
		myChart.clear();
		myChart.resize();
		myChart.showLoading({
		    text: '正在努力的读取数据中...',
		    color: '#c23531',
		    textColor: '#000',
		    maskColor: 'rgba(255,255,255, 0.60)',
		    zlevel: 0
		});
		this.ajax(url,param,flag);
	};
	_.prototype.ajax=function(url,param,flag){
		var self=this;
		var myChart=self.myChart;
		$.ajax({
			type : "POST",
			url : url,
			data: param,
			dataType : "json",
			success : function(data){
				self.option=self.optionInit(data,flag);
				if(self.option){
					myChart.setOption(self.option);
				}
				myChart.hideLoading();
			}
		});
	};
	Map.Echart=_;
})(Map);