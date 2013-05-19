'use strict';


var path = require('path');
var nopt = require('nopt');

var log = require('./log');
var deplist = require('./tasks/deplist');
var check = require('./tasks/check');

var loadConfig = require('amd-tools/src/util/loadConfig');


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
	var filePool = rest.map(function(file) {
		return path.resolve(process.cwd(), file);
	});

	var rjsconfig = loadConfig({
		mainConfigFile: parsed.config
	});

	check(filePool, rjsconfig);
};


var _deplist = function(args) {
	var parsed = nopt({}, {}, args, 0);
	var rest = parsed.argv.remain;
	var file = path.resolve(process.cwd(), rest[0]);
	deplist(file);
};


var cli = function() {

	var task = process.argv[2];
	var args = process.argv.slice(3);

	var opts = {
		verbose: Boolean
	};

	var parsed = nopt(opts, args, 0);
	log.opts.verbose = parsed.verbose;

	switch(task) {
		case 'check':
			_check(args);
		break;
		case 'deplist':
			_deplist(args);
		break;
	}

};


module.exports = {
	cli: cli
};
