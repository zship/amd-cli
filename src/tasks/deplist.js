'use strict';


var path = require('path');

var getDependencies = require('amd-tools/tasks/getDependencies');
require('colors');

var log = require('../log');


var deplist = function(files) {
	files.forEach(function(file) {
		log.verbose.write('\n' + path.relative(process.cwd(), file).cyan + '\n');
		var deps = getDependencies(file);
		if (!deps.length) {
			log.verbose.write('(None)\n'.cyan);
		}
		deps.forEach(function(dep) {
			//var resolved = Modules.getFile(dep, path.dirname(filepath), parsed.config);
			log.writeln(dep);
		});
	});
};


module.exports = deplist;
