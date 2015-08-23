/* globals define */
(function(define){'use strict';define(function(require,exports,module){

	var proto =  Object.create(
    HTMLElement.prototype, {
	    createdCallback: {
	    	value: function() {
	    		this.object3D = new THREE.Object3D();
	    	}
	    },

	    attachedCallback: {
	    	value: function() {
	    		var parent = this.parentNode;
	    		parent.add( this );
	    		this.update();
	    	}
	  	},

	    detachedCallback: {
	    	value: function() {
	      	console.log('leaving the DOM :-( )');
	    	}
	  	},

	  	add: {
	  		value: function(el) {
	  			this.object3D.add(el.object3D);
	  		}
	  	},

	  	update: {
	  		value: function() {
	  			// Position
	  			var x = parseFloat(this.getAttribute('x')) || 0;
					var y = parseFloat(this.getAttribute('y')) || 0;
					var z = parseFloat(this.getAttribute('z')) || 0;

					// Orientation
					var orientationX = parseFloat(this.getAttribute('rotx')) || 0;
					var orientationY = parseFloat(this.getAttribute('roty')) || 0;
					var orientationZ = parseFloat(this.getAttribute('rotz')) || 0;

					// Converting to degrees
					var rotX = THREE.Math.degToRad(orientationX);
					var rotY = THREE.Math.degToRad(orientationY);
					var rotZ = THREE.Math.degToRad(orientationZ);

					// Setting three.js parameters
					this.object3D.position.set(x, y, z);
	    		this.object3D.rotation.order = 'YXZ';
	    		this.object3D.rotation.set(rotX, rotY, rotZ);
	  		}
	  	},

	    attributeChangedCallback: {
	    	value: function(name, previousValue, value) {
	    		this.update();
	    	}
	    }
  });

	// Registering element and exporting prototype
	module.exports = document.registerElement('vr-object', { prototype: proto });

});})(typeof define=='function'&&define.amd?define
:(function(n,w){'use strict';return typeof module=='object'?function(c){
c(require,exports,module);}:function(c){var m={exports:{}};c(function(n){
return w[n];},m.exports,m);w[n]=m.exports;};})('VRObject',this));