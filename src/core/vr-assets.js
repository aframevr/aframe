require('../vr-register-element');

module.exports = document.registerElement(
  'vr-assets',
  {
    prototype: Object.create(
      HTMLElement.prototype,
      {
        createdCallback: {
          value: function() {
            this.attachEventListeners();
          }
        },

        attachEventListeners: {
          value: function() {
            var self = this;
            var assetLoaded = this.assetLoaded.bind(this);
            this.assetsPending = 0;
            traverseDOM(this);
            function traverseDOM(node) {
              var tagName = node.tagName;
              if (node !== self && tagName && tagName.indexOf('VR-') === 0) {
                attachEventListener(node);
                self.assetsPending++;
              }
              node = node.firstChild;
              while (node) {
                traverseDOM(node);
                node = node.nextSibling;
              }
            }
            function attachEventListener(node) {
              node.addEventListener('loaded', assetLoaded);
            }
          }
        },

        assetLoaded: {
          value: function() {
            this.assetsPending--;
            if (this.assetsPending === 0) {
              this.load();
            }
          }
        },

        load: {
          value: function() {
            // To prevent emmitting the loaded event more than once
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
