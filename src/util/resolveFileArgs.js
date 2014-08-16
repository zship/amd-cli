'use strict';


var fs = require('fs');
var path = require('path');

var glob = require('glob');
var isArray = require('mout/lang/isArray');
var compact = require('mout/array/compact');
var unique = require('mout/array/unique');
var difference = require('mout/array/difference');
var getDependencyGraph = require('libamd/getDependencyGraph');
var dfs = require('libamd/graphs/dfs');
var resolve = require('libamd/modules/resolve');
require('colors');

var log = require('./log');
var suggest = require('./suggest');


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
			return false; // nonexistent file (likely a module ID)
		}
	});

	dirs.forEach(function(dir) {
		var absdir = path.resolve(dir);
		log.verbose.writeln('Expanding directory "' + dir + '" to "' + absdir + '/**/*.js"');
		files = files.concat(glob.sync(absdir + '/**/*.js'));
	});

	files = difference(files, dirs);
	files = unique(files);

	files = files.map(function(file) {
		if (fs.existsSync(file)) {
			return path.resolve(file);
		}
		var resolved = resolve(rjsconfig, process.cwd(), file);
		if (!resolved || !fs.existsSync(resolved)) {
			log.warn('"' + file + '" could not be resolved.');
			var suggestions = suggest(rjsconfig, file);
			if (suggestions.length) {
				log.warn('Did you mean:');
				suggestions.forEach(function(name) {
					log.warn('  ' + name);
				});
			}
		}
		return resolved;
	});

	if (recursive) {
		var flattened = [];

		files.forEach(function(file) {
			var graph = getDependencyGraph(rjsconfig, file);
			dfs(graph, function(node) {
				flattened.push(node.file);
			});
		});

		files = unique(flattened);
	}

	files = compact(files).filter(function(f) {
		return (f.search(/\?\?/g) === -1);
	});

	if (!files.length) {
		log.error('Invalid files or module IDs were passed!');
		process.exit(1);
	}

	if (log.opts.verbose) {
		log.verbose.writeln('Expanded Files:');
		files.forEach(function(file) {
			log.verbose.writeln(path.relative(process.cwd(), file));
		});
		log.verbose.write('\n');
	}

	return files.map(function(file) {
		return path.resolve(file);
	});
};


module.exports = resolveFileArgs;
