/**
 *
 * Created by ljm on 16-1-12.
 */

'use strict';

const net = require('net');

let server = net.createServer((socket) => {
	socket.write('server callback\n');
}).on('close', () => {
	console.log('close event', arguments);
}).on('connection', (socket) => {
	console.log('connection event');
	socket.end('connection event\n');
}).on('listening', (socket) => {
	console.log('listening event', arguments);
}).listen(8080);
