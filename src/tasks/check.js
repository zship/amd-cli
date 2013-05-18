'use strict';


var findBrokenDependencies = require('amd-tools/src/tasks/findBrokenDependencies');


var check = function(args) {
	var opts = {
		config: path
	};
	var shortOpts = {
		'c': '--config'
	};

	var parsed = nopt(opts, shortOpts, args, 0);
	var rest = parsed.argv.remain;
	var filePool = glob.sync(rest[0]);

	var rjsconfig = parsed.config

	findBrokenDependencies(filePool, )
};
