'use strict';


var Q = require('q');
var path = require('path');

var normalize = require('libamd/modules/normalize');
var resolve = require('libamd/modules/resolve');
var getDependencies = require('libamd/getDependencies');
var unique = require('mout/array/unique');
var contains = require('mout/array/contains');
var mixin = require('mout/object/mixIn');

var commonOpts = require('./util/commonOpts');
var parseOpts = require('./util/parseOpts');
var parseConfig = require('./util/parseConfig');
var resolveFileArgs = require('./util/resolveFileArgs');
var findProjectFiles = require('./util/findProjectFiles');
var log = require('./util/log');


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


var unused = Q.async(function*() {
	var args = process.argv.slice(3);
	var opts = parseOpts(_opts, args, 0);
	var rjsconfig = yield parseConfig();

	var fileArgs = opts.argv.remain;
	if (!fileArgs.length) {
		fileArgs = findProjectFiles(rjsconfig);
	}
	var filePool = resolveFileArgs(fileArgs, rjsconfig, opts.recursive);

	var allDeps = [];

	filePool.forEach(function(file) {
		allDeps = allDeps.concat(
			getDependencies(rjsconfig, file)
				.map(function(dep) {
					return resolve(rjsconfig, path.dirname(file), dep.name);
				})
		);
	});

	allDeps = unique(allDeps);

	var unused = filePool.filter(function(file) {
		return !contains(allDeps, file);
	});

	if (opts.normalize) {
		unused = unused.map(function(file) {
			return normalize(rjsconfig, file);
		});
	}
	else if (!opts.resolve) {
		unused = unused.map(function(file) {
			return path.relative('.', file);
		});
	}

	unused.forEach(function(file) {
		log.writeln(file);
	});

});


module.exports = unused;
