/**
 * Created by ljm on 16-1-5.
 */
'use strict';
process.on('message', (m, server) => {
	if (m === 'server') {
		server.on('connection', (socket) => {
			socket.end('handle by child');
		});
	}

});