'use strict';


var map = require('mout/object/map');
var values = require('mout/object/values');
var flatten = require('mout/array/flatten');

var findCircularDependencies = require('libamd/findCircularDependencies');
var normalize = require('libamd/modules/normalize');
var rotated = require('libamd/cycles/rotated');
var rotateUntil = require('libamd/cycles/rotateUntil');
var contains = require('libamd/cycles/contains');
var unique = require('libamd/cycles/unique');

var parseOpts = require('./util/parseOpts');
var parseConfig = require('./util/parseConfig');
var resolveFileArgs = require('./util/resolveFileArgs');
var findProjectFiles = require('./util/findProjectFiles');
var log = require('./util/log');


var _opts = {
	'recursive': {
		type: Boolean,
		shortHand: 'R',
		description: 'Recurse into the full dependency graph of each passed <module>, adding each dependency into the <module> list'
	},
	'group': {
		type: Number,
		shortHand: 'g'
	}
};


var _groupsOf = function(cycles, num) {
	var groups = {};

	cycles
		.filter(function(loop) {
			return loop.length >= num;
		})
		.forEach(function(loop) {
			for (var i = 0; i < loop.length; i++) {
				var subLoop = rotated(loop, i).slice(0, num);
				var key = subLoop.join(',');
				if (groups[key]) {
					continue;
				}
				groups[key] = cycles
					.filter(function(otherLoop) {
						return contains(subLoop, otherLoop);
					})
					.sort(function(a, b) {
						// alpha sort each group to help make sub-groups more apparent
						if (a.join('') < b.join('')) {
							return -1;
						}
						if (a.join('') > b.join('')) {
							return 1;
						}
						return 0;
					})
					.map(function alignToGroupStart(loop) {
						//rotate until the grouped-by module name is up front
						var front = key.split(',')[0];
						return rotateUntil(loop, function(rotated) {
							return rotated[0] === front;
						});
					});
			}
		});

	return groups;
};


var circulars = function() {
	var args = process.argv.slice(3);
	var opts = parseOpts(_opts, args, 0);

	var rjsconfig = parseConfig();
	var fileArgs = opts.argv.remain;
	if (!fileArgs.length) {
		fileArgs = findProjectFiles(rjsconfig);
	}
	var filePool = resolveFileArgs(fileArgs, rjsconfig, opts.recursive);

	var cycles = filePool.map(function(file) {
		return findCircularDependencies(rjsconfig, file);
	});

	cycles = flatten(cycles, 1);
	cycles = unique(cycles);

	if (!cycles.length) {
		return;
	}

	cycles = cycles.map(function shortNames(loop) {
		return loop.map(function(file) {
			return normalize(rjsconfig, file);
		});
	});

	var groups;

	if (!opts.group) {
		// no grouping? still group cycles, but only to sort all cycles by the
		// most common module-in-a-cycle and then sub-sort each cycle to place
		// these common modules up-front (to be more visually apparent)
		groups = values(_groupsOf(cycles, 1));
		groups = flatten(groups, 1); // undo grouping (keeping sort)
		groups = unique(groups); // remove duplicates (still keeping sort, so visually grouped)
		groups.forEach(function(cycle) {
			log.write('.. ' + cycle.join(' -> ') + ' ..\n');
		});
		return;
	}

	// perform requested grouping. store # of cycles per group so we can sort by
	// them later.
	groups = _groupsOf(cycles, opts.group);
	var lengths = map(groups, function(group) {
		return group.length;
	});

	Object.keys(groups)
		.sort(function(a, b) {
			return lengths[b] - lengths[a];
		})
		.forEach(function(key) {
			var group = groups[key];
			log.writeln(lengths[key] + ' cycles: ' + key.split(',').join(' -> ').bold);
			group.forEach(function(cycle) {
				log.writeln('  .. ' + cycle.join(' -> ') + ' ..');
			});
			if (log.opts.verbose) {
				// show cycles *not* in this group
				var subLoop = key.split(',');
				cycles.forEach(function(loop) {
					if (!contains(loop, subLoop)) {
						var loopTxt = ' .. ' + loop.join(' -> ') + ' ..';
						log.writeln('-'.red + loopTxt.cyan);
					}
				});
			}
			log.writeln();
		});

};


module.exports = circulars;
