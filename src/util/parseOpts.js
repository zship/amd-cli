'use strict';


var nopt = require('nopt');
var forOwn = require('mout/object/forOwn');
var toArray = require('mout/lang/toArray');


var parseOpts = function(opts) {
	var knownOpts = {};
	var shortHands = {};

	forOwn(opts, function(obj, key) {
		knownOpts[key] = obj.type;
		if (obj.shortHand) {
			shortHands[obj.shortHand] = '--' + key;
		}
	});

	var args = toArray(arguments);
	args.shift();
	args = [knownOpts, shortHands].concat(args);
	return nopt.apply(undefined, args);
};


module.exports = parseOpts;
