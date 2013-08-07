'use strict';


var path = require('path');

var getFile = require('amd-tools/modules/getFile');
var getDependencies = require('amd-tools/getDependencies');

var log = require('../log');


var whatrequires = function(needle, haystack, rjsconfig) {
	var matches = haystack.filter(function(file) {
		file = path.resolve(file);

		var deps = getDependencies(file).map(function(dep) {
			return getFile(dep, path.dirname(file), rjsconfig);
		});

		return deps.some(function(dep) {
			//take case-insensitive filesystems like HFS+ into account
			return dep && dep.toLowerCase() === needle.toLowerCase();
		});
	});

	matches.forEach(function(file) {
		log.writeln(path.relative(process.cwd(), file));
	});
};


module.exports = whatrequires;
