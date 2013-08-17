'use strict';


var path = require('path');

var normalize = require('libamd/modules/normalize');
var resolve = require('libamd/modules/resolve');
var getDependencies = require('libamd/getDependencies');
require('colors');

var parseOpts = require('./util/parseOpts');
var parseConfig = require('./util/parseConfig');
var resolveFileArgs = require('./util/resolveFileArgs');
var log = require('./util/log');


var _opts = {
	'normalize': {
		type: Boolean,
		description: 'Convert verbatim dependencies into unique module IDs'
	},
	'resolve': {
		type: Boolean,
		description: 'Convert verbatim dependencies into resolved file paths'
	}
};


var amddeps = function() {
	var args = process.argv.slice(3);
	var opts = parseOpts(_opts, args, 0);
	var rjsconfig = parseConfig();
	var files = resolveFileArgs(opts.argv.remain, rjsconfig);

	files.forEach(function(file) {
		log.verbose.write('\n' + path.relative(process.cwd(), file) + '\n');
		var deps = getDependencies(rjsconfig, file);
		if (!deps.length) {
			log.verbose.write('(None)\n');
		}
		if (opts.resolve) {
			deps = deps.map(function(dep) {
				return resolve(rjsconfig, path.dirname(file), dep);
			});
		}
		else if (opts.normalize) {
			deps = deps.map(function(dep) {
				return normalize(rjsconfig, path.dirname(file), dep);
			});
		}
		deps.forEach(function(dep) {
			log.writeln(dep);
		});
	});
};


module.exports = amddeps;
