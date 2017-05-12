(function(Map){
	_.prototype.getTreeMenuData = function(url,ul,menuType){
		var self=this;
		var zNodes;
		$.ajax({
			type : "POST",
			url : url,
			dataType : "json",
			data : {menuType:menuType},
			success : function(data){
				zNodes = data.treeNode.tree;
				self.addTreeMenu(ul,zNodes);
			}
		});
	}
	_.prototype.menuInit = function(url,menuType){
		var menu = document.createElement("div");
		menu.setAttribute("class","menu");
		menu.setAttribute("style","position:absolute;top:0;left:0;z-index:30;height:100%;margin:0");
		var menuPanel = document.createElement("div");
		menuPanel.setAttribute("class","menuPanel");
		menuPanel.setAttribute("style","overflow:hidden;width:200px;height:100%;margin:0;border:1px solid #444;background:#222 url('project/external/css/images/ui-bg_highlight-soft_35_222222_1x100.png') 100% 100% repeat-y;float:left;border-top-right-radius:10px;border-bottom-right-radius:10px;display: none;");
		menu.appendChild(menuPanel);
		var table = document.createElement("table");
		table.setAttribute("style","height:100%;align:left; padding-top:10px;");
		menuPanel.appendChild(table);
		var tr = document.createElement("tr");
		table.appendChild(tr);
		var td = document.createElement("td");
		td.setAttribute("style","width:100%;align:left;valign:top;");
		tr.appendChild(td);
		var ul = document.createElement("ul");
		ul.setAttribute("id","menuTree");
		ul.setAttribute("class","ztree");
		ul.setAttribute("style","width:100%;overflow:auto;font-size:10px;");
		td.appendChild(ul);
		var menuOpen = document.createElement("div");
		menuOpen.setAttribute("class","menuOpen");
		menuOpen.setAttribute("style","background:#666 url('project/external/css/images/ui-bg_highlight-soft_35_222222_1x100.png') 100% 100% repeat-y;width:15px;height:60px;float:left;position:relative;top:30%;border-top-right-radius:5px;border-bottom-right-radius:5px;");
		menu.appendChild(menuOpen);
		var menuClear = document.createElement("div");
		menuClear.setAttribute("class","menuClear");
		menuClear.setAttribute("style","clear:both;");
		menu.appendChild(menuClear);
		document.getElementsByTagName("body")[0].appendChild(menu);
		document.body.appendChild(menu);
		var left = $(menuPanel).width();
		$(menu).bind("mouseenter",function(){
			$(menuPanel).show().animate({'width':left + 'px'}, 200);
		});
		$(menu).bind("mouseleave",function(){
			$(menuPanel).hide().animate({'width':0 + 'px'}, 200);
		});
		$(menuOpen).bind("click",function(){
			var left = 201;
			var width=$(window).width()-left;
			if($("#cesiumContainer").css("position")=="static"){
				$("#cesiumContainer").css({"position":"absolute"});
				$(menuPanel).show().animate({'width':left + 'px'}, 200);
				$("#cesiumContainer").animate({'left':left+'px'},200);
				$("#cesiumContainer").animate({'width':width+'px'},200);
				$(menu).unbind('mouseenter').unbind('mouseleave');
			}else{
				$("#cesiumContainer").css({"position":"static"});
				$(menuPanel).hide().animate({'width':0 + 'px'}, 200);
				$("#cesiumContainer").animate({'left':0+'px'},200);
				$("#cesiumContainer").animate({'width':$(window).width()+'px'},200);
				$(menu).bind("mouseenter",function(){
					var left = 201;
					$(menuPanel).show().animate({'width':left + 'px'}, 200);
				});
				$(menu).bind("mouseleave",function(){
					$(menuPanel).hide().animate({'width':0 + 'px'}, 200);
				});
			}
		});
		this.getTreeMenuData(url,ul,menuType);
	}
	
	_.prototype.addTreeMenu = function(TreeContainer,zNodes){
		var self=this;
		var zTree = $(TreeContainer);
		var setting = {
			treeId:"menuTree",
			treeObj:$(TreeContainer),
	        view: {
	            dblClickExpand: true,  //单击展开/折叠节点
	            showLine: true, 	//是否显示节点之间的连线
	            selectedMulti: false,  //是否允许同时选中多个节点
	            showIcon:true  //是否现在父节点子节点icon图标
	        },
	        data: {
	            simpleData: {
	                enable: true,
	                idKey: "id",
	                pIdKey: "pid",
	                rootPId: ""
	            }
	        },
	        callback: {
	            onClick: function (event,treeId,treeNode) {
	            	$.ajax({
	        			type : "POST",
	        			url : 'sysTreeMenu!findSingleMeunbyId.action',
	        			dataType : "json",
	        			data : {Id:treeNode.id},
	        			success : function(data){
	        				if(data.treeObj.treeObj.methodname!=null){
	        					var method=data.treeObj.treeObj.methodname;
	        					menuEvent[method]();
	        				}
	        			}
	        		});
	            }
	        }
		};
		$.fn.zTree.init(zTree, setting, zNodes);
	}
	
	function _(){
	}
	Map.Menu=_;
})(Map);