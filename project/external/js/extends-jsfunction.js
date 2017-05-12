Array.prototype.formatString=function(){
	return "["+this.toString()+"]";
};
//数组去重
Array.prototype.unique = function()
{
	this.sort();
	var re=[this[0]];
	for(var i = 1; i < this.length; i++)
	{
		if( this[i] !== re[re.length-1])
		{
			re.push(this[i]);
		}
	}
	return re;
};
Array.prototype.contains = function(item){
	for(var i = 0; i < this.length; i++){  
		if(RegExp(item).test(this[i].id)){
			return true;
		}
	}  
    return false;
};
Array.prototype.each = function(fn){
    fn = fn || Function.K;  
     var a = [];  
     var args = Array.prototype.slice.call(arguments, 1);  
     for(var i = 0; i < this.length; i++){  
         var res = fn.apply(this,[this[i],i].concat(args));  
         if(res != null) a.push(res);  
     }  
     return a;  
};  
  
/**  
* 得到一个数组不重复的元素集合<br/>  
* 唯一化一个数组  
* @returns {Array} 由不重复元素构成的数组  
*/  
Array.prototype.uniquelize = function(){  
     var ra = new Array();  
     for(var i = 0; i < this.length; i ++){  
         if(!ra.contains(this[i])){  
            ra.push(this[i]);  
         }  
     }  
     return ra;  
};  
  
/**  
* 求两个集合的补集  
{%example  
<script>  
     var a = [1,2,3,4];  
     var b = [3,4,5,6];  
     alert(Array.complement(a,b));  
</script>  
%}  
* @param {Array} a 集合A  
* @param {Array} b 集合B  
* @returns {Array} 两个集合的补集  
*/  
Array.complement = function(a, b){  
     return Array.minus(Array.union(a, b),Array.intersect(a, b));  
};  
  
/**  
* 求两个集合的交集  
{%example  
<script>  
     var a = [1,2,3,4];  
     var b = [3,4,5,6];  
     alert(Array.intersect(a,b));  
</script>  
%}  
* @param {Array} a 集合A  
* @param {Array} b 集合B  
* @returns {Array} 两个集合的交集  
*/  
Array.intersect = function(a, b){  
     return a.each(function(o){return b.contains(o.id) ? o : null});  
};  
  
/**  
* 求两个集合的差集  
{%example  
<script>  
     var a = [1,2,3,4];  
     var b = [3,4,5,6];  
     alert(Array.minus(a,b));  
</script>  
%}  
* @param {Array} a 集合A  
* @param {Array} b 集合B  
* @returns {Array} 两个集合的差集  
*/  
Array.minus = function(a, b){  
     return a.each(function(o){return b.contains(o.id) ? null : o});  
};  
  
/**  
* 求两个集合的并集  
{%example  
<script>  
     var a = [1,2,3,4];  
     var b = [3,4,5,6];  
     alert(Array.union(a,b));  
</script>  
%}  
* @param {Array} a 集合A  
* @param {Array} b 集合B  
* @returns {Array} 两个集合的并集  
*/  
Array.prototype.remove=function(dx) 
{ 
    if(isNaN(dx)||dx>this.length){return false;} 
    for(var i=0,n=0;i<this.length;i++) 
    { 
        if(this[i]!=this[dx]) 
        { 
            this[n++]=this[i] 
        } 
    } 
    this.length-=1 
}
Array.union = function(a, b){  
     return a.concat(b).uniquelize();  
};
Array.prototype.formatString=function(){
	return "["+this.toString()+"]";
}
Array.prototype.hashUnique = function(){
	var n = {},r=[]; //n为hash表，r为临时数组
	for(var i = 0; i < this.length; i++) //遍历当前数组
	{
		if (!n[this[i]]) //如果hash表中没有当前项
		{
			n[this[i]] = true; //存入hash表
			r.push(this[i]); //把当前数组的当前项push到临时数组里面
		}
	}
	return r;
}

//字符串去掉两边空格
String.prototype.trim = function() {  
    return this.replace(/(^\s*)|(\s*$)/g, '');  
};  

String.prototype.getLastYear = function(){
	
	
};

//同比日期
String.prototype.getYonY = function(){
	var ym = this.split("-");
	var lastYear = ym[0];
	var month = ym[1];
	
	lastYear = parseInt(lastYear)-1;
	
	return lastYear+month;
};
//环比日期
String.prototype.getChainMonth = function(){
	var ym = this.split("-");
	var lastYear = ym[0];
	var month = ym[1];
	
	if(month=="01"){
		month = "12";
		lastYear = parseInt(lastYear)-1;
	}else{
		month = parseInt(month,10);
		if(month>=2&&month<=10){
			month = "0"+(month-1);
		}else{
			month = "1"+(month-1);
		}
	}
	
	return lastYear+month;
}
Array.prototype.remove = function(s) {   
    for (var i = 0; i < this.length; i++) {   
        if (s == this[i])   
            this.splice(i, 1);   
    }   
} 

