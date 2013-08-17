'use strict';


var path = require('path');

var resolve = require('libamd/modules/resolve');
var getDependencies = require('libamd/getDependencies');

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
	}
};


var whatrequires = function() {
	var args = process.argv.slice(3);
	var opts = parseOpts(_opts, args, 0);

	var remain = opts.argv.remain;
	var rjsconfig = parseConfig();

	var needle = resolve(rjsconfig, process.cwd(), remain[0]);
	var haystackArg = remain.slice(1);
	if (!haystackArg.length) {
		haystackArg = findProjectFiles(rjsconfig);
	}
	var haystack = resolveFileArgs(haystackArg, rjsconfig, opts.recursive);

	var matches = haystack.filter(function(file) {
		file = path.resolve(file);

		var deps = getDependencies(rjsconfig, file).map(function(dep) {
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
