'use strict';


var fs = require('fs');
var path = require('path');

var glob = require('glob');
var isArray = require('mout/lang/isArray');
var unique = require('mout/array/unique');
var difference = require('mout/array/difference');
var getDependencyGraph = require('amd-tools/getDependencyGraph');
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
		return fs.statSync(file).isDirectory();
	});

	dirs.forEach(function(dir) {
		var absdir = path.resolve(dir);
		log.verbose.writeln('Expanding directory "' + dir + '" to "' + absdir + '/**/*.js"');
		Array.prototype.push.apply(files, glob.sync(absdir + '/**/*.js'));
	});

	files = difference(files, dirs);
	files = unique(files);

	files = files.map(function(file) {
		if (fs.existsSync(file)) {
			// relative file paths without a leading '.' will be interpreted as
			// module IDs by resolve(), so deal with them first
			return path.resolve(file);
		}
		var resolved = resolve(file, process.cwd(), rjsconfig);
		if (!resolved || !fs.existsSync(resolved)) {
			log.warn('"' + file + '" could not be resolved.');
		}
		return resolved;
	});

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
