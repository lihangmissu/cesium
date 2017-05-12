(function(Map){
	var roleUrl = "sysRole!findAll.action";
	var rightMenuUrl = "sysRightMenu!findAll.action";
	var rightMenuRoleUrl = "sysMenuRole!findAllTreeRole.action";
	var treeMenuId = "";
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
				self.powerDialog=null;
			}
		};
	}
	
	function getRoleBingSelect(url,SelectContainer){
		$.ajax({
			type : "POST",
			url : url,
			async : false,
			dataType : "json",
			data : {},
			success : function(data){
				$(SelectContainer).empty();
				$.each(data.list,function (i,value){
					$(SelectContainer).append("<option value='"+value.id+"'>"+value.name+"</option>");
				});
			}
		});
	}
	
	/*
	 * 获取右键菜单表右键功能信息
	 * url: 获取右键菜单数据信息的action路径
	 * */
	function getRightMenuInformation(url){
		var RightMenuInformation;
		$.ajax({
			type : "POST",
			url : url,
			async : false,
			dataType : "json",
			success : function(data){
				RightMenuInformation = data.list;
			}
		});
		return RightMenuInformation;
	}
	
	/*
	 * 获取右键菜单权限信息
	 * */
	function getRightMenuRoleInformation(url,roleId,menuType){
		var RightMenuRoleInformation;
		$.ajax({
			type : "POST",
			url : url,
			async : false,
			dataType : "json",
			data : {roleId:roleId,menuType:menuType},
			success : function(data){
				RightMenuRoleInformation = data.list;
			}
		});
		return RightMenuRoleInformation;
	}
	
	_.prototype.createTreeMenuRole = function(powerDialog,menuType){
		var self = this;
		$(powerDialog).find("#roleTree").empty();
		var roleId = $(powerDialog).find(".roleType").val();
		$.ajax({
			type : "POST",
			url : 'sysTreeMenu!findAllTreeByRole.action',
			dataType : "json",
			data : {roleId:roleId,menuType:menuType},
			success : function(data){
				var zNodes = data.menuNode.tree;
				self.addRoleTreeMenu(powerDialog,zNodes);
			}
		});
	}
	
	_.prototype.containerInit = function(title){
		var self=this;
		this.powerDialog && $(this.powerDialog).dialog("close");
		this.powerDialog && $(this.powerDialog).remove();
		var powerDialog = document.createElement("div");
		powerDialog.setAttribute("style","overflow:hidden;");
		var actionBar = document.createElement("div");
		actionBar.setAttribute("style","width:100%;height:5%;font-size:12px;vertical-align:middle;text-align:center;");
		var information = document.createElement("div");
		information.setAttribute("style","width:100%;height:90%;");
		var statusBar = document.createElement("div");
		statusBar.setAttribute("style","width:100%;height:5%;");
		//创建操作栏标签信息
		var span = document.createElement("span");
		span.innerHTML = "选中用户类型:";
		span.setAttribute("style","float:left;");
		var select = document.createElement("select");
		select.setAttribute("class","roleType");
		select.setAttribute("style","float:left;width:120px;margin-left:5px;");
		getRoleBingSelect(roleUrl,select);
		actionBar.appendChild(span);
		actionBar.appendChild(select);
		//创建菜单权限控制标签
		var treeInformation = document.createElement("div");
		treeInformation.setAttribute("class","treeInformation");
		treeInformation.setAttribute("style","float:left;width:50%;height:100%;font-size:12px;overflow:auto;");
		var treeTitle = document.createElement("div");
		treeTitle.setAttribute("style","width:100%;height:2%;font-size:12px;");
		treeTitle.innerHTML = "树形菜单权限控制:";
		treeInformation.appendChild(treeTitle);
		var table = document.createElement("table");
		table.setAttribute("style","border:0; height:95%;align:left; padding-top:10px;");
		treeInformation.appendChild(table);
		var tr = document.createElement("tr");
		table.appendChild(tr);
		var td = document.createElement("td");
		td.setAttribute("style","width:100%;align:left;valign:top;");
		tr.appendChild(td);
		var ul = document.createElement("ul");
		ul.setAttribute("id","roleTree");
		ul.setAttribute("class","ztree");
		ul.setAttribute("style","width:100%;overflow:auto;font-size:10px;");
		td.appendChild(ul);
		var menuInformation = document.createElement("div");
		menuInformation.setAttribute("class","menuInformation");
		menuInformation.setAttribute("style","float:right;width:49%;height:100%;");
		var menuTitle = document.createElement("div");
		menuTitle.setAttribute("style","width:100%;height:2%;font-size:12px;");
		menuTitle.innerHTML = "右键菜单权限控制:";
		menuInformation.appendChild(menuTitle);
		var roleControl = document.createElement("div");
		roleControl.setAttribute("class","roleControl");
		roleControl.setAttribute("style","height:95%;align:left; padding-top:10px;font-size:12px;overflow:auto;");
		menuInformation.appendChild(roleControl);
		information.appendChild(treeInformation);
		information.appendChild(menuInformation);
		//创建状态栏标签信息
		var button = document.createElement("button");
		button.innerHTML ="确定";
		button.setAttribute("style","float:right;width:60px;margin-right:5px;font-size:12px;");
		statusBar.appendChild(button);
		//加入标签
		powerDialog.appendChild(actionBar);
		powerDialog.appendChild(information);
		powerDialog.appendChild(statusBar);
		document.getElementsByTagName("body")[0].appendChild(powerDialog);
		$(powerDialog).dialog(dialogOptions(800,600,title,self)).dialogExtend(dialogExtendOptions);
		this.powerDialog = powerDialog;
		return powerDialog;
	}
	
	_.prototype.addRoleTreeMenu = function(powerDialog,zNodes){
		var self=this;
		var zTree = $(powerDialog).find("#roleTree");
		var zTreeID = $(powerDialog).find("#roleTree").attr("id");
		var setting = {
			check: {
				enable: true,
				chkboxType:{"Y":"ps","N":"ps"}
			},
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
	        	onClick:function(event,treeId, treeNode){
					var zTreeObj = $.fn.zTree.getZTreeObj(zTreeID);
					zTreeObj.checkNode(treeNode,true,true);
					return false;
				},
				onCheck: function(e,treeId,treeNode){
					treeMenuId = "";
					var zTreeObj = $.fn.zTree.getZTreeObj(zTreeID);
					var nodes = zTreeObj.getCheckedNodes(true);
					v = "";
					for (var i=0, l=nodes.length; i<l; i++) {
						v += nodes[i].id + ",";
					}
					if (v.length > 0 ) v = v.substring(0, v.length-1);
					treeMenuId = v;
				}
			}
		};
		$.fn.zTree.init(zTree, setting, zNodes);
	}
	
	
	_.prototype.createRightMenuRole = function(powerDialog,menuType){
		$(powerDialog).find(".roleControl").empty();
		var RightMenuInformation = getRightMenuInformation(rightMenuUrl);
		var roleId = $(powerDialog).find(".roleType").val();
		var RightMenuRoleInformation = getRightMenuRoleInformation(rightMenuRoleUrl,roleId,menuType);
		$.each(RightMenuInformation, function(index, meun) {
			var flag = false;
			$.each(RightMenuRoleInformation, function(index, menuRole) {
				if(meun.id==menuRole.menuId){
					flag = true;
				}
			});
			var container = document.createElement("div");
			container.setAttribute("style","margin-bottom:10px");
			var checkContainer = document.createElement("div");
			checkContainer.setAttribute("style","margin-bottom:5px;vertical-align:middle;text-align:left;");
			var checkbox = document.createElement("input");
			checkbox.setAttribute("type","checkbox");
			checkbox.setAttribute("name",meun.id);
			checkbox.setAttribute("style","vertical-align:middle;");
			if(flag){
				checkbox.checked = true;
			}
			var span = document.createElement("span");
			span.setAttribute("style","vertical-align:middle;margin-left:5px;");
			span.innerHTML = meun.name;
			checkContainer.appendChild(checkbox);
			checkContainer.appendChild(span);
			$(powerDialog).find(".roleControl").append($(container));
			$(powerDialog).find(".roleControl").append($(checkContainer));
		});
	}
	
	_.prototype.savaMenuRoleSetting = function(powerDialog){
		//获取当前元素下的所有子元素(input标签)
		var rightMenuId="";
		var input = $(powerDialog).find(".roleControl input");
		var roleId = $(powerDialog).find(".roleType").val();
		for(var i = 0;i< input.length; i++){
			if(input[i].checked==true){
				rightMenuId += input[i].name+",";
			}
		}
		if (rightMenuId.length > 0 ) rightMenuId = rightMenuId.substring(0, rightMenuId.length-1);
		$.ajax({
			type : "POST",
			url : 'sysRightMenu!savaUpdateMenuRole.action',
			dataType : "json",
			data : {roleId:roleId,treeMenuId:treeMenuId,rightMenuId:rightMenuId,},
			error : function(data){
				alert("错误");
			},
			success : function(data){
				alert("提交成功");
				window.location.reload();
				$(powerDialog).dialog( "close" );
			}
		});
		
	}
	function _(){}
	Map.PowerSetting = _;
})(Map);