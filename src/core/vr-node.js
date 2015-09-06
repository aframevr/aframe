/* exported VRNode */
var VRNode = document.registerElement(
  'vr-node',
  {
    prototype: Object.create(
      HTMLElement.prototype,
      {

        /**

          User element callbacks
          ----------------------

          User created elements have to define the
          onElementCreated and onAttributeChanged methods.

        */

        // Called on element creation
        onElementCreated: {
          value: function() {
            this.load();
          }
        },

        // Called attribute changed
        onAttributeChanged: {
          value: function() { /* no-op */ }
        },

        /**

          Native custom elements callbacks
          --------------------------------

          We don't expect the user defined elements
          to override these. We provide the onElementCreated
          and onAttributeChanged instead
          so VRNode can manage the lifecycle of 3d Objects

        */
        createdCallback: {
          value: function() {
            var sceneEl = document.querySelector('vr-scene');
            this.sceneEl = sceneEl;
            this.onElementCreated();
          }
        },

        attachedCallback: {
          value: function() { /* no-op */ }
        },

        detachedCallback: {
          value: function() { /* no-op */ }
        },

        attributeChangedCallback: {
          value: function(name, previousValue, value) {
            this.onAttributeChanged();
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
        }
    })
  }
);

