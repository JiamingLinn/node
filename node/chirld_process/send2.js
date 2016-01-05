'use strict';
var cp = require('child_process');

var child = cp.fork('child2.js');

var server = require('net').createServer();

server.on('connetion', (socket) => {
	socket.end('handle by parent');
});

server.listen(1337, () => {
	child.send('server', server);
});