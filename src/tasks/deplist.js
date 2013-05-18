'use strict';


var path = require('path');
var nopt = require('nopt');

var log = require('../log');
var getDependencies = require('amd-tools/src/tasks/getDependencies');
var Modules = require('amd-tools/src/util/Modules');


var deplist = function(args) {
	var opts = {
		config: path
	};
	var shortOpts = {
		'c': '--config'
	};

	var filepath = path.resolve(process.cwd(), args[0]);
	var parsed = nopt(opts, shortOpts, args, 1);

	var deps = getDependencies(filepath);
	log.write(deps.length + ' dependencies in ' + filepath + ':\n\n');
	deps.forEach(function(dep) {
		//var resolved = Modules.getFile(dep, path.dirname(filepath), parsed.config);
		log.writeln(dep);
	});
};


module.exports = deplist;
