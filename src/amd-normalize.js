'use strict';


var Q = require('q');
var readline = require('readline');
var stream = require('stream');

var mixin = require('mout/object/mixIn');
var _normalize = require('libamd/modules/normalize');

var commonOpts = require('./util/commonOpts');
var parseOpts = require('./util/parseOpts');
var parseConfig = require('./util/parseConfig');
var resolveFileArgs = require('./util/resolveFileArgs');
var log = require('./util/log');


var _opts = mixin(commonOpts, {});


var normalize = Q.async(function*() {
	var args = process.argv.slice(3);
	var opts = parseOpts(_opts, args, 0);
	var rjsconfig = yield parseConfig();

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
});


module.exports = normalize;
