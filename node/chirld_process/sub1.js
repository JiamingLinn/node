/**
 * Created by ljm on 16-1-4.
 */
'use strict';
process.on('message', (mes) => {
	console.log('child got message', mes);
});

process.send({foo: 'barr'});