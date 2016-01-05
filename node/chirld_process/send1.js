/**
 * Created by ljm on 16-1-4.
 */
var cp = require('child_process');

var n = cp.fork('sub1.js');

n.on('message', (m) => {
	console.log('parent got message', m);
});

n.send({hello: 'world'});