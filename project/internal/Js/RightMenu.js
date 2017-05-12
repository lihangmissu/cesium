(function(Map){
	//预测发布时间查询辅助格式化日期函数
	function formatDateToString(date){
		var date=date+"";
		var FullYear = date.substr(0, 4);
		var strMonth = date.substr(4, 2);
		var strDate = date.substr(6, 2);
		var strHours = date.substr(8, 2);
		var strMinute = date.substr(10, 2);
		return FullYear+"-"+strMonth+"-"+strDate+"_"+strHours+":"+strMinute;
	}
	
	//创建右键菜单函数rightMenuInit()的辅助方法
	function showRightMenu(menu) {
		var container = document.getElementById('cesiumContainer');
		var evt = window.event || arguments[0];
		var rightedge = container.clientWidth-evt.clientX;
		var bottomedge = container.clientHeight-evt.clientY;
		if (rightedge < menu.offsetWidth)          
			menu.style.left =  evt.clientX - menu.offsetWidth-1 + "px";          
		else
			menu.style.left = evt.clientX-2 + "px";
		if (bottomedge < menu.offsetHeight){
			menu.style.top = evt.clientY- menu.offsetHeight-1 + "px";
		}
		else{
			menu.style.top = evt.clientY -2+ "px";
		}
		menu.style.visibility = "visible";
	}
	
	_.prototype.rightMenuInit = function(Container,menuType){
		$.ajax({
			type : "POST",
			url : 'sysRightMenu!findAllRightMenuByRole.action',
			dataType : "json",
			data : {menuType:menuType},
			success : function(data){
				$(Container).empty();
				$(Container).append("<ul></ul>");
				$.each(data.rightMenuList,function (i,value){
					var class_str ="";
					if(value.type!=""){
						var cl = value.type;
						if(cl.indexOf(",")!=-1){
							var cl_array = cl.split(",");
							for(var i=0;i<cl_array.length;i++){
								if(i!=cl_array.length-1){
									class_str = class_str + cl_array[i] + " ";
								}else{
									class_str = class_str + cl_array[i];
								}
							}
						}else{
							class_str = cl;
						}
					}
					var li=document.createElement("li");
					li.setAttribute("class",class_str);
					var div=document.createElement("div");
					div.innerHTML=value.name;
					li.appendChild(div);
					$("#rightMenu ul").append($(li));
					$(li).on("click",function(){
						$("#trackPopUpContent").hide();
						$("#trackPopUpLink").empty();
						$("#rightMenu ul").hide();
						var method=value.method;
						rightMenuEvent[method]();
					});
				});
				$("#rightMenu ul").menu();
			}
		});
		document.oncontextmenu=function(e){
			$("#rightMenu ul").show();
			var obj = map.selectedObj;
			$("#rightMenu ul li").hide();
			obj && $("#rightMenu ul").find("."+obj.type).show();
			showRightMenu(Container);
		};
	}
	
	function _(){
	}
	Map.RightMenu=_;
})(Map);
