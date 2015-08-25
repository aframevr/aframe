/* globals define */
(function(define){'use strict';define(function(require,exports,module){

	document.registerElement(
	  'vr-material',
	  {
	    prototype: Object.create(
	      VRNode.prototype, {
	      	init: {
	      	  value: function() {
	      	  	this.material = this.setupMaterial();
	      	    this.load();
	      	  }
	      	},

	      	update: {
			  		value: function() {
			  			var color = this.getAttribute('color') || Math.random() * 0xffffff;
			  			var material = this.material;
			  			material.color = new THREE.Color(color);
			  		}
			  	},

	      	setupMaterial: {
			  		value: function() {
		      		var type = this.getAttribute('type') || 'MeshNormalMaterial';
		      		var material;
  		  			switch (type) {
  		  				case 'MeshBasicMaterial':
  		  					 material = new THREE.MeshBasicMaterial( { color: Math.random() * 0xffffff, shading: THREE.FlatShading, overdraw: 0.5 } );
  		  				  break;
  		  				case 'MeshNormalMaterial':
  		  					material = new THREE.MeshNormalMaterial( { opacity: 1.0 } );
  		  					break;
  		  				case 'MeshLambertMaterial':
  			  				material = new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff, shading: THREE.FlatShading, overdraw: 0.5 } );
  		  					break;
  		  				default:
  		  					console.error('Material type not supported');
  		  					break;
  						}
  						this.material = material;
  						return material;
			  		}
			  	}
	    })
	  }
	);

	var VRTags = window.VRTags = window.VRTags || {};
	VRTags["VR-MATERIAL"] = true;

});})(typeof define=='function'&&define.amd?define
:(function(n,w){'use strict';return typeof module=='object'?function(c){
c(require,exports,module);}:function(c){var m={exports:{}};c(function(n){
return w[n];},m.exports,m);w[n]=m.exports;};})('VRMaterial',this));
