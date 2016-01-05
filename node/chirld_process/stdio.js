/**
 * Created by ljm on 16-1-5.
 */
'use strict';

var assert = require('assert');

var fs = require('fs');

var cp = require('child_process');

var child = cp.spawn('ls', {
	stdio: [
		0,
		'pipe',
		fs.openSync('err.out', 'w')
	]
});

assert.equal(child.stdio[0], null);
assert.equal(child.stdio[0], child.stdin);
assert(child.stdout);
assert.equal(child.stdio[1], child.stdout);

assert.equal(child.stdio[2], null);
assert.equal(child.stdio[2], child.stderr);