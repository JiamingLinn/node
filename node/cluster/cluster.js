/**
 * Created by ljm on 16-1-5.
 */
var cluster = require('cluster');
var http = require('http');
var numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
	// Fork workers.
	for (var i = 0; i < numCPUs; i++) {
		cluster.fork();
	}

	cluster.on('exit', function(worker, code, signal) {
		console.log('worker ' + worker.process.pid + ' died');
	});
} else {
	// Workers can share any TCP connection
	// In this case it is an HTTP server
	var i = 0;
	http.createServer(function(req, res) {
		res.writeHead(200);
		res.end("hello world\n"+ process.pid);
		console.log(process.pid, ++i);
	}).listen(8000);
}