'use strict';


var Q = require('q');
var readline = require('readline');
var stream = require('stream');

var _resolve = require('libamd/modules/resolve');
var mixin = require('mout/object/mixIn');

var commonOpts = require('./util/commonOpts');
var parseOpts = require('./util/parseOpts');
var parseConfig = require('./util/parseConfig');
var resolveFileArgs = require('./util/resolveFileArgs');
var log = require('./util/log');


var _opts = mixin(commonOpts, {});


var resolve = Q.async(function*() {
	var args = process.argv.slice(3);
	var opts = parseOpts(_opts, args, 0);
	var rjsconfig = yield parseConfig();

	if (opts.argv.remain.length) {
		var files = resolveFileArgs(opts.argv.remain, rjsconfig);

		files.forEach(function(file) {
			log.writeln(file);
		});
	}
	else {
		var rl = readline.createInterface({
			input: process.stdin,
			output: new stream()
		});

		rl.on('line', function(line){
			log.writeln(_resolve(rjsconfig, line));
		});
	}
});


module.exports = resolve;
