/**
 * Created by ljm on 16-1-5.
 */
'use strict';

var cluster = require('cluster');

var http = require('http');

if (cluster.isMaster) {
	var numReqs = 0;
	setInterval(() => {
		console.log('numReqs: ', numReqs);
	}, 1000);

	let messageHandler=  function(msg) {
		if (msg.cmd && msg.cmd == 'notifyRequest') {
			numReqs += 1;
		}
	}
	var numCpus = require('os').cpus().length;
	for (var i = 0; i < numCpus; i++) {
		cluster.fork();
	}

	Object.keys(cluster.workers).forEach((d) => {
		cluster.workers[d].on('message', messageHandler);
	});
} else {
	http.Server((req, res) => {
		res.writeHeader(200);
		res.end('hello world\n');

		process.send({cmd:'notifyRequest'});
	}).listen(8000);
}