'use strict';


var fs = require('fs');
var path = require('path');


// Search for a filename in the given directory or all parent directories.
var findup = function(filename, dir) {
	dir = dir || process.cwd();

	var filepath = path.join(dir, filename);
	if (fs.existsSync(filepath)) {
		return filepath;
	}

	var parent = path.resolve(dir, '..');
	if (parent === dir) {
		return;
	}

	return findup(filename, parent);
};


module.exports = findup;
