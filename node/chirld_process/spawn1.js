/**
 * Created by ljm on 16-1-5.
 */
'use strict';

var spawn = require('child_process').spawn,
	ls = spawn('ls', ['-lh', '/usr']);

ls.stdout.on('data', (data) => {
	console.log('stdout: ' + data);
});

ls.stderr.on('data', (data) => {
	console.log('stderr: ' + data);
});

ls.on('close', (code, signal) => {
	console.log('child process closed with code: ' + code + '; signal: ' + signal);
});

