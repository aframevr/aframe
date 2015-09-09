module.exports = document.registerElement(
  'vr-node',
  {
    prototype: Object.create(
      HTMLElement.prototype,
      {
        /**
          Native custom elements callbacks
          --------------------------------
        */
        createdCallback: {
          value: function() {
            var sceneEl = document.querySelector('vr-scene');
            this.sceneEl = sceneEl;
          }
        },

        attachedCallback: {
          value: function() { /* no-op */ }
        },

        detachedCallback: {
          value: function() { /* no-op */ }
        },

        attributeChangedCallback: {
          value: function() { /* no-op */ }
        },

        load: {
          value: function() {
            // To prevent emmitting the loaded event more than once
            if (this.hasLoaded) { return; }
            var attributeChangedCallback = this.attributeChangedCallback;
            var event = new Event('loaded');
            this.hasLoaded = true;
            this.dispatchEvent(event);
            if (attributeChangedCallback) { attributeChangedCallback.apply(this); }
          }
        }
    })
  }
);
