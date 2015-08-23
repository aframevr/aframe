/* globals define */
(function(define){'use strict';define(function(require,exports,module){

	document.registerElement(
	  'vr-fog',
	  {
	    prototype: Object.create(
	      VRObject.prototype, {
	      	createdCallback: {
		      	value: function() {
							var sceneEl = document.querySelector('vr-scene');
	    				this.scene = sceneEl.object3D;
		      		this.scene.fog = new THREE.Fog( 0xefd1b5, 0.0025, 100000 );
		      		this.loaded();
		      	}
	      	}
	      })
	  }
	);

});})(typeof define=='function'&&define.amd?define
:(function(n,w){'use strict';return typeof module=='object'?function(c){
c(require,exports,module);}:function(c){var m={exports:{}};c(function(n){
return w[n];},m.exports,m);w[n]=m.exports;};})('VRFog',this));
