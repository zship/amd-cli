'use strict';


var map = require('mout/object/map');
var flatten = require('mout/array/flatten');
var unique = require('mout/array/unique');

var findCircularDependencies = require('libamd/findCircularDependencies');
var normalize = require('libamd/modules/normalize');
var rotated = require('libamd/cycles/rotated');
var rotateUntil = require('libamd/cycles/rotateUntil');
var contains = require('libamd/cycles/contains');

var parseOpts = require('./util/parseOpts');
var parseConfig = require('./util/parseConfig');
var resolveFileArgs = require('./util/resolveFileArgs');
var log = require('./util/log');


var _opts = {
	'recursive': {
		type: Boolean,
		shortHand: 'R',
		description: 'Recurse into the full dependency graph of each passed <module>, adding each dependency into the <module> list'
	}
};


var circulars = function() {
	var args = process.argv.slice(3);
	var opts = parseOpts(_opts, args, 0);

	var rjsconfig = parseConfig();
	var filePool = resolveFileArgs(opts.argv.remain, rjsconfig, opts.recursive);

	var circulars = findCircularDependencies(filePool, rjsconfig);

	if (!circulars.length) {
		log.ok();
	}
	else {
		log.warn();
		log.doubleline();
		log.write(circulars.length + ' circular dependencies (' + '--verbose' + ' for more info)\n\n');

		circulars = circulars.map(function shortNames(loop) {
			return loop.map(function(file) {
				return normalize(rjsconfig, file);
			});
		});

		//split into groups of dependency paths which share at least two nodes
		//(in order). This will reveal which modules appear most often in the
		//circular dependency chains.
		var grouped = (function() {
			var groups = {};

			circulars.forEach(function(loop) {
				for (var i = 0; i < loop.length; i++) {
					var rotatedCopy = rotated(loop, i).slice(0, 2);
					var key = rotatedCopy.join(',');
					if (groups[key]) {
						continue;
					}
					groups[key] = circulars.filter(function(otherLoop) {
						return contains(rotatedCopy, otherLoop);
					});
				}
			});

			return groups;
		})();

		grouped = map(grouped, function(loops, key) {
			var group = key.split(',');
			return loops
				.slice()
				.sort(function(a, b) {
					return b.length - a.length;
				})
				.map(function alignToGroupStart(loop) {
					return rotateUntil(loop, function(rotated) {
						return rotated[0] === group[0];
					});
				});
		});


		var mostOccurring = (function() {
			var count = {};
			var modules = unique(flatten(circulars, true));
			return modules
				.map(function(mod) {
					circulars.forEach(function(loop) {
						if (loop.indexOf(mod) !== -1) {
							count[mod] = count[mod] || 0;
							count[mod]++;
						}
					});
					return mod;
				})
				.sort(function(a, b) {
					return count[b] - count[a];
				})
				.map(function(mod) {
					return {
						name: mod,
						count: count[mod]
					};
				});
		})();

		mostOccurring.forEach(function(mod) {
			var count = {};
			mod.paths = circulars
				.filter(function(loop) {
					return loop.indexOf(mod.name) !== -1;
				})
				.map(function(loop) {
					var ret = [];
					var i = 0;
					while(ret[1] !== mod.name) {
						ret = rotated(loop, i);
						i++;
					}
					count[ret[0]] = count[ret[0]] || 0;
					count[ret[0]]++;
					return ret;
				})
				.sort(function(a, b) {
					return count[b[0]] - count[a[0]];
				});
		});

		//console.log(JSON.stringify(mostOccurring, false, 4));

		log.writeln('Full list').line();

		circulars
			.map(function(loop) {
				var occurrenceCount = function(name) {
					return mostOccurring.filter(function(mod) {
						return mod.name === name;
					})[0].count;
				};
				var sorted = loop.slice().sort(function(a, b) {
					return occurrenceCount(b) - occurrenceCount(a);
				});
				return rotateUntil(loop, function(rotated) {
					return rotated[0] === sorted[0];
				});
			})
			.sort(function(a, b) {
				return a.length - b.length;
			})
			.forEach(function(loop) {
				log.write('.. ' + loop.join(' -> ') + ' ..\n');
			});

		log.write('\n');
		log.writeln('Most common subpaths (length 1) / Most-occurring').line();

		mostOccurring
			.filter(function(mod) {
				return mod.count > 1;
			})
			.forEach(function(mod) {
				log.write(mod.count + ' chains: ' + mod.name + '\n');
				mod.paths.forEach(function(loop) {
					var msg = '.. ' + loop.join(' -> ') + ' ..\n';
					log.verbose.write(msg);
				});
				log.verbose.writeln();
			});

		if (Object.keys(grouped).length) {
			log.write('\n');
			log.write('Most common subpaths (length 2)\n').line();

			Object.keys(grouped)
				.sort(function(a, b) {
					return grouped[b].length - grouped[a].length;
				})
				.filter(function(key) {
					var loops = grouped[key];
					return loops.length > 1;
				})
				.forEach(function(key) {
					var loops = grouped[key];
					var group = key.split(',');
					log.writeln(loops.length + ' chains: ' + group.join(' -> '));
					loops.forEach(function(loop) {
						var msg = '.. ' + loop.join(' -> ') + ' ..\n';
						log.verbose.write(msg);
					});
					log.verbose.writeln();
				});
		}
	}

};


module.exports = circulars;
