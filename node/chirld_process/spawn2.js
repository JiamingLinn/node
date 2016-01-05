/**
 * Created by ljm on 16-1-5.
 */
'use strict';

var spawn = require('child_process').spawn,
	ps = spawn('ps', ['ax']),
	grep = spawn('grep', ['ssh']);

ps.stdout.on('data', (data) => {
	grep.stdin.write(data);
});

ps.stderr.on('data', (data)=> {
	console.log('ps error: ' + data);
});

ps.on('close', (code) => {
	if (code !== 0) {
		console.log('ps process exited code: ' + code);
	}
	grep.stdin.end();
});

grep.stdout.on('data', (data) => {
	console.log('grep:' + data);
});

grep.stderr.on('data', (data) => {
	console.log('grep err' + data);
});

grep.on('close', (code) => {
	if ( code !== 0) {
		console.log('grep process exited with code ' + code);
	}
});