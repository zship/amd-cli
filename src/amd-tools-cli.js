'use strict';


var fs = require('fs');
var path = require('path');

var nopt = require('nopt');
var unique = require('mout/array/unique');
var loadConfig = require('amd-tools/util/loadConfig');
var getDependencyGraph = require('amd-tools/tasks/getDependencyGraph');
var Modules = require('amd-tools/util/Modules');

var log = require('./log');
var util = require('./util');
var deplist = require('./tasks/deplist');
var check = require('./tasks/check');
var whatrequires = require('./tasks/whatrequires');



var _check = function(args) {
	var opts = {
		baseUrl: path,
		config: path
	};

	var shortOpts = {
		'c': '--config',
		'b': '--baseUrl'
	};

	var parsed = nopt(opts, shortOpts, args, 0);
	var rest = parsed.argv.remain;

	if (!rest.length) {
		throw 'err';
	}

	var filePool = rest.map(function(file) {
		return path.resolve(process.cwd(), file);
	});


	check(filePool, rjsconfig);
};


var _deplist = function(args) {
	var parsed = nopt({}, {}, args, 0);
	var rest = parsed.argv.remain;
	var file = util.fileOrModuleId(rest[0]);
	deplist(file);
};


var cli = function() {

	var task = process.argv[2];
	var args = process.argv.slice(3);

	var opts = {
		verbose: {
			type: Boolean,
			shortHand: 'v'
		},
		config: {
			type: path,
			shortHand: 'c'
		},
		'base-url': {
			type: path,
			shortHand: 'b'
		},
		'entry-point': {
			type: path,
			shortHand: 'e'
		},
		'recursive': {
			type: Boolean,
			shortHand: 'R',
			description: 'Recurse into the full dependency graph of each passed <module>, adding each dependency into the <module> list'
		}
	};

	var parsed = util.parseOpts(opts, args, 0);
	log.opts.verbose = parsed.verbose;

	var rjsconfig;
	if (parsed.config) {
		if (!fs.existsSync(parsed.config)) {
			log.error('--config file "' + path.relative(process.cwd(), parsed.config) + '" was not found!');
			return;
		}
		rjsconfig = loadConfig({
			mainConfigFile: parsed.config
		});
	}
	else {
		rjsconfig = {
			baseUrl: parsed['base-url']
		};
	}

	if (!parsed['entry-point']) {
		parsed['entry-point'] = process.cwd();
	}

	rjsconfig.baseUrl = path.resolve(parsed['entry-point'], rjsconfig.baseUrl);
	if (!fs.existsSync(rjsconfig.baseUrl)) {
		log.error('RequireJS baseUrl (prefixed with --entry-point, if passed) does not resolve to a real path!');
		log.error('tried: ' + rjsconfig.baseUrl);
		return;
	}

	var remain = parsed.argv.remain;
	var _process = function(files) {
		return util.processFileArgs(files, rjsconfig, parsed.recursive);
	};

	var files;
	switch(task) {
		case 'check':
			files = _process(remain);
			check(files, rjsconfig);
		break;
		case 'deplist':
			files = _process(remain);
			deplist(files, rjsconfig);
		break;
		case 'whatrequires':
			var needle = util.processFileArgs(remain[0], rjsconfig, false)[0];
			var haystack = _process(remain.slice(1));
			whatrequires(needle, haystack, rjsconfig);
		break;
	}

};


module.exports = {
	cli: cli
};
