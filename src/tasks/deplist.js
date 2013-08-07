'use strict';


var path = require('path');

var getDependencies = require('amd-tools/getDependencies');
require('colors');

var log = require('../log');


var deplist = function(files, rjsconfig) {
	files.forEach(function(file) {
		log.verbose.write('\n' + path.relative(process.cwd(), file).cyan + '\n');
		var deps = getDependencies(file, rjsconfig);
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
