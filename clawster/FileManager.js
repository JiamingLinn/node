var fs = require( "fs" ),
		pathUtil = require("path");
/**
 * @desc 文件内容操作类
 */
var File = function(obj){
	var obj = obj || {};
	this.saveDir = obj["saveDir"] ? obj["saveDir"] : ''; //文件保存目录
};

/**
 * @desc 内容存文件
 *
 * @param string filename 文件名
 * @param mixed content 内容
 * @param string charset 内容编码
 * @param Function cb 异步回调函数
 * @param boolean bAppend
 *
 * @return boolean
 */
File.prototype.save = function(filename,content,charset,cb,bAppend){
	if(!content || !filename){
		return false;
	}
	var filename = this.fixFileName(filename);
	if(typeof cb !== "function"){
		var cb = function(err){
			if(err){
				console.log("内容保存失败 FILE:"+filename);
			}
		};
	}
	var sSaveDir = pathUtil.dirname(filename);
	var self = this;
	var cbFs = function(){
		var buffer = new Buffer(content,charset ? charset : "utf8");
		fs.open(filename, bAppend ? 'a' : 'w', 0666, function(err,fd){
			if (err){
				cb(err);
				return ;
			}
			var cb2 = function(err){
				cb(err);
				fs.close(fd);
			};
			fs.write(fd,buffer,0,buffer.length,0,cb2);
		});
	};
	fs.exists(sSaveDir,function(exists){
		if(!exists){
			self.mkdir(sSaveDir,"0666",function(){
				cbFs();
			});
		} else {
			cbFs();
		}
	});
};


File.prototype.savefile = function( filename, content, mod, charset, cb ) {
	charset = charset || "utf8";
	filename = this.fixFileName(filename);
	var sSaveDir = pathUtil.dirname(filename);
	console.log(sSaveDir)
}

/**
 * @desc 修正保存文件路径
 *
 * @param string filename 文件名
 *
 * @return string 返回完整的保存路径 包含文件名
 */
File.prototype.fixFileName = function(filename){
	if(pathUtil.isAbsolute(filename)){
		return filename;
	}
	if(this.saveDir){
		this.saveDir = this.saveDir.replace(/[\\/]$/,pathUtil.sep);
	}
	return ( this.saveDir + '/' + filename ).replace( /\\\//g, pathUtil.sep );
};

/**
 *
 * @param stirng   dir 创建的文件路径
 * @param function cb  dir创建后回调函数
 *      er: object 失败时的错误信息
 *      dir：string dir
 * @param _makingcb 内部回调函数
 */
File.prototype.mkdir = function(dir, mod , cb, _makingcb) {
	var pdir = dir.substring(0,dir.lastIndexOf('/'));
	var self = this;
	var making = function(){
		fs.mkdir(dir,mod, function(er){
			if(cb) {
				cb.call(this, er, dir);
			}
			if(_makingcb){
				_makingcb();
			}
		});
	};
	fs.exists(pdir,function(e){
		if(!e){
			self.mkdir(pdir, null, function(){
				making();
			});
		}else {
			making();
		}
	});
};

/**
 * @递归删除目录 待完善 异步不好整
 *
 * @param string 目录路径
 * @param function 回调函数
 *
 * @return void
 */
File.prototype.rmdir = function(path,fn){
	var self = this;
	fs.readdir(path,function(err,files){
		if(err){
			if(err.errno == -4052){ //不是目录
				fs.unlink(path,function(err){
					if(!err){
						fn(path);
					}
				});
			}
		} else if(files.length === 0){
			fs.rmdir(path,function(err){
				if(!err){
					fn(path);
				}
			});
		}else {
			for(var i = 0; i < files.length; i++){
				self.rmdir(path+'/'+files[i],fn);
			}
		}
	});
};

File.prototype.record = function(f,m) {
	this.save(f,m,null,null,true);
}
module.exports = File;
