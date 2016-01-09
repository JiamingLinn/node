/**
 * Created by ljm on 16-1-9.
 */
'use strict';

var http = require('http');

http.get({
	hostname: 'www.baidu.com',
	port: 80,
	path: '/'
}, (res) => {

}).on('socket', (socket) => {
	//remove the socket after used
	socket.on('data', (data) => {
		console.log(new Buffer(data).toString());
	}).on('end', () => {
		socket.emit('agentRemove');
	});
});

//the same as below:
//
//http.get({
//	hostname: 'www.baidu.com',
//	port: 80,
//	path: '/',
//	agent: false //create a new agent just for this one request
//}, (res) => {
//	console.log(res);
//});