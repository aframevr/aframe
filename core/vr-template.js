/* global Event, HTMLElement */

var VRMarkup = require('@mozvr/vr-markup');

var VRNode = VRMarkup.VRNode;

var utils = {
  '$': function (sel) {
    if (sel && typeof sel === 'string') {
      sel = document.querySelector(sel);
    }
    return sel;
  },
  '$$': function (sel, parent) {
    if (sel && typeof sel === 'string') {
      sel = (parent || document).querySelectorAll(sel);
    }
    return Array.prototype.slice.call(sel);
  }
};

module.exports = document.registerElement(
  'vr-template',
  {
    prototype: Object.create(
      HTMLElement.prototype,
      {
        createdCallback: {
          value: function () { /* no-op */ },
          writable: window.debug
        },

        attachedCallback: {
          value: function () {
            this.addEventListener('loaded', this.inject.bind(this));
            document.addEventListener('vr-markup-ready', this.attachEventListeners.bind(this));
          }
        },

        attributeChangedCallback: {
          value: function () {
            console.log('they');
          },
          writable: window.debug
        },

        attachEventListeners: {
          value: function () {
            var self = this;
            var elementLoaded = this.elementLoaded.bind(this);
            this.elementsPending = 0;
            traverseDOM(this);
            if (!this.elementsPending) {
              elementLoaded();
            }
            function traverseDOM (node) {
              if (node !== self && self.isVRNode(node) && !node.hasLoaded) {
                attachEventListener(node);
                self.elementsPending++;
              }
              node = node.firstChild;
              while (node) {
                traverseDOM(node);
                node = node.nextSibling;
              }
            }
            function attachEventListener (node) {
              node.addEventListener('loaded', elementLoaded);
            }
          }
        },

        isVRNode: {
          value: function (node) {
            return VRNode.prototype.isPrototypeOf(node);
          }
        },

        elementLoaded: {
          value: function () {
            this.elementsPending--;
            if (this.elementsPending <= 0) {
              this.load();
            }
          }
        },

        load: {
          value: function () {
            // console.log('vr-template.load');
            // To prevent emitting the loaded event more than once.
            if (this.hasLoaded) { return; }
            var event = new Event('loaded');
            this.hasLoaded = true;
            this.dispatchEvent(event);
          }
        },

        inject: {
          value: function () {
            // console.log('vr-template.inject');
            var self = this;

            var tagName = self.getAttribute('register');
            if (!tagName) { return; }

            var sceneEl = utils.$('vr-scene');
            var placeholders = utils.$$(tagName, sceneEl);

            placeholders.forEach(function (placeholder) {
              var then = window.performance.now();

              utils.$$(self.children).forEach(function (node) {
                var dollyTheNode = node.cloneNode(true);
                sceneEl.add(dollyTheNode);
                placeholder.appendChild(dollyTheNode);
              });

              console.log('<%s> took %.4f ms to inject', tagName, window.performance.now() - then);
            });
          }
        }
      }
    )
  }
);
