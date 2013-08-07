'use strict';

var path = require('path');
var map = require('mout/object/map');
var flatten = require('mout/array/flatten');
var unique = require('mout/array/unique');

var findBrokenDependencies = require('amd-tools/findBrokenDependencies');
var findCircularDependencies = require('amd-tools/findCircularDependencies');
var getName = require('amd-tools/modules/getName');
var rotated = require('amd-tools/cycles/rotated');
var rotateUntil = require('amd-tools/cycles/rotateUntil');
var contains = require('amd-tools/cycles/contains');

var log = require('../log');


var check = function(filePool, rjsconfig) {
	log.write('Checking ' + filePool.length + ' files\n\n');

	log.verbose.writeln('RequireJS configuration:'.cyan);
	log.verbose.write(JSON.stringify(rjsconfig, false, 4).cyan + '\n\n');

	log.write('Running broken dependency check...');

	var broken = flatten(filePool.map(function(file) {
		return findBrokenDependencies(file, rjsconfig);
	}), true);
	broken = broken.filter(function(dep) {
		return dep.declared.search(/http(s*):/) === -1;
	});

	if (!broken.length) {
		log.ok();
	}
	else {
		log.warn();
		log.doubleline();
		log.write(broken.length + ' unresolved dependencies:\n\n');
		broken.forEach(function(dep) {
			var parent = path.relative(process.cwd(), dep.parent);
			switch(dep.type) {
				case 'plugin':
					log.writeln(parent + ': ' + dep.pluginName.red + '!' + dep.pluginArgs);
				break;
				case 'args':
					log.writeln(parent + ': ' + dep.pluginName + '!' + dep.pluginArgs.red);
				break;
				default:
					log.writeln(parent + ': ' + dep.declared);
				break;
			}
		});
		log.write('\n');
	}

	log.write('Running circular dependency check...');

	var circulars = findCircularDependencies(filePool, rjsconfig);

	if (!circulars.length) {
		log.ok();
	}
	else {
		log.warn();
		log.doubleline();
		log.write(circulars.length + ' circular dependencies (' + '--verbose'.cyan + ' for more info)\n\n');

		circulars = circulars.map(function shortNames(loop) {
			return loop.map(function(file) {
				return getName(file, rjsconfig);
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
					log.verbose.write(msg.cyan);
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
						log.verbose.write(msg.cyan);
					});
					log.verbose.writeln();
				});
		}

	}
};


module.exports = check;
