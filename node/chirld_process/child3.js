/**
 * Created by ljm on 16-1-5.
 */
'use strict';
process.on('message', (m, socket) => {
	if (m === 'socket') {
		socket.end(socket.remoteAddress+'you were handled as a ' + process.argv[2] + ' person');
	}
});
