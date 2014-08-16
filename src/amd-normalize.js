'use strict';


var readline = require('readline');
var stream = require('stream');

var _normalize = require('libamd/modules/normalize');

var parseOpts = require('./util/parseOpts');
var parseConfig = require('./util/parseConfig');
var resolveFileArgs = require('./util/resolveFileArgs');
var log = require('./util/log');


var _opts = {};


var normalize = function() {
	var args = process.argv.slice(3);
	var opts = parseOpts(_opts, args, 0);
	var rjsconfig = parseConfig();

	if (opts.argv.remain.length) {
		var files = resolveFileArgs(opts.argv.remain, rjsconfig);

		files.forEach(function(file) {
			log.writeln(_normalize(rjsconfig, file));
		});
	}
	else {
		var rl = readline.createInterface({
			input: process.stdin,
			output: new stream()
		});

		rl.on('line', function(line){
			log.writeln(_normalize(rjsconfig, line));
		});
	}
};


module.exports = normalize;
