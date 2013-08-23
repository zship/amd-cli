'use strict';


var fs = require('fs');
var path = require('path');


var memo = {};
var _lineBreaks = function(file) {
	file = path.resolve(file);
	if (memo[file]) {
		return memo[file];
	}

	var contents = fs.readFileSync(file, 'utf8');
	var ret = [];
	for (var i = 0; i < contents.length; i++) {
		if (contents.charAt(i) === '\n') {
			ret.push(i);
		}
	}
	memo[file] = ret;
	return ret;
};


var offsetToLoc = function(file, offset) {
	var breaks = _lineBreaks(file);
	for (var i = 0; i < breaks.length; i++) {
		if (offset < breaks[i]) {
			return {
				line: i + 1,
				col: offset - (i > 0 ? breaks[i-1] : 0)
			};
		}
	}
};


module.exports = offsetToLoc;
