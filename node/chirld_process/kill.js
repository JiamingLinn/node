/**
 * Created by ljm on 16-1-4.
 */
var cp = require('child_process');

var grep = cp.spawn('grep', ['ssh']);

grep.on('close', (code, signal) => {
	console.log('child process terninate: ' + signal);
});

grep.kill('SIGHUP');