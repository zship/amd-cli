'use strict';


var Levenshtein = require('levenshtein');

var log = require('./util/log');
var parseOpts = require('./util/parseOpts');
var deplist = require('./amd-tools-deplist');
var normalize = require('./amd-tools-normalize');
var resolve = require('./amd-tools-resolve');
var check = require('./amd-tools-check');
var whatrequires = require('./amd-tools-whatrequires');


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

	switch(task) {
		case 'resolve':
			resolve();
		break;
		case 'normalize':
			normalize();
		break;
		case 'check':
			check();
		break;
		case 'deplist':
			deplist();
		break;
		case 'whatrequires':
			whatrequires();
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
