/* global VR */

VR.error = function(msg) {
	throw new Error(msg);
};

VR.warn = function(msg) {
	console.warn(msg);
};

