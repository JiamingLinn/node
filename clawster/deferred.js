var callbacks = require("./callbacks");

var util = {
	extend: function() {
		var src, copyIsArray, copy, name, options, clone,
            target = arguments[0] || {},
            i = 1,
            length = arguments.length,
            deep = false;

        // Handle case when target is a string or something (possible in deep copy)
        if ( typeof target !== "object" && !(typeof target=== "function" ) ) {
            target = {};
        }

        // extend jQuery itself if only one argument is passed
        if ( i === length ) {
            target = this;
            i--;
        }

        for ( ; i < length; i++ ) {
            // Only deal with non-null/undefined values
            if ( (options = arguments[ i ]) != null ) {
                // Extend the base object
                for ( name in options ) {
                    src = target[ name ];
                    copy = options[ name ];

                    // Prevent never-ending loop
                    if ( target === copy ) {
                        continue;
                    }

                    if ( copy !== undefined ) {
                        target[ name ] = copy;
                    }
                }
            }
        }

        // Return the modified object
        return target;
	}
};

var Deferred = function( func,pattern ) {
	pattern = pattern || "once memory";
	var tuples = [
			['resolve', "done", callbacks(pattern), "resolved"],
			['reject', "fail", callbacks(pattern, "rejected")],
			[ "notify", "progress", callbacks(pattern) ]
		],
		state = "pending",
		deferred = {},
		promise = {
			state: function() {
				return state;
			},
			always: function() {
				deferred.done( arguments ).fail(arguments);
				return this;
			},
			// fnDone, fnFail, fnProgress 
			then: function() {
				var fns = arguments;
				return Deferred(function( newDefer ) {
					for (var i in tuples) {
						var tuple = tuples[i];
						var fn = (typeof fns[i] === 'function' ?
								fns[i] : false);
						deferred[tuple[1]](function() {
							var returned = fn && fn.apply(this, arguments);
							if( returned && (typeof returned.promise ==='function')) {
								returned.promise()
									.done(newDefer.resolve)
									.fail(newDefer.reject)
									.promise(newDefer.notify);
							} else {
								newDefer[ tuple[0] + "With" ](this===promise ? newDefer.promise() : this, fn ? [returned]:arguments);
							}
						});
					}
					fns = null;
				}).promise();
			},
			promise: function( obj ) {
				return obj != null ? util.extend(obj, promise):promise; 
			}
		};
	promise.pipe = promise.then;

	for ( var ind in tuples ) {
		(function (ind){
			var tuple = tuples[ind];
			var list = tuple[2];
			var stateString = tuple[3];
			promise[tuple[1]] = list.add;

			if(stateString){
				list.add(function(){
					state = stateString;
				})
				.add(tuples[ ind ^ 1 ][ 2 ].disable)
				.add(tuples[ 2 ][ 2 ].lock );
			}
			deferred[tuple[0]] = function() {
				deferred[tuple[0] + "With"]( this === deferred?this:promise,arguments);
				return this;
			};
			deferred[ tuple[0]+"With"] = list.fireWith;
		})(ind);	
	}
	promise.promise(deferred);

	if(func){
		func.call(deferred, deferred);
	}
	return deferred;
}

module.exports = Deferred;