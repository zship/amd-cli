'use strict';


var Levenshtein = require('levenshtein');
var normalize = require('libamd/modules/normalize');

var findProjectFiles = require('./findProjectFiles');


var suggest = function(rjsconfig, name) {
	var iexact;
	var candidates = [];
	findProjectFiles(rjsconfig).every(function(file) {
		var normalized = normalize(rjsconfig, file);

		if (file.toLowerCase() === normalized.toLowerCase()) {
			iexact = normalized;
			return false;
		}

		var l = new Levenshtein(name.toLowerCase(), normalized.toLowerCase()).distance;
		candidates.push({
			mod: normalized,
			distance: l
		});
		return true;
	});

	if (iexact) {
		return [iexact];
	}

	return candidates
		.filter(function(file) {
			return file.distance <= 5;
		})
		.sort(function(a, b) {
			return a.distance - b.distance;
		})
		.map(function(file) {
			return file.mod;
		});

};


module.exports = suggest;
