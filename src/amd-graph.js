'use strict';


var path = require('path');

var normalize = require('libamd/modules/normalize');
var getDependencyGraph = require('libamd/getDependencyGraph');
var linearize = require('libamd/graphs/linearize');
require('colors');

var parseOpts = require('./util/parseOpts');
var parseConfig = require('./util/parseConfig');
var resolveFileArgs = require('./util/resolveFileArgs');
var log = require('./util/log');


var _opts = {
	'normalize': {
		type: Boolean,
		description: 'Convert verbatim dependencies into unique module IDs'
	},
	'resolve': {
		type: Boolean,
		description: 'Convert verbatim dependencies into resolved file paths'
	}
};


var amdGraph = function() {
	var args = process.argv.slice(3);
	var opts = parseOpts(_opts, args, 0);
	var rjsconfig = parseConfig();
	var files = resolveFileArgs(opts.argv.remain, rjsconfig);

	var nodes = [];
	files.forEach(function(file) {
		nodes.push(getDependencyGraph(rjsconfig, file));
	});

	var sorted = linearize(nodes);

	if (opts.normalize) {
		sorted = sorted.map(function(node) {
			return normalize(rjsconfig, node.file);
		});
	}
	else if (opts.resolve) {
		sorted = sorted.map(function(node) {
			return node.file;
		});
	}
	else {
		sorted = sorted.map(function(node) {
			return path.relative('.', node.file);
		});
	}

	sorted.forEach(function(file) {
		log.writeln(file);
	});
};


module.exports = amdGraph;
