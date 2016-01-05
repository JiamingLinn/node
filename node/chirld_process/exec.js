/**
 * Created by ljm on 16-1-5.
 */
'use strict';

var cp = require('child_process');

var child = cp.exec('cat *.js | wc -l',{shell:'/bin/bash'}, (err, stdout, stderr) => {
	console.log('stdout:' + stdout);
	console.log('stderr:' + stderr);
	if (null != err) {
		console.log('exec error: ' + err);
	}
});
