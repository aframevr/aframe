/* global Event, HTMLElement */

var registerElement = require('../vr-register-element');

var VRNode = require('./vr-node');

module.exports = registerElement(
  'vr-assets',
  {
    prototype: Object.create(
      HTMLElement.prototype,
      {
        createdCallback: {
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
              if (!self.isVRNode(node)) { return; }
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

        isVRNode: {
          value: function (node) {
            return VRNode.prototype.isPrototypeOf(node);
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
