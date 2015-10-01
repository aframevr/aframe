/* global Event, HTMLElement */

var VRMarkup = require('@mozvr/vr-markup');

var VRNode = VRMarkup.VRNode;
var VRObject = VRMarkup.VRObject;

var internals = {
  isRegistered: function (tagName) {
    tagName = tagName.toLowerCase();
    if (tagName in internals.registeredTags) { return true; }
    return VRNode.prototype.isPrototypeOf(document.createElement(tagName));
  },
  registeredTags: {}
};

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
  },
  'transformAttr': function (name, val) {
    return val;
  },
  'replaceVariables': function (elSrc, elDest, newVals) {
    utils.$$(elSrc.attributes).forEach(function (attr) {
      if (attr.value.indexOf('${') === -1) { return; }
      var newAttr = utils.format(attr.value, newVals);
      if (newAttr !== elDest.getAttribute(attr.name)) {
        elDest.setAttribute(attr.name, newAttr);
      }
    });

    // TODO: Also handle innerHTML (useful for text, for example).
  }
};

/**
 * ES6-style string formatting
 *
 * > format('${0}', ['zzz'])
 * "zzz"
 *
 * > format('${0}{1}', 1, 2)
 * "12"
 *
 * > format('${x}', {x: 1})
 * "1"
 *
 * > format('my favourite color is ${color=blue}', {x: 1})
 * "my favourite color is blue"
 *
 */
utils.format = (function () {
  var re = /\$?\{\s*([^}= ]+)(\s*=\s*(.+))?\s*\}/g;
  return function (s, args) {
    if (!s) { throw new Error('Format string is empty!'); }
    if (!args) { return; }
    if (!(args instanceof Array || args instanceof Object)) {
      args = Array.prototype.slice.call(arguments, 1);
    }
    return s.replace(re, function (_, name, rhs, defaultVal) {
      var val = args[name];

      if (typeof val === 'undefined') {
        return (defaultVal || '?').trim().replace(/^["']|["']$/g, '');
      }

      return (val || '?').trim().replace(/^["']|["']$/g, '');
    });
  };
})();

utils.template = function (s) {
  if (!s) { throw new Error('Template string is empty!'); }
  return function (args) { return utils.format(s, args); };
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
          value: function () { /* unsupported use case */ },
          writable: window.debug
        },

        attachEventListeners: {
          value: function () {
            var self = this;
            var elementLoaded = this.elementLoaded.bind(this);
            this.elementsPending = 0;
            utils.$$('*', this).forEach(traverseDOM);
            if (!this.elementsPending) {
              elementLoaded();
            }
            function traverseDOM (node) {
              if (!self.isVRNode(node)) { return; }
              if (!node.hasLoaded) {
                attachEventListener(node);
                self.elementsPending++;
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
            // To prevent emitting the loaded event more than once.
            if (this.hasLoaded) { return; }
            var event = new Event('loaded');
            this.hasLoaded = true;
            this.dispatchEvent(event);
          }
        },

        register: {
          value: function (tagName) {
            var tagNameLower = tagName.toLowerCase();

            console.log('registering <%s>', tagNameLower);

            internals.registeredTags[tagNameLower] = true;

            document.registerElement(
              tagNameLower,
              {
                prototype: Object.create(
                  VRObject.prototype, {
                    createdCallback: {
                      value: function () {
                        /* no-op */
                        console.log('\tcreatedCallback');
                      },
                      writable: window.debug
                    },

                    attachedCallback: {
                      value: function () {
                        console.log('\tattachedCallback');
                      },
                      writable: window.debug
                    },

                    attributeChangedCallback: {
                      value: function () {
                        console.log('\tattributeChangedCallback');

                        if (!this.fakeChildren) { return; }

                        // Use any defaults defined on the original `<vr-template>`.
                        var placeholder = utils.$('vr-template[name="' + tagName + '"]');
                        var attrsDefault = placeholder ? utils.$$(placeholder.attributes) : [];

                        // Use the attributes passed on this element.
                        var attrsPassed = utils.$$(this.attributes);
                        // Use both, in that order.
                        var placeholderAttrs = {};
                        attrsDefault.concat(attrsPassed).forEach(function (attr) {
                          placeholderAttrs[attr.name] = utils.transformAttr(attr.name, attr.value);
                        });

                        this.fakeChildren.forEach(function (data) {
                          utils.replaceVariables(data.placeholder, data.node, placeholderAttrs);
                        });
                      },
                      writable: window.debug
                    }
                  }
                )
              });
          }
        },

        inject: {
          value: function () {
            var self = this;

            var tagName = self.getAttribute('name');
            if (!tagName) { return; }
            // if (internals.isRegistered(tagName)) {
            //   console.warn('<%s> already registered', tagName);
            //   return;
            // }

            self.register(tagName);

            var sceneEl = utils.$('vr-scene');
            var placeholders = utils.$$(tagName, sceneEl);

            // Use any defaults defined on the `<vr-template name="yolo" color="cyan">`.
            var attrsDefault = utils.$$(self.attributes);

            placeholders.forEach(function (placeholder) {
              var then = window.performance.now();

              // Use the attributes passed on the `<vr-yolo color="salmon">`.
              var attrsPassed = utils.$$(placeholder.attributes);
              // Use both, in that order.
              var placeholderAttrs = {};
              attrsDefault.concat(attrsPassed).forEach(function (attr) {
                placeholderAttrs[attr.name] = utils.transformAttr(attr.name, attr.value);
              });

              placeholder.fakeChildren = utils.$$('*', self).map(function (child) {
                var el = child.cloneNode();  // NOTE: This is slow.

                utils.replaceVariables(child, el, placeholderAttrs);

                // placeholder.appendChild(el);
                sceneEl.add(el);

                return {
                  placeholder: child,
                  node: el
                };
              });

              console.log('<%s> took %.4f ms to inject', tagName, window.performance.now() - then);
            });
          }
        }
      }
    )
  }
);
