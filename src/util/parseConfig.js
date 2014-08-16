'use strict';


var Q = require('q');
var fs = require('fs');
var path = require('path');
var child = require('child_process');

var getConfigRecursive = require('libamd/getConfigRecursive');
var mixin = require('mout/object/deepMixIn');
var escapeRegExp = require('mout/string/escapeRegExp');

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


var _projectRoot = function() {
	var root =
		findup('Gruntfile.js') ||
		findup('gulpfile.js') ||
		findup('package.json') ||
		findup('bower.json') ||
		findup('component.json') ||
		findup('.git') ||
		findup('.hg') ||
		findup('Makefile') ||
		findup('README.md') ||
		findup('README');
	return path.resolve(root, '..');
};


var exec = function() {
	var args = Array.prototype.slice.call(arguments);
	return Q.nfapply(child.exec, args).then(function(result) {
		return result[0];
	});
};


var _guessConfig = Q.async(function*() {
	var root = _projectRoot();
	var files = '';

	// find a file that looks like a RequireJS config file
	var isGit = findup('.gitignore');
	if (isGit) {
		// we can use .gitignore rules to exclude tmp and dependency directories
		files = yield exec('/bin/bash -c \'comm -23 <(grep -Rl "require.config(" . | sort) <(grep -Rl "require.config(" . | git check-ignore --stdin | sort)\'', {
			cwd: root,
			maxBuffer: 1000000
		});
	}
	else {
		files = yield exec('grep -Rl "^require.config(" . | grep -v "node_modules" | grep -v "bower_components"', {
			cwd: root,
			maxBuffer: 1000000
		});
	}

	if (!files.length) {
		return {};
	}

	// shortest file path is probably most likely to be the user's (rather than
	// something in node_modules or bower_components)
	files = files.trim().split('\n').sort(function(a, b) {
		return a.length - b.length;
	});

	var f = files[0];

	if (!f) {
		return {};
	}

	log.verbose.writeln('Guessed --config: ' + f);

	if (files.length > 1) {
		log.verbose.writeln('\tOther candidates were:');
		files.forEach(function(name) {
			log.verbose.writeln('\t' + name);
		});
	}

	var config = getConfigRecursive({
		mainConfigFile: f
	});

	// get baseUrl from the config, then determine --entry-point by finding a
	// directory somewhere in the absolute path to the config file that matches
	// baseUrl
	var baseUrlMatcher = new RegExp('\\/' + escapeRegExp(config.baseUrl) + '\\/.*', 'g');
	var abspath = path.resolve(root, f) + '/';
	var entryPoint = abspath.replace(baseUrlMatcher, '');

	log.verbose.writeln('Guessed --entry-point: ' + entryPoint);

	// make baseUrl absolute
	config.baseUrl = path.resolve(entryPoint, config.baseUrl.replace(/^\//, ''));
	return config;
});


var parseConfig = Q.async(function*() {
	var args = process.argv.slice(3);
	var opts = parseOpts(_opts, args, 0);

	var rjsconfig = {};
	var dotAmdConfigFile = findup('.amdconfig');

	if (!opts.config && !opts['base-url'] && !opts['entry-point'] && !dotAmdConfigFile) {
		log.verbose.writeln('No --config, --base-url, or --entry-point given and no .amdconfig file found.');
		log.verbose.writeln('Attempting to guess this repository\'s RequireJS config...');

		rjsconfig = yield _guessConfig();
	}
	else {
		var configs = [];

		if (dotAmdConfigFile) {
			opts['entry-point'] = path.dirname(dotAmdConfigFile);
			var dotAmdConfig = getConfigRecursive(dotAmdConfigFile);
			configs.push(dotAmdConfig);
		}

		if (opts.config) {
			if (!fs.existsSync(opts.config)) {
				throw new Error('--config file "' + path.relative(process.cwd(), opts.config) + '" was not found!');
			}
			var config = getConfigRecursive({
				mainConfigFile: opts.config
			});
			configs.push(config);
		}

		if (opts['base-url']) {
			configs.push({
				baseUrl: opts['base-url']
			});
		}

		rjsconfig = mixin.apply(this, configs);

		opts['entry-point'] = opts['entry-point'] || process.cwd();
		log.verbose.writeln('Entry point: ' + opts['entry-point']);

		rjsconfig.baseUrl = path.resolve(opts['entry-point'], rjsconfig.baseUrl.replace(/^\//, ''));

		if (!fs.existsSync(rjsconfig.baseUrl)) {
			log.error('RequireJS baseUrl "' + rjsconfig.baseUrl + '" does not resolve to a real path! This is required.');
		}
	}

	log.verbose.writeln('RequireJS configuration:');
	log.verbose.write(JSON.stringify(rjsconfig, false, 4) + '\n\n');

	return rjsconfig;
});


module.exports = parseConfig;
