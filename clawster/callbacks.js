var rnotwhite = (/\S+/g);

var Callbacks = function(options) {
	options = (function(options){
		var opts = options.split(' '),
			result = {};
		for(var i in opts) {
			result[opts[i]] = true;
		}
		return result;

	})(options);

	var firing,
		//上次触发的zhi
		memory,
		fired,
		firingLength,
		firingIndex,
		fireingStart,
		//actual callback list
		list = [],
		//Stack of fire calls to repeatale lists
		//each element cotaions its context and arguments ([context, arg])
		//if options contaions "once" ,stack would be undefined
		stack = !options.once && [],
		fire = function(data) {
			memory = options.memory && data;
			fired = true;
			firingIndex = fireingStart || 0;
			fireingStart = 0;
			firingLength = list.length;
			firing = true;
			for (; list && firingIndex < firingLength; firingIndex++) {
				//data[1]必须是数组
				if(typeof data[1] === "string") {
					data[1] = [data[1]];
				}
				if (list[firingIndex].apply(data[0], data[1]) === false && options.stopOnFalse) {
					memory = false;
					break;
				}
			}
			firing = false;
			if (list) {
				if (stack) {
					// not once 
					if (stack.length) {
						fire(stack.shift());
					}
				} else if (memory) {
					//once memory
					list = []
				} else {
					//once, not memory
					self.disable();
				}
			}
		},
		//Actual Callbacks object
		self = {
			//to add callback or a collection of callbacks to the list
			add: function(args) {

				if (list) {
					//save the current length of callback list
					var start = list.length;
					//then, add the callback to the list
					(function add(args) {
						args = [].slice.apply(args, args);
						for (var i in args) {
							var arg = args[i],
								type = typeof arg;
							if (type === "function") {
								if (!options.unique || self.has(arg)) {
									list.push(arg);
								}
							} else if ( arg && arg.length && type !== "string") {
								add(arg);
							}
						}
					})(arguments);
					//if the Callback object is firing, 
					//then switch the callbacks length
					if (firing) {
						firingLength = list.length;
						//with memory, if not firing then
						//call the added callbacks right away
					} else if (memory) {
						fireingStart = start;
						fire(memory);
					}
				}
				return this;
			},
			remove: function() {
				if (list) {
					for(var i in arguments){
						var index,
							arg = arguments[i];
						while ((index = list.indesOf(arg)) > -1) {
							list.splice(index, 1);
							//handle firing indexes
							if (firing) {
								if (index <= firingLength) {
									firingLength--;
								}
								if (index <= firingIndex) {
									firingIndex--;
								}
							}
						}
					}
				}
				return this;
			},
			has: function(fn) {
				return fn ? ( list && (list.indexOf(fn) > -1)) : !!(list.length);
			},
			empty: function() {
				list = [];
				firingLength = 0;
				return this;
			},
			disable: function() {
				list = stack = memory = undefined;
			},
			disabled: function() {
				return !list;
			},
			lock: function() {
				stack = undefined;
				if (!memory) {
					self.disable();
				}
			},
			locked: function() {
				return !stack;
			},
			fireWith: function(context, args) {
				if (list && (!fired || stack)) {
					args = args || [];
					args = [context, args.slice ? args.slice() : args];
					if (firing) {
						stack.push(args);
					} else {
						fire(args);
					}
				}
				return this;
			},
			fire: function(arg) {
				self.fireWith(this, arg);
				return this;
			},
			fired: function() {
				return !!fired;
			}
		};
	return self;
};

module.exports = Callbacks;
