'use strict';


var log = require('../log');
var getDependencies = require('amd-tools/src/tasks/getDependencies');


var deplist = function(file) {
	var deps = getDependencies(file);
	log.write(deps.length + ' dependencies in ' + file + ':\n\n');
	deps.forEach(function(dep) {
		//var resolved = Modules.getFile(dep, path.dirname(filepath), parsed.config);
		log.writeln(dep);
	});
};


module.exports = deplist;
