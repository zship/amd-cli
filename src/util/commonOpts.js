'use strict';


var path = require('path');


module.exports = {
	config: {
		type: path,
		shortHand: 'c'
	},
	'base-url': {
		type: path,
		shortHand: 'b'
	},
	'entry-point': {
		type: path,
		shortHand: 'e'
	},
	color: {
		type: Boolean
	},
	verbose: {
		type: Boolean,
		shortHand: 'v'
	}
};
