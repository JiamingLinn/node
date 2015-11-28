var path = require("path"),
	urlUtil = require("url"),
	callbacks = require("./callbacks");
var urlsRegex = [
	/<a.*?href=['"]([^"']*)['"][^>]*>/gmi,
	/<script.*?src=['"]([^"']*)['"][^>]*>/gmi,
	/<link.*?href=['"]([^"']*)['"][^>]*/gmi,
	/<img.*?src=['"]([^"']*)['"][^>]*>/gmi,
	/url\s*\([\\'"]*([^\(\)]+)[\\'"]*\)/gmi, //CSS背景
];
var ptcRegex = /^\w+\:\/\/\S+/gi;

var UrlManager = function( obj ) {
	if(!(this instanceof UrlManager)) {
		return new UrlManager();
	}
	this.urls = new UrlList(false);
	//错误回调函数链
	this.errorHandler = callbacks("memory");
	//资源可用时回调函数链
	this.atcionHandler = callbacks('memory');
	//完成后或回调函数链
	this.completedHandler = callbacks("memory");
	//重过滤器，匹配修复后的url，不匹配则不下载
	this.strongFilter = obj.strongFilter || null;
	//轻过滤器，不匹配的url仍然下载，但不获取内容中url
	this.weakFilter = obj.weakFilter || null;
	//修复后的url的长度限制
	this.maxUrlSize = obj.maxUrlSize || 120;
}

UrlManager.prototype = {
	/**
	 * @desc 判断是否是合法的URL地址一部分
	 *
	 * @param string urlPart
	 *
	 * @return boolean
	 */
	isValidPart: function( urlPart ) {
		var reg = /^javascript|^mailto|^#|^data|^\/$/ig;
		if ( !urlPart ) {
			return false;
		}
		if ( urlPart.match(reg)  ) {
			return false;
		}
		return true;
	},
	/**
	 * @desc 获取URL地址 路径部分 不包含域名以及QUERYSTRING
	 *
	 * @param string url
	 *
	 * @return string
	 */
	getUrlPath: function( url ) {
		if ( !url ) {
			return '';
		}
		var oUrl = urlUtil.parse( url );
		if ( oUrl.pathname && oUrl.pathname.match( /\/$/ ) ) {
			oUrl.pathname += "index.html";
		}
		if ( oUrl.pathname ) {
			return oUrl.pathname.replace(/^\/+/, '');
		}
		return '';
	},
	/**
	 * 修正url
	 * @param url  string 参考url
	 * @param url2 string 被修复url
	 * @return 修复后url
	 */
	_fix: function( url, url2 ) {
		var charp,
			aUrlPart,
			aUrl2Part,
			matches,
			oUrl,
			i,
			len;

		//parse '/'
		url2 = url2.replace(/\\/,'/');

		//deal with hash: delete it
		if((charp = url2.lastIndexOf("#")) > -1 ){
			url2 = url2.substring(0, charp);
		}

		//deal with query : do nothing

		//deal with index do nothing

		//deal with protocol
		matches = url2.match(ptcRegex);
		if(matches) {
			return url2;
		}

		//deal with path without protocol
		oUrl = urlUtil.parse(url);
		aUrlPart = oUrl.pathname.split("/");
		aUrlPart.pop();

		if ( url2.indexOf("//") == 0 ){
			//带域名的： //example.com/path
			return oUrl.protocol + url2;
		} else if(url2.indexOf('../')==0){
			//相对路径 ： 。。/****
			aUrl2Part = url2.split('/');
			for (i = 0, len = aUrl2Part.length;i<len;i++) {
				if(aUrl2Part[i] == '..'){
					aUrlPart.pop();
				}else {
					aUrlPart.push(aUrl2Part[i]);
				}
			}
			return oUrl.protocol + "//" + oUrl.hostname + '/' + aUrlPart.join("/");
		} else if (url2[0]=='/') {
			//绝对路径 ： /***
			return oUrl.protocol + "//" + oUrl.hostname + '/' + url2;
		} else {
			//相对路径： 。/*** 或 ***
			if ( url2[0] == '.' ) {
				url2 =  url2.substring(1);
			} else {
				url2 = '/' + url2;
			}
			return oUrl.protocol + "//" + oUrl.hostname + aUrlPart.join("/") + url2;
		}
	},
	/**
	 * 处理获取到的原始url，添加到url列表管理
	 * @param url 	string	资源页面url
	 * @param url2	string	从资源页面中获取的url
     */
	addUrl: function( url, url2 ) {
		if(!url2){
			//加入连接
			this.urls.add( url );
			return ;
		}
		//check valid
		if ( !this.isValidPart( url2 ) ) {
			this.errorHandler.fire( "不合格url:" + url2 );
			return ;
		}
		//格式化url
		var u = this._fix( url, url2 );

		if (!u) {
			this.errorHandler.fire( "url解析异常:" + u + "(" + url2 + ")" );
			return ;
		}
		//url长度限制maxUrlSize
		if ( u.length > this.maxUrlSize ) {
			this.errorHandler.fire( "url长度超过限制：" + u + "(" + url2 + ")" );
		}
		//重过滤器strongFilter，不匹配则不下载
		if( this.strongFilter && !u.match( this.strongFilter ) ) {
			this.errorHandler.fire( "过滤url：" + u );
		}
		this.addUrl(u);
	},
	/**
	 * @desc 从列表中获取url
	 * @return false|string
	 */
	getUrl: function() {
		return this.urls.get();
	},
	/**
	 * 从文本中获取url，
	 * @param url	string	文本来源
	 * @param html	string	文本
	 * @returns {UrlManager}
     */
	fetchUrls: function( url, html ) {
		if(!url) {
			this.errorHandler.fire("空url");
			return;
		}
		if(!html) {
			this.errorHandler.fire("空内容："+url);
		}

		//轻过滤器，下载后不再下载内容中链接
		if (this.weakFilter && ! url.match( this.weakFilter ) ){
			return this;
		}

		var i = 0,
			len = urlsRegex.length,
			aRet;
		html = html.replace(/[\n\r\t]/gm,'');
		for(;i<len;i++) {
			do{
				aRet = urlsRegex[i].exec(html);
				if(aRet && !this.addUrl(url, aRet[1].trim())) {
					//this.errorHandler.fire("非法url："+aRet[1]);
				}
			}while (aRet);
		}
		return this;
	},
	/**
	 * 可用url是否还有
	 * @returns boolean
     */
	hasNext: function(){
		return this.urls.isEmpty();
	},
	/**
	 * 是否已经没有url
	 * @returns boolean
     */
	isEmpty: function() {
		return this.urls.isEmpty();
	},
	isCompleted: function() {
		return this.urls.completed();
	},
	/**
	 * 撤销url的任务，检查是否爬完,若未爬完触发onurl事件
	 * @param url
     */
	complete: function( url ) {
		if(!this.urls.remove(url)) {
			this.errorHandler.fire("未回收dongs资源");
		}
		// 检查是否爬网
		if ( this.isCompleted() ) {
			this.completedHandler.fire();
		} else {
			this.fire();
		}
		return this;
	},

	fire: function() {
		this.atcionHandler.fire();
		return this;
	},
	/**
	 * @param function|array 当有新的url资源时的回调函数
	 * 	回调函数可用参数:
	 * 		null
	 *
	 * @returns {UrlManager}
     */
	onUrls: function() {
		this.atcionHandler.add(arguments);
		return this;
	},
	/**
	 * @param function|array 任务结束时的回调函数
	 * 	回调函数可用参数:
	 * 		null
	 * @returns {UrlManager}
	 */
	onComplete: function() {
		this.completedHandler.add(arguments);
		return this;
	},
	/**
	 * @param function|array 异常回调函数
	 * 	回调函数可用参数:
	 * 		message:	string	错误信息
	 * @returns {UrlManager}
	 */
	onException: function() {
		this.errorHandler.add(arguments);
		return this;
	}
}

var UrlList = function () {
	this.todos = [];
	this.doings = [];
	this.dones = [];
}

function contains(arr, ele) {
	return arr.indexOf(ele) > -1;
}

UrlList.prototype = {
	add: function (url) {
		if(!contains(this.todos,url) &&
				!contains(this.doings,url) &&
				!contains(this.dones,url)) {
			this.todos.push( url );
		}
	},
	get: function () {
		if (!this.empty()) {
			var url = this.todos.shift();
			this.doings.push(url);
			return url;
		} else {
			return false;
		}
	},
	remove: function (url) {
		var i = this.doings.indexOf(url);
		if (i > -1) {
			this.doings.splice(i, 1);
			this.dones.push(url);
			return true;
		}
		return false;
	},
	empty: function () {
		return !this.todos.length;
	},
	completed: function () {
		return this.empty() && !this.doings.length;
	}
}
module.exports = UrlManager;