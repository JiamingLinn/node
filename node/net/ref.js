/**
 * Created by ljm on 16-1-14.
 */
'use strict';

const net = require('net');

let server = net.createServer((socket) => {
	socket.write('server callback\n');
}).on('connection', (socket) => {
	console.log('connection event');
	socket.end('connection event\n');
}).on('listening', (socket) => {
	console.log('listening event', arguments);
}).listen(8080)
//当这是唯一的server时， 将允许程序退出
.unref();