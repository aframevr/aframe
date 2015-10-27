/* global Event, HTMLElement */

var re = require('../vr-register-element');
var registerElement = re.registerElement;
var isNode = re.isNode;

module.exports = registerElement(
  'vr-assets',
  {
    prototype: Object.create(
      HTMLElement.prototype,
      {
        attachedCallback: {
          value: function () {
            this.attachEventListeners();
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
              if (!isNode(node)) { return; }
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
