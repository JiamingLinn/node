var UrlManager = require('./UrlManager'),
	//unsuport
	FileManager = require('./FileManager'),

	NetTask = require("./NetTask");



function log( debug, fm ) {
	return debug ?
		/**
		 * [description]
		 * @param  string type 	    sucess|complete
		 * @param  string message [description]
		 * @return {[type]}         [description]
		 */
		function( type, message ) {
			console.log( type+ ":" + message);
		} :
		function( type, message ) {

		};
}

/**
var obj={
	debug:false,
	saveDir:'./',
	domain: null,
	startUrl: '/',
	strongFilter: null,
	weakFilter: null,
	todolist:null,
	urlHandler:null,
	maxUrlSize: 120
};
*/
var Clawster = function( obj ) {
	var obj = obj || {};
	this.debug = obj.debug || false;
	this.startUrl = obj.startUrl || '';
	this.fm = new FileManager({saveDir:obj.saveDir || './'});
	this.log = obj.log = log(this.debug, this.fm);
	this.um = new UrlManager(obj);
	this.nt = new NetTask(obj);
};

Clawster.prototype = {
	crawl: function() {
		var self = this;
		//定制NetTask回调函数
		self.nt.
			sucess( function( url, data ) {
				self.log( "sucess", url );
				self.fm.save( url.replace(/\w+\:\/\//,''), data );
				self.um.fetchUrls( url, data );
			}).fail( function( url, type, message ) {
				self.log( type, message );
			}).always(function( url) {
				self.um.complete( url );
			});

		//定制FileManager回调函数
		self.um.
			onUrls(function() {
				var url;
				if ( self.nt.isBusy() ) {
					return ;
				}
				url = self.um.getUrl();
				if( url != false ) {
					self.nt.request( url );
				}
			}).onComplete( function() {
				self.log( "complete" ,"");
			}).onException( function( message ) {
				self.log( "exception", message );
			});

		//开始爬虫任务
		//我们假设startUrl已经是标准的url格式了（etc: http://example.com/）
		self.um.addUrl( self.startUrl );
		self.um.fire();
	}
}

var c = new Clawster({
	debug: true,
	saveDir:'./m',
	startUrl: 'http://video.weibo.com/show?fid=1034:ca9a2f993b409c8266b34a61df0e9b1f',
	strongFilter: null,
	weakFilter: null,
	urlHandler:null,
	maxUrlSize: 120
});
c.crawl();