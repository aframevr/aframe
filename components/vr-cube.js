/* globals define */
(function(define){'use strict';define(function(require,exports,module){

	document.registerElement(
	  'vr-cube',
	  {
	    prototype: Object.create(
	      VRObject.prototype, {
	      	update: {
			  		value: function() {
			  			var width = parseFloat(this.getAttribute('width')) || 200;
			  			var height = parseFloat(this.getAttribute('height')) || 200;
			  			var depth = parseFloat(this.getAttribute('depth')) || 200;
			  			var materialId = this.getAttribute('material');
			  			var materialEl = materialId? document.querySelector('#' + materialId) : null;
			  			var material = (materialEl && materialEl.material) || new THREE.MeshNormalMaterial( { color: Math.random() * 0xffffff, opacity: 1.0 } );
			  			var geometry = new THREE.BoxGeometry( width, height, depth );
			  			if (!this.object3D) {
			  				this.object3D = new THREE.Mesh( geometry, material );
			  			} else {
			  				this.object3D.geometry = new THREE.BoxGeometry( width, height, depth );
			  				this.object3D.material = material;
			  			}
			  		}
			  	}
	      })
	  }
	);

	var VRTags = window.VRTags = window.VRTags || {};
	VRTags["VR-CUBE"] = true;

});})(typeof define=='function'&&define.amd?define
:(function(n,w){'use strict';return typeof module=='object'?function(c){
c(require,exports,module);}:function(c){var m={exports:{}};c(function(n){
return w[n];},m.exports,m);w[n]=m.exports;};})('VRCube',this));