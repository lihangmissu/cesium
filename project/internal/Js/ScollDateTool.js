(function(){
	function _(){
		
	};
	var currentYear = (new Date()).getFullYear();	
	var option={};
	option.date = {preset : 'date'};
	option.datetime = {preset : 'datetime'};
	option.time = {preset : 'time'};
	option.default = {
		theme: 'android-ics', //皮肤样式
        display: 'inline', //显示方式 
        mode: 'scroller', //日期选择模式
		lang:'zh',
        startYear:currentYear - 50, //开始年份
        endYear:currentYear + 50, //结束年份
      	height: 30,
	    width: 40
	};
	_.prototype.formatDateToString=function(date){
		var date=date+"";
		var FullYear = date.substr(0, 4);
		var strMonth = date.substr(4, 2);
		var strDate = date.substr(6, 2);
		var strHours = date.substr(8, 2);
		var strMinute = date.substr(10, 2);
		return FullYear+"-"+strMonth+"-"+strDate+"_"+strHours+":"+strMinute;
	};
	_.prototype.formatTime=function(date,i){
		var date=date+"";
		if(i!=undefined){
			var FullYear = date.substr(0, 4);
			var strMonth = date.substr(4, 2);
			var strDate = date.substr(6, 2);
			var strHours = date.substr(8, 2);
			var strMinute = date.substr(10, 2);
			var str = FullYear + "/" + strMonth + "/" + strDate + " " + strHours+":"+strMinute+":00";
			
			var t = new Date(str);
			t.setMinutes(t.getMinutes()+i*15);
			if(t.getMonth()+1<10){
				strMonth="0"+(t.getMonth()+1);
			}else{
				strMonth=t.getMonth()+1;
			}
			if(t.getDate()<10){
				strDate="0"+t.getDate();
			}else{
				strDate=t.getDate();
			}
			if(t.getHours()<10){
				strHours="0"+t.getHours();
			}else{
				strHours=t.getHours();
			}
			if(t.getMinutes()<10){
				strMinute="0"+t.getMinutes();
			}else{
				strMinute=t.getMinutes();
			}
			var time=t.getFullYear()+""+strMonth+strDate+strHours+strMinute;
			return time;
		}
		var FullYear = date.substr(0, 4);
		var strMonth = date.substr(4, 2);
		var strDate = date.substr(6, 2);
		return FullYear+"-"+strMonth+"-"+strDate;
	};
	_.prototype.scollDateInit=function(container,type,defaulttime,callback){
		var contentDiv = document.createElement("div");
		contentDiv.setAttribute("style","width:100%;border-bottom:2px solid rgb(224,224,224);");
		var btnOk = document.createElement("div");
		btnOk.setAttribute("class","btnOk");
		btnOk.setAttribute("style","width:49.5%;cursor:pointer;font-weight:bold;border-right:1px solid rgb(224,224,224);padding-top:5px;padding-bottom:5px;float:left;font-size:16px;color:rgb(224,224,224);");
		btnOk.innerHTML="确定";
		$(btnOk).hover(function(){
			$(this).css({'color':'rgb(47,152,190)'});
	    },function(){
	    	$(this).css({'color':'rgb(244,244,244)'});
	    });
		var btnCancel=document.createElement("div");
		btnCancel.setAttribute("class","btnCancel");
		btnCancel.setAttribute("style","width:49.5%;cursor:pointer;font-weight:bold;padding-top:5px;padding-bottom :5px;float:right;font-size:16px;color:rgb(224,224,224);");
		btnCancel.innerHTML="取消";
		$(btnCancel).hover(function(){
			$(this).css({'color':'rgb(47,152,190)'});
	    },function(){
	    	$(this).css({'color':'rgb(244,244,244)'});
	    });
		contentDiv.appendChild(btnOk);
		contentDiv.appendChild(btnCancel);
		var optDate;
		if(callback==null){
			optDate = $.extend(option[type], option['default']);
		}else{
			optDate = $.extend($.extend(option[type], option['default']),{
				onChange:function(dateText,inst){
					callback(dateText,inst);
				}
			});
		}
		container.mobiscroll(optDate);
		container.scroller('setDate',new Date(defaulttime), true);
    	$(".dw-trans").hide();
	    $(container).bind("click",function(){
	    	var left=this.offsetLeft-4.5 ;
	    	$(".dw-trans").remove();
	    	$(container).mobiscroll(optDate);
	    	if(type=="datetime"){
	    		$(container).scroller('setDate',new Date(echart.formatDateTime($(container).val().replace(/-|\s|:/g,""),0)), true);
	    	}else{
	    		$(container).scroller('setDate',new Date(echart.formatDate($(container).val().replace(/-|\s/g,""))), true);
	    	}
	    	
	    	$(".dwcc").append($(contentDiv));
	    	$(btnOk).bind("click",function(){
	        	$(".dw-trans").hide();
	        });
	        $(btnCancel).bind("click",function(){
	        	$(".dw-trans").hide();
	        });
	        $(".dw-trans").css({"left":left});
	    	$(".dw-trans").show();
	    });
	};
	Map.ScollDateTool=_;
})(Map);