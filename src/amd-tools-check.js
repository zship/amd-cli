'use strict';


var path = require('path');

var flatten = require('mout/array/flatten');
var findBrokenDependencies = require('amd-tools/findBrokenDependencies');
var findCircularDependencies = require('amd-tools/findCircularDependencies');
var normalize = require('amd-tools/modules/normalize');
var unique = require('amd-tools/cycles/unique');

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


var check = function() {
	var args = process.argv.slice(3);
	var opts = parseOpts(_opts, args, 0);
	var rjsconfig = parseConfig();
	var filePool = resolveFileArgs(opts.argv.remain, rjsconfig, opts.recursive);

	log.verbose.writeln('RequireJS configuration:');
	log.verbose.write(JSON.stringify(rjsconfig, false, 4) + '\n\n');

	var formatLocation = function(dep) {
		return dep.ast.loc.start.line + ':' + dep.ast.loc.start.column;
	};

	var hasBrokenDep = false;

	filePool.forEach(function(file) {
		var relative = path.relative(process.cwd(), file);
		findBrokenDependencies(file, rjsconfig)
			.filter(function(dep) {
				return dep.declared.search(/http(s*):/) === -1;
			})
			.forEach(function(dep) {
				hasBrokenDep = true;
				switch(dep.type) {
					case 'plugin':
						log.writeln(relative + ':' + formatLocation(dep) + ': "' + dep.pluginName.yellow + '!' + dep.pluginArgs + '" plugin cannot be resolved');
						break;
					case 'args':
						log.writeln(relative + ':' + formatLocation(dep) + ': "' + dep.pluginName + '!' + dep.pluginArgs.yellow + '" cannot load()/load.fromText() with given arguments');
						break;
					case 'shimmed':
						log.writeln(relative + ': shim config dependency "' + dep.declared + '" cannot be resolved');
						break;
					default:
						log.writeln(relative + ':' + formatLocation(dep) + ': dependency "' + dep.declared + '" cannot be resolved');
						break;
				}
			});
	});

	if (hasBrokenDep) {
		log.warn('Circular dependency check may not complete properly due to broken dependencies!');
	}

	var cycles = filePool.map(function(file) {
		return findCircularDependencies(file, rjsconfig);
	});
	cycles = flatten(cycles, 1);
	cycles = unique(cycles);
	cycles.forEach(function(cycle) {
		var formatted = cycle.map(function(file) {
			return normalize(rjsconfig, file);
		}).join(' -> ');
		log.writeln('Circular dependency: [' + formatted + ']');
	});
};


module.exports = check;
