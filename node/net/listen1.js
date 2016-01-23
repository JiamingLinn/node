/**
 * Created by ljm on 16-1-15.
 */
'use strict';

const net = require('net');

net.createServer()
	.listen({
		path: '/home/ljm/.bashrc'
	}).on('connection', (socket) => {
		console.log('connection', arguments);
	}).on('listen', () => {
		console.log('listening', arguments);
	});