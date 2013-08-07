'use strict';


var fs = require('fs');
var path = require('path');

var nopt = require('nopt');
var Levenshtein = require('levenshtein');
var getConfigRecursive = require('amd-tools/getConfigRecursive');
var getName = require('amd-tools/modules/getName');
var mixin = require('mout/object/deepMixIn');

var log = require('./log');
var util = require('./util');
var findup = require('./util/findup');
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

	opts = util.parseOpts(opts, args, 0);
	log.opts.verbose = opts.verbose;

	var rjsconfig = {};
	if (opts.config) {
		if (!fs.existsSync(opts.config)) {
			log.error('--config file "' + path.relative(process.cwd(), opts.config) + '" was not found!');
			return;
		}
		rjsconfig = getConfigRecursive({
			mainConfigFile: opts.config
		});
	}

	if (opts['base-url']) {
		rjsconfig.baseUrl = opts['base-url'];
	}

	var dotAmdConfigFile = findup('.amdconfig');
	if (dotAmdConfigFile) {
		opts['entry-point'] = path.dirname(dotAmdConfigFile);
		var dotAmdConfig = getConfigRecursive(dotAmdConfigFile);
		rjsconfig = mixin({}, dotAmdConfig, rjsconfig);
	}

	if (opts['entry-point']) {
		rjsconfig.baseUrl = path.resolve(opts['entry-point'], rjsconfig.baseUrl);
	}

	if (!fs.existsSync(rjsconfig.baseUrl)) {
		log.error('RequireJS baseUrl "' + rjsconfig.baseUrl + '" does not resolve to a real path!');
		return;
	}

	var remain = opts.argv.remain;
	var _process = function(files) {
		return util.processFileArgs(files, rjsconfig, opts.recursive);
	};

	var files;
	switch(task) {
		case 'resolve':
			files = _process(remain);
			log.writeln(files.join('\n'));
		break;
		case 'id':
			files = _process(remain);
			log.writeln(
				files.map(function(file) {
					return getName(file, rjsconfig);
				}).join('\n')
			);
		break;
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
		default:
			log.error('amd-tools: \'' + task + '\' is not an amd-tools command.');
			var suggest = [];
			['resolve', 'id', 'check', 'deplist', 'whatrequires'].forEach(function(cmd) {
				var l = new Levenshtein(task, cmd).distance;
				if (l < 5) {
					suggest.push(cmd);
				}
			});
			if (suggest.length) {
				log.error('\nDid you mean:');
				suggest.forEach(function(sugg) {
					log.error('  ' + sugg);
				});
			}
		break;
	}

};


module.exports = {
	cli: cli
};
