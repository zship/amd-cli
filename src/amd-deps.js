'use strict';


var Q = require('q');
var path = require('path');

var normalize = require('libamd/modules/normalize');
var resolve = require('libamd/modules/resolve');
var getDependencies = require('libamd/getDependencies');
var mixin = require('mout/object/mixIn');
require('colors');

var commonOpts = require('./util/commonOpts');
var parseOpts = require('./util/parseOpts');
var parseConfig = require('./util/parseConfig');
var resolveFileArgs = require('./util/resolveFileArgs');
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
	}
});


var amddeps = Q.async(function*() {
	var args = process.argv.slice(3);
	var opts = parseOpts(_opts, args, 0);
	var rjsconfig = yield parseConfig();
	var files = resolveFileArgs(opts.argv.remain, rjsconfig);

	files.forEach(function(file) {
		var relative = path.relative('.', file);
		log.verbose.write(relative + '\n');
		var deps = getDependencies(rjsconfig, file);
		if (!deps.length) {
			log.verbose.write('(None)\n');
		}
		if (opts.resolve) {
			deps = deps.map(function(dep) {
				dep.name = resolve(rjsconfig, path.dirname(file), dep.name);
				return dep;
			});
		}
		else if (opts.normalize) {
			deps = deps.map(function(dep) {
				dep.name = normalize(rjsconfig, path.dirname(file), dep.name);
				return dep;
			});
		}
		deps.forEach(function(dep) {
			if (opts.location) {
				var loc = offsetToLoc(file, dep.start);
				log.writeln(relative.magenta + ':' + (loc.line+'').green + ':' + loc.col + ': ' + dep.name);
				return;
			}
			log.writeln(dep.name);
		});
	});
});


module.exports = amddeps;
