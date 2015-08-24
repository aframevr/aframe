/* globals define */
(function(define){'use strict';define(function(require,exports,module){

	document.registerElement(
	  'vr-mesh',
	  {
	    prototype: Object.create(
	      VRObject.prototype, {
	      	update: {
			  		value: function() {
			  			var geometryId = this.getAttribute('geometry');
			  			var geometryEl = geometryId? document.querySelector('#' + geometryId) : undefined;
			  			var geometry = (geometryEl && geometryEl.geometry) || new THREE.BoxGeometry( 200, 200, 200 );
			  			var materialId = this.getAttribute('material');
			  			var materialEl = materialId? document.querySelector('#' + materialId) : undefined;
			  			var material = materialEl && materialEl.material;
			  			if (!this.object3D) {
			  				this.object3D = new THREE.Mesh(geometry, material);
			  			} else {
			  				this.object3D.geometry = geometry;
			  				if (material) {
			  			 		this.object3D.material = material;
			  			 	}
			  			 }
			  		}
	      	},
	    })
	  }
	);

	var VRTags = window.VRTags = window.VRTags || {};
	VRTags["VR-MESH"] = true;

});})(typeof define=='function'&&define.amd?define
:(function(n,w){'use strict';return typeof module=='object'?function(c){
c(require,exports,module);}:function(c){var m={exports:{}};c(function(n){
return w[n];},m.exports,m);w[n]=m.exports;};})('VRMesh',this));
