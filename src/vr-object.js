/* globals define */
(function(define){'use strict';define(function(require,exports,module){

	var proto =  Object.create(
    HTMLElement.prototype, {
    createdCallback: {
    	value: function() {
    		var scene = this.scene = document.querySelector('vr-scene');
    		var object = this.object = new THREE.Object3D();
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

  	is3Dproperty: {
  		value: function(name) {
  			return name === 'x' ||
  						 name === 'y' ||
  						 name === 'z' ||
  						 name === 'rotx' ||
  						 name === 'roty' ||
  						 name === 'rotz';
  		}
  	},

  	add: {
  		value: function(el) {
  			this.object.add(el.object);
  		}
  	},

  	update: {
  		value: function() {
  			// Position
  			var x = parseFloat(this.getAttribute('x')) || 0;
				var y = parseFloat(this.getAttribute('y')) || 0;
				var z = parseFloat(this.getAttribute('z')) || 0;

				// Orientation
				var orientationX = parseFloat(this.getAttribute('rotX')) || 0;
				var orientationY = parseFloat(this.getAttribute('rotY')) || 0;
				var orientationZ = parseFloat(this.getAttribute('rotZ')) || 0;

				var rotX = THREE.Math.degToRad(orientationX);
				var rotY = THREE.Math.degToRad(orientationY);
				var rotZ = THREE.Math.degToRad(orientationZ);

  			this.object.position.set(x, -y, -z);
  			this.object.rotation.order = 'YXZ';
  			this.object.rotation.set(-rotX, rotY, rotZ);

  			this.scene.render();
  		}
  	},

    attributeChangedCallback: {
    	value: function(name, previousValue, value) {
    		if (this.is3Dproperty(name)) {
    			this.update();
    		}
    }}
  });

	// Registering element and exporting prototype
	module.exports = document.registerElement('vr-object', { prototype: proto });

});})(typeof define=='function'&&define.amd?define
:(function(n,w){'use strict';return typeof module=='object'?function(c){
c(require,exports,module);}:function(c){var m={exports:{}};c(function(n){
return w[n];},m.exports,m);w[n]=m.exports;};})('VRObject',this));