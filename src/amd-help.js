'use strict';


var path = require('path');
var child = require('child_process');


var help = function() {
	var term = process.argv[3];
	var manpath = path.join(__dirname, '..', 'man/man1');
	if (term) {
		manpath = path.join(manpath, 'amd-' + term + '.1');
	}
	else {
		manpath = path.join(manpath, 'amd.1');
	}
	var conf = { customFds: [0, 1, 2] };
	var man = child.spawn('man', [manpath], conf);
	man.on('close', function() {});
};


module.exports = help;
