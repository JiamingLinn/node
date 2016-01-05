/**
 * Created by ljm on 16-1-5.
 */
'use strict';

var dns = require('dns');

dns.lookup('www.google.com', (err, address, family) => {
	console.log('adresses: ', address);
});