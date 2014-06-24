'use strict';


var path = require('path');

var glob = require('glob');
var compact = require('mout/array/compact');
var flatten = require('mout/array/flatten');
var difference = require('mout/array/difference');
var resolve = require('libamd/modules/resolve');
var getDependencyGraph = require('libamd/getDependencyGraph');
var linearize = require('libamd/graphs/linearize');


var _expand = function(rjsconfig, files) {
	//departure from RequireJS: allow node-glob-compatible globbing
	return files.map(function(file) {
		var globStart = file.indexOf('*');
		if (globStart !== -1) {
			var resolved = path.resolve(rjsconfig.baseUrl, file.slice(0, globStart));
			return glob.sync(resolved + '/' + file.slice(globStart));
		}
		return resolve(rjsconfig, file);
	});
};


var findProjectFiles = function(rjsconfig) {
	var include = [];
	var exclude = [];
	var excludeShallow = [];

	if (rjsconfig.modules) {
		rjsconfig.modules.forEach(function(mod) {
			include.push(mod.name);
			include.push(mod.include);
			include.push(mod.deps);
			exclude.push(mod.exclude);
			excludeShallow.push(mod.excludeShallow);
		});
	}

	include.push(rjsconfig.name);
	include.push(rjsconfig.include);
	include.push(rjsconfig.deps);
	exclude.push(rjsconfig.exclude);
	excludeShallow.push(rjsconfig.excludeShallow);

	include = compact(flatten(include));
	exclude = compact(flatten(exclude));
	excludeShallow = compact(flatten(excludeShallow));

	include = _expand(rjsconfig, include);
	exclude = _expand(rjsconfig, exclude);
	excludeShallow = _expand(rjsconfig, excludeShallow);

	include = compact(flatten(include));
	exclude = compact(flatten(exclude));
	excludeShallow = compact(flatten(excludeShallow));

	var files = difference(include, exclude);

	files = linearize(files.map(function(file) {
		return getDependencyGraph(rjsconfig, file);
	})).map(function(node) {
		if (node.resolved) {
			return node.file;
		}
	}).filter(function(file) {
		return !!file;
	});

	files = difference(files, excludeShallow);

	return files;
};


module.exports = findProjectFiles;
