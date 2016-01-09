/**
 * Created by ljm on 16-1-9.
 */
'use strict';

var http = require('http');

var keepAliveAgent = new http.Agent({keepAlive: true});

console.log(keepAliveAgent);