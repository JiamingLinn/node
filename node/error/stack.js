/**
 * Created by ljm on 16-1-9.
 */
'use strict';

function MyError() {
	Error.captureStackTrace(this, MyError);
}

console.log(new MyError().stack);