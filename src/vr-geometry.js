/* globals define */
(function(define){'use strict';define(function(require,exports,module){

	document.registerElement(
	  'vr-geometry',
	  {
	    prototype: Object.create(
	      VRNode.prototype, {
          init: {
            value: function() {
              this.setupGeometry();
              this.load();
            }
          },

			  	setupGeometry: {
			  		value: function() {
		      		var primitive = this.primitive = this.getAttribute('primitive') || "Box";
		      		var geometry;
              var radius;
  		  			switch (primitive) {
  		  				case 'Box':
  		  					var width =  parseFloat(this.getAttribute('width')) || 200;
  		  					var height = parseFloat(this.getAttribute('height')) || 200;
  		  					var depth = parseFloat(this.getAttribute('depth')) || 200;
  		  					geometry = new THREE.BoxGeometry( width, height, depth );
  		  				  break;
  		  				case 'Sphere':
  		  					radius = parseFloat(this.getAttribute('radius')) || 100;
  		  					geometry = new THREE.SphereGeometry( radius, 32, 32 );
  		  					break;
  		  				case 'Torus':
  		  					radius = parseFloat(this.getAttribute('radius')) || 200;
  		  					var tube = parseFloat(this.getAttribute('tube')) || 10;
  		  					geometry = new THREE.TorusGeometry( radius, tube );
  		  					break;
  		  				default:
  		  					console.error('Primitive type not supported');
  		  					break;
  						}
  						this.geometry = geometry;
  						return geometry;
			  		}
			  	}
	    })
	  }
	);

	var VRTags = window.VRTags = window.VRTags || {};
	VRTags["VR-GEOMETRY"] = true;

});})(typeof define==='function'&&define.amd?define
:(function(n,w){'use strict';return typeof module==='object'?function(c){
c(require,exports,module);}:function(c){var m={exports:{}};c(function(n){
return w[n];},m.exports,m);w[n]=m.exports;};})('VRGeometry',this));
