'use strict';


var Q = require('q');
var path = require('path');

var normalize = require('libamd/modules/normalize');
var resolve = require('libamd/modules/resolve');
var getDependencies = require('libamd/getDependencies');
var mixin = require('mout/object/mixIn');

var commonOpts = require('./util/commonOpts');
var parseOpts = require('./util/parseOpts');
var parseConfig = require('./util/parseConfig');
var resolveFileArgs = require('./util/resolveFileArgs');
var findProjectFiles = require('./util/findProjectFiles');
var log = require('./util/log');
var offsetToLoc = require('./util/offsetToLoc');


var _opts = mixin(commonOpts, {
	'location': {
		type: Boolean,
		shortHand: 'l',
		description: 'Show line:column numbers where each dependency was declared'
	},
	'normalize': {
		type: Boolean,
		description: 'Convert verbatim dependencies into unique module IDs'
	},
	'resolve': {
		type: Boolean,
		description: 'Convert verbatim dependencies into resolved file paths'
	},
	'recursive': {
		type: Boolean,
		shortHand: 'R',
		description: 'Recurse into the full dependency graph of each passed <module>, adding each dependency into the <module> list'
	}
});


var whatrequires = Q.async(function*() {
	var args = process.argv.slice(3);
	var opts = parseOpts(_opts, args, 0);
	var rjsconfig = yield parseConfig();
	var remain = opts.argv.remain;

	var needle = resolveFileArgs(remain[0], rjsconfig)[0];
	var haystackArg = remain.slice(1);
	if (!haystackArg.length) {
		haystackArg = findProjectFiles(rjsconfig);
	}
	var haystack = resolveFileArgs(haystackArg, rjsconfig, opts.recursive);

	var matches = [];

	haystack.forEach(function(file) {
		matches = matches.concat(
			getDependencies(rjsconfig, file)
				.map(function(dep) {
					return mixin({}, dep, {
						resolved: resolve(rjsconfig, path.dirname(file), dep.name),
						parent: file,
						parentAbs: file
					});
				})
				.filter(function(dep) {
					//take case-insensitive filesystems like HFS+ into account
					return dep.resolved && dep.resolved.toLowerCase() === needle.toLowerCase();
				})
		);
	});

	if (opts.normalize) {
		matches.forEach(function(dep) {
			dep.parent = normalize(rjsconfig, dep.parent);
		});
	}
	else if (!opts.resolve) {
		matches.forEach(function(dep) {
			dep.parent = path.relative('.', dep.parent);
		});
	}

	matches.forEach(function(dep) {
		if (opts.location) {
			var loc = offsetToLoc(dep.parentAbs, dep.start);
			log.writeln(dep.parent.magenta + ':' + (loc.line+'').green + ':' + loc.col + ': as "' + dep.name + '"');
			return;
		}
		log.writeln(dep.parent);
	});
});


module.exports = whatrequires;
