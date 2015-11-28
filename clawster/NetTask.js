var ptcs = {
		"http": require("http"),
		"https": require("https")
	},
	deferred = require("./deferred.js");

var NetTask = function( obj ) {
	var self = this;
	self.busying = false;
	self.defer = deferred(null, "memory");
	self.defer.always( function (){
		self.busying = false;
	});
};
/**
 * @desc 判断请求资源类型
 *
 * @param string  Content-Type头内容
 *
 * @return [大分类,小分类,编码类型] ["image","png","utf8"]
 */
var getResourceType= function(type){
	if(!type){
		return '';
	}
	var aType = type.split('/');
	aType.forEach(function(s,i,a){
		a[i] = s.toLowerCase();
	});
	if(aType[1] && (aType[1].indexOf(';') > -1)){
		var aTmp = aType[1].split(';');
		aType[1] = aTmp[0];
		for(var i = 1; i < aTmp.length; i++){
			if(aTmp[i] && (aTmp[i].indexOf("charset") > -1)){
				aTmp2 = aTmp[i].split('=');
				aType[2] = aTmp2[1] ? aTmp2[1].replace(/^\s+|\s+$/,'').replace('-','').toLowerCase() : '';
			}
		}
	}
	if((["image"]).indexOf(aType[0]) > -1){
		aType[2] = "binary";
	}
	return aType;
};

NetTask.prototype = {
	/**
	 * 添加任务成功时回调函数
	 * @param Function (url, html)
	 * @returns {NetTask}
     */
	sucess: function() {
		this.defer.done(arguments);
		return this;
	},
	/**
	 * 添加任务失败时回调函数
	 * @param Function (url, type, message)
	 * 	  url	 :	string
	 * 	  type	 :  string  fail
	 * 	  message:	string
	 * @returns {NetTask}
	 */
	fail: function() {
		this.defer.fail(arguments);
		return this;
	},
	always: function() {
		this.defer.always( arguments );
	},
	/**
	 * 开始任务
	 * @param url
	 * @returns {*}
     */
	request: function( url ) {
		var self = this;
		if(self.busying) return false;
		self.busying = true;
		var div = url.split('://');

		var protocol = div[0];

		if ( !(protocol in ptcs) ) {
			self.defer.reject( url, "fail", "iligal protocol:" + protocol +" "+ url);
		}
		else {
			var req = ptcs[protocol].request(url);
			req.on("response", function(res) {
				var aType = getResourceType(res.headers['content-type']);
				var html = '';
				if(aType[2] == 'binary'){
					res.setEncoding('binary');
				}
				res.on('data', function( data ) {
					html += data;
				}).on('end', function() {
					//console.log(html);
					self.defer.resolve( url,html);
					html = null;
				}).on('error', function() {
					self.reject(url, "fail", "disconnenct:" + url);
				});
			}).on("error", function () {
				self.defer.reject(url, "fail", "fetch content fail:"+ url);
			}).end();
		}
		return this;
	},
	then: function () {
		this.defer.then(arguments);
	},
	isBusy: function() {
		return this.busying;
	}
}

module.exports = NetTask;