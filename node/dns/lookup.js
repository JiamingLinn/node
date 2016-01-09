/**
 * Created by ljm on 16-1-5.
 */
'use strict';

var dns = require('dns');

dns.lookup('www.google.com', (err, address, family) => {
	console.log('adresses: ', address);
});

dns.lookup('www.google.com', {
	family: 4,
	hints: dns.ADDRCONFIG ,
	all: false
}, function(err, address, family) {
	if (!err) {
		console.log(address, family);
	} else {
		console.log(err);
	}
});