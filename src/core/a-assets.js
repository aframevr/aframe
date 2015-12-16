/* global HTMLElement */
var re = require('./a-register-element');
var utils = require('../utils/');

var isNode = re.isNode;
var registerElement = re.registerElement;

module.exports = registerElement(
  'a-assets',
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
            this.hasLoaded = true;
            var data = { bubbles: false, detail: {} };
            utils.fireEvent(this, 'loaded', data);
          }
        }
      }
    )
  }
);
