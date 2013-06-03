'use strict';


var fs = require('fs');
var path = require('path');

var nopt = require('nopt');
var forOwn = require('mout/object/forOwn');
var isArray = require('mout/lang/isArray');
var toArray = require('mout/lang/toArray');
var unique = require('mout/array/unique');
var getDependencyGraph = require('amd-tools/tasks/getDependencyGraph');
var Modules = require('amd-tools/util/Modules');
require('colors');

var log = require('./log');


var util = {};


util.parseOpts = function(opts) {
	var knownOpts = {};
	var shortHands = {};

	forOwn(opts, function(obj, key) {
		knownOpts[key] = obj.type;
		if (obj.shortHand) {
			shortHands[obj.shortHand] = '--' + key;
		}
	});

	var args = toArray(arguments);
	args.shift();
	args = [knownOpts, shortHands].concat(args);
	return nopt.apply(undefined, args);
};


util.fileOrModuleId = function(file, rjsconfig) {
	if (fs.existsSync(file)) {
		return file;
	}
	var resolved = Modules.getFile(file, process.cwd(), rjsconfig);
	if (!resolved) {
		log.warn('Module ID "' + file + '" could not be resolved.');
	}
	return resolved;
};


//files may be either file paths or module ids.  turn module ids into file
//paths. if recursive is `true`, expand each module's full dependency graph
//and add into the list.
util.processFileArgs = function(files, rjsconfig, recursive) {
	if (!isArray(files)) {
		files = [files];
	}

	//hueristic: folks probably won't type more than 10 module ids, so assume
	//they're (shell-expanded) file paths if so
	if (files.length < 10) {
		files = files.map(function(file) {
			return util.fileOrModuleId(file, rjsconfig);
		});
	}

	if (recursive) {
		var flattened = [];
		var _flattenGraph = function(node) {
			flattened.push(node.file);
			node.deps.forEach(function(child) {
				_flattenGraph(child);
			});
		};

		files.forEach(function(file) {
			_flattenGraph(getDependencyGraph(file, rjsconfig));
		});

		files = unique(flattened);
	}

	files = files.filter(function(file) {
		return !!file;
	});

	if (log.opts.verbose) {
		log.verbose.writeln('Expanded Files:'.cyan);
		files.forEach(function(file) {
			log.verbose.writeln(path.relative(process.cwd(), file).cyan);
		});
		log.verbose.write('\n');
	}

	if (!files.length) {
		log.error('Invalid files or module IDs were passed!');
		process.exit(1);
	}

	return files.map(function(file) {
		return path.resolve(file);
	});
};


module.exports = util;
