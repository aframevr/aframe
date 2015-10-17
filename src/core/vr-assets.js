/* global Event, HTMLElement */

var registerElement = require('../vr-register-element');

module.exports = registerElement(
  'vr-assets',
  {
    prototype: Object.create(
      HTMLElement.prototype,
      {
        attachedCallback: {
          value: function () {
            document.addEventListener('vr-markup-ready', this.attachEventListeners.bind(this));
          }
        },

        attachEventListeners: {
          value: function () {
            var self = this;
            var assetLoaded = this.assetLoaded.bind(this);
            this.assetsPending = 0;
            var children = this.querySelectorAll('*');
            Array.prototype.slice.call(children).forEach(countElement);

            if (!this.assetsPending) {
              assetLoaded();
            }

            function countElement (node) {
              if (!node.isVRNode) { return; }
              if (!node.hasLoaded) {
                attachEventListener(node);
                self.assetsPending++;
              }
            }

            function attachEventListener (node) {
              node.addEventListener('loaded', assetLoaded);
            }
          }
        },

        assetLoaded: {
          value: function () {
            this.assetsPending--;
            if (this.assetsPending <= 0) {
              this.load();
            }
          }
        },

        load: {
          value: function () {
            // To prevent emitting the loaded event more than once.
            if (this.hasLoaded) { return; }
            var event = new Event('loaded');
            this.hasLoaded = true;
            this.dispatchEvent(event);
          }
        }
      }
    )
  }
);
