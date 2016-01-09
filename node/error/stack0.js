/**
 * Created by ljm on 16-1-9.
 */
'use strict';

const myObject = {};

Error.captureStackTrace(myObject);

console.info(myObject.stack);