'use strict';


var deplist = require('tasks/deplist');
var check = require('tasks/check');


var cli = function() {

	var task = process.argv[2];
	var args = process.argv.slice(3);

	switch(task) {
		case 'deplist':
			deplist(args);
		break;
		case 'check':
			check(args);
		break;
	}

};


module.exports = {
	cli: cli
};
