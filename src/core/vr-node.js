var VRTags = {};

// Registering element
VRTags["VR-NODE"] = true;

/* exported VRNode */
var VRNode = document.registerElement(
  'vr-node',
  {
    prototype: Object.create(
      HTMLElement.prototype,
      {
        createdCallback: {
          value: function() {
            var sceneEl = document.querySelector('vr-scene');
            this.sceneEl = sceneEl;
            this.init();
          }
        },

        init: {
          value: function() {
            this.load();
          }
        },

        load: {
          value: function() {
            // To prevent emmitting the loaded event more than once
            if (this.hasLoaded) { return; }
            var event = new Event('loaded');
            this.hasLoaded = true;
            this.dispatchEvent(event);
            this.onAttributeChanged();
          }
        },

        attachedCallback: {
          value: function() {
            // console.log('entering the DOM :-) )');
          }
        },

        detachedCallback: {
          value: function() {
            // console.log('leaving the DOM :-( )');
          }
        },

        onAttributeChanged: {
          value: function() { /* no-op */ }
        },

        attributeChangedCallback: {
          value: function(name, previousValue, value) {
            this.onAttributeChanged();
          }
        }
    })
  }
);

