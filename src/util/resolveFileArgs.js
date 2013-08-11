'use strict';


var fs = require('fs');
var path = require('path');

var glob = require('glob');
var isArray = require('mout/lang/isArray');
var compact = require('mout/array/compact');
var unique = require('mout/array/unique');
var difference = require('mout/array/difference');
var getDependencyGraph = require('amd-tools/getDependencyGraph');
var dfs = require('amd-tools/graphs/dfs');
var resolve = require('amd-tools/modules/resolve');
require('colors');

var log = require('./log');


//files may be either file paths or module ids.  turn module ids into file
//paths. if recursive is `true`, expand each module's full dependency graph
//and add into the list.
var resolveFileArgs = function(files, rjsconfig, recursive) {
	if (!isArray(files)) {
		files = [files];
	}

	var dirs = files.filter(function (file) {
		try {
			return fs.statSync(file).isDirectory();
		}
		catch (e) {
			return false; // non-existant file (likely a module ID)
		}
	});

	dirs.forEach(function(dir) {
		var absdir = path.resolve(dir);
		log.verbose.writeln('Expanding directory "' + dir + '" to "' + absdir + '/**/*.js"');
		Array.prototype.push.apply(files, glob.sync(absdir + '/**/*.js'));
	});

	files = difference(files, dirs);
	files = unique(files);

	files = files.map(function(file) {
		var resolved = resolve(file, process.cwd(), rjsconfig);
		if (!resolved || !fs.existsSync(resolved)) {
			log.warn('"' + file + '" could not be resolved.');
		}
		return resolved;
	});

	if (recursive) {
		var flattened = [];

		files.forEach(function(file) {
			var graph = getDependencyGraph(file, rjsconfig);
			dfs(graph, function(node) {
				flattened.push(node.file);
			});
		});

		files = unique(flattened);
	}

	files = compact(files);

	if (log.opts.verbose) {
		log.verbose.writeln('Expanded Files:');
		files.forEach(function(file) {
			log.verbose.writeln(path.relative(process.cwd(), file));
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


module.exports = resolveFileArgs;
