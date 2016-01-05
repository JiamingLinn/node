/**
 * Created by ljm on 16-1-5.
 */
'use strict';

var cp = require('child_process');
var net = require('net');

var normal = cp.fork('child3.js', ['normal']);
var special = cp.fork('child3.js', ['special']);

var server = net.createServer();
server.on('connection', (socket) => {
	if (socket.remoteAddress === '127.0.0.1') {
		console.log(socket.remoteAddress);
		special.send('socket', socket);
		return;
	}
	normal.send('socket', socket);
});

server.listen(1337);