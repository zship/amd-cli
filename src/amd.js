'use strict';


var fs = require('fs');
var path = require('path');
var child = require('child_process');

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
		verbose: {
			type: Boolean,
			shortHand: 'v'
		},
		version: {
			type: Boolean
		}
	};

	opts = parseOpts(opts, args, 0);
	log.opts.verbose = opts.verbose;

	if (opts.version) {
		var pkg = path.resolve(__dirname, '..', 'package.json');
		var json = JSON.parse(fs.readFileSync(pkg, 'utf8'));
		log.writeln(json.name + ' ' + json.version);
		return;
	}

	if (task === 'help') {
		var term = opts.argv.remain[0];
		var manpath = path.join(__dirname, '..', 'man');
		if (term) {
			manpath = path.join(manpath, 'amd-' + term + '.1');
		}
		else {
			manpath = path.join(manpath, 'amd.1');
		}
		var conf = { customFds: [0, 1, 2] };
		var man = child.spawn('man', [manpath], conf);
		man.on('close', function() {});
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
