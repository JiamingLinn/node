/**
 * Created by ljm on 16-1-5.
 */
'use strict';
var cluster = require('cluster');
if (cluster.isMaster) {
	var worker = cluster.fork();
	var timeout;

	worker.on('listening', (address) => {
		worker.send('shutdown');
		worker.disconnect();

		timeout = setTimeout(() => {
			worker.kill();
		}, 10000);
	});

	worker.on('disconnect', () => {
		clearTimeout(timeout);
	});
} else if (cluster.isWorker) {
	var net = require('net');
	var server = net.createServer((socket) => {
		//
	});

	server.listen(8000);

	process.on('message', (msg) => {
		if(msg == 'shutdown') {

		}
	})
}