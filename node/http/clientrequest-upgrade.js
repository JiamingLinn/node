/**
 * Created by ljm on 16-1-11.
 */
'use strict';
const http = require('http');

var srv = http.createServer((req, res) => {
	res.writeHead(200, {'Content-Type:text/plain'});
	res.end('okay');
});

srv.on('upgrade', (req, socket, head) => {
	socket.write('HTTP/1.1 Web Socket Protocol Handshake\r\n' +
		'Upgrade:WebSocket\r\n' +
		'Connection:Upgrade\r\n' +
		'\r\n');
	socket.pipe(socket);
});

srv.listen(1337, '127.0.0.1', () => {
	var options = {
		hostname: '127.0.0.1',
		port: 1337,
		headers: {
			Connection: 'Upgrade',
			Upgrade: 'WebSocket'
		}
	};

	var req = http.request(options);
	req.end();
	req.on('Upgrade', (res, socket, head) => {
		console.log('got upgraded');
		socket.end();
		process.exit(0);
	});
});