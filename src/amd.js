'use strict';


var fs = require('fs');
var path = require('path');

var nopt = require('nopt');
var glob = require('glob');
var Levenshtein = require('levenshtein');

var log = require('./util/log');
var parseOpts = require('./util/parseOpts');


nopt.invalidHandler = function(key, val, types) {
	process.stderr.write('amd: invalid value "' + val + '" for option "--' + key + '"\n');
};


var scripts = {};
glob.sync(__dirname + '/**/amd-*.js').forEach(function(file) {
	var name = file.replace(/.*\/amd\-(\S*)\.js/, '$1');
	scripts[name] = file;
});


var cli = function() {

	var task = process.argv[2];
	var args = process.argv.slice(2);

	var opts = {
		color: {
			type: Boolean
		},
		verbose: {
			type: Boolean,
			shortHand: 'v'
		},
		version: {
			type: Boolean
		}
	};

	args.unshift('--color');
	opts = parseOpts(opts, args, 0);
	log.opts.verbose = opts.verbose;
	log.opts['no-color'] = !opts.color;
	log.initColors();

	if (opts.version) {
		var pkg = path.resolve(__dirname, '..', 'package.json');
		var json = JSON.parse(fs.readFileSync(pkg, 'utf8'));
		log.writeln(json.name + ' ' + json.version);
		return;
	}

	if (Object.keys(scripts).indexOf(task) === -1) {
		log.error('amd: \'' + task + '\' is not an amd command.');
		var suggest = [];
		Object.keys(scripts).forEach(function(cmd) {
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
		return;
	}

	require(scripts[task])();

};


module.exports = {
	cli: cli
};
