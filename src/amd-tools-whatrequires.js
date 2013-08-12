'use strict';


var path = require('path');

var resolve = require('amd-tools/modules/resolve');
var getDependencies = require('amd-tools/getDependencies');

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


var whatrequires = function() {
	var args = process.argv.slice(3);
	var opts = parseOpts(_opts, args, 0);

	var remain = opts.argv.remain;
	var rjsconfig = parseConfig();

	var needle = resolve(rjsconfig, process.cwd(), remain[0]);
	var haystack = resolveFileArgs(remain.slice(1), rjsconfig, opts.recursive);

	var matches = haystack.filter(function(file) {
		file = path.resolve(file);

		var deps = getDependencies(file).map(function(dep) {
			return resolve(rjsconfig, path.dirname(file), dep);
		});

		return deps.some(function(dep) {
			//take case-insensitive filesystems like HFS+ into account
			return dep && dep.toLowerCase() === needle.toLowerCase();
		});
	});

	matches.forEach(function(file) {
		log.writeln(path.relative(process.cwd(), file));
	});
};


module.exports = whatrequires;
