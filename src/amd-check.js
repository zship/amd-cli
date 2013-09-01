'use strict';


var path = require('path');

var findBrokenDependencies = require('libamd/findBrokenDependencies');
var findCircularDependencies = require('libamd/findCircularDependencies');

var parseOpts = require('./util/parseOpts');
var parseConfig = require('./util/parseConfig');
var resolveFileArgs = require('./util/resolveFileArgs');
var findProjectFiles = require('./util/findProjectFiles');
var log = require('./util/log');
var offsetToLoc = require('./util/offsetToLoc');


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

	var fileArgs = opts.argv.remain;
	if (!fileArgs.length) {
		fileArgs = findProjectFiles(rjsconfig);
	}
	var filePool = resolveFileArgs(fileArgs, rjsconfig, opts.recursive);

	var formatLocation = function(file, dep) {
		var loc = offsetToLoc(file, dep.ast.start);
		return file.magenta + ':' + (loc.line + '').green + ':' + loc.col;
	};

	var hasErrors = false;

	filePool.forEach(function(file) {
		var relative = path.relative('.', file);
		findBrokenDependencies(rjsconfig, file)
			.filter(function(dep) {
				return dep.declared.search(/http(s*):/) === -1;
			})
			.forEach(function(dep) {
				hasErrors = true;
				switch(dep.type) {
					case 'plugin':
						log.writeln(formatLocation(relative, dep) + ': "' + dep.pluginName.yellow + '!' + dep.pluginArgs + '" plugin cannot be resolved');
						break;
					case 'args':
						log.writeln(formatLocation(relative, dep) + ': "' + dep.pluginName + '!' + dep.pluginArgs.yellow + '" cannot load()/load.fromText() with given arguments');
						break;
					case 'shimmed':
						log.writeln(relative + ': shim config dependency "' + dep.declared.yellow + '" cannot be resolved');
						break;
					default:
						log.writeln(formatLocation(relative, dep) + ': dependency "' + dep.declared.yellow + '" cannot be resolved');
						break;
				}
			});
	});

	if (hasErrors) {
		log.warn('Circular dependency check may not complete properly due to broken dependencies!');
	}

	filePool.every(function(file) {
		var cycles = findCircularDependencies(rjsconfig, file);
		if (cycles.length) {
			hasErrors = true;
			log.writeln('Circular dependencies detected. Run "amd circulars" for details.');
			return false;
		}
		return true;
	});

	if (hasErrors) {
		process.exit(2);
	}
};


module.exports = check;
