/* globals define */
(function(define){'use strict';define(function(require,exports,module){

	var proto =  Object.create(
    HTMLElement.prototype, {
	    createdCallback: {
	    	value: function() {
	    		var sceneEl = document.querySelector('vr-scene');
	    		this.scene = sceneEl.object3D;
	 				this.init();
	    	}
	    },

	    init: {
      	value: function() {
      		this.update();
      		this.loaded();
	      }
	    },

	    loaded: {
      	value: function() {
      		// To prevent emmitting the loaded event more than once
      		if (this.hasLoaded) { return; }
      		var event = new Event('loaded');
      		this.hasLoaded = true;
      		this.dispatchEvent(event);
	      }
	    },

	    attachedCallback: {
	    	value: function() {
	    		console.log('entering the DOM :-) )');
	    	}
	  	},

	    detachedCallback: {
	    	value: function() {
	      	console.log('leaving the DOM :-( )');
	    	}
	  	},

	  	update: {
	  		value: function() { /* no-op */ }
	  	},

	    attributeChangedCallback: {
	    	value: function(name, previousValue, value) {
	    		this.update();
	    	}
	    }
  });

	// Registering element and exporting prototype
	var VRTags = window.VRTags = window.VRTags || {};
	VRTags["VR-NODE"] = true;
	module.exports = document.registerElement('vr-node', { prototype: proto });

});})(typeof define=='function'&&define.amd?define
:(function(n,w){'use strict';return typeof module=='object'?function(c){
c(require,exports,module);}:function(c){var m={exports:{}};c(function(n){
return w[n];},m.exports,m);w[n]=m.exports;};})('VRNode',this));