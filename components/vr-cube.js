/* globals define */
(function(define){'use strict';define(function(require,exports,module){

	document.registerElement(
	  'vr-cube',
	  {
	    prototype: Object.create(
	      VRObject.prototype, {
	      	createdCallback: {
		      	value: function() {
		      		var geometry = new THREE.BoxGeometry( 200, 200, 200 );
		      		var material = new THREE.MeshNormalMaterial( { color: Math.random() * 0xffffff, opacity: 1.0 } );
		      		this.object3D = new THREE.Mesh( geometry, material );
		      	}
	      	}
	      })
	  }
	);

});})(typeof define=='function'&&define.amd?define
:(function(n,w){'use strict';return typeof module=='object'?function(c){
c(require,exports,module);}:function(c){var m={exports:{}};c(function(n){
return w[n];},m.exports,m);w[n]=m.exports;};})('VRCube',this));