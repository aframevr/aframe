/* globals define */
(function(define){'use strict';define(function(require,exports,module){

	document.registerElement(
	  'vr-camera',
	  {
	    prototype: Object.create(
	      VRObject.prototype, {}
	    )
	  }
	);

});})(typeof define=='function'&&define.amd?define
:(function(n,w){'use strict';return typeof module=='object'?function(c){
c(require,exports,module);}:function(c){var m={exports:{}};c(function(n){
return w[n];},m.exports,m);w[n]=m.exports;};})('VRCamera',this));