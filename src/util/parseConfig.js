'use strict';


var fs = require('fs');
var path = require('path');

var getConfigRecursive = require('libamd/getConfigRecursive');
var mixin = require('mout/object/deepMixIn');

var findup = require('./findup');
var parseOpts = require('./parseOpts');
var log = require('./log');


var _opts = {
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
	}
};


var parseConfig = function() {
	var args = process.argv.slice(3);
	var opts = parseOpts(_opts, args, 0);

	var rjsconfig = {};

	if (opts.config) {
		if (!fs.existsSync(opts.config)) {
			throw new Error('--config file "' + path.relative(process.cwd(), opts.config) + '" was not found!');
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

	opts['entry-point'] = opts['entry-point'] || process.cwd();
	rjsconfig.baseUrl = path.resolve(opts['entry-point'], rjsconfig.baseUrl.replace(/^\//, ''));

	if (!fs.existsSync(rjsconfig.baseUrl)) {
		log.warn('RequireJS baseUrl "' + rjsconfig.baseUrl + '" does not resolve to a real path! Using current working directory, but this may not be intended.');
		rjsconfig.baseUrl = process.cwd();
	}

	log.verbose.writeln('Entry point: ' + opts['entry-point']);
	log.verbose.writeln('RequireJS configuration:');
	log.verbose.write(JSON.stringify(rjsconfig, false, 4) + '\n\n');

	return rjsconfig;
};


module.exports = parseConfig;
