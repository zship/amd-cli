'use strict';


var path = require('path');
var child = require('child_process');

var glob = require('glob');
var Levenshtein = require('levenshtein');

var log = require('./util/log');
var parseOpts = require('./util/parseOpts');


var scripts = {};
glob.sync(__dirname + '/**/amdtools-*.js').forEach(function(file) {
	var name = file.replace(/.*\/amdtools\-(\S*)\.js/, '$1');
	scripts[name] = file;
});


var cli = function() {

	var task = process.argv[2];
	var args = process.argv.slice(3);

	var opts = {
		verbose: {
			type: Boolean,
			shortHand: 'v'
		}
	};

	opts = parseOpts(opts, args, 0);
	log.opts.verbose = opts.verbose;

	if (task === 'help') {
		var term = opts.argv.remain[0];
		var manpath = path.join(__dirname, '..', 'man');
		if (term) {
			manpath = path.join(manpath, 'amdtools-' + term + '.1');
		}
		else {
			manpath = path.join(manpath, 'amdtools.1');
		}
		var conf = { customFds: [0, 1, 2] };
		var man = child.spawn('man', [manpath], conf);
		man.on('close', function() {});
	}

	if (Object.keys(scripts).indexOf(task) === -1) {
		log.error('amdtools: \'' + task + '\' is not an amdtools command.');
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
