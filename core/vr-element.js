/* global HTMLElement, HTMLImports, MutationObserver */

// Polyfill HTML Imports.
window.addEventListener('HTMLImportsLoaded', function () {
  importTemplates();
});

require('../lib/vendor/HTMLImports');

var VRMarkup = require('@mozvr/vr-markup');

var VRObject = VRMarkup.VRObject;
var VRUtils = VRMarkup.utils;

var internals = {};

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

function importTemplates () {
  if (!HTMLImports.useNative) {
    Object.keys(HTMLImports.importer.documents).forEach(function (key) {
      var doc = HTMLImports.importer.documents[key];
      utils.$$('vr-element', doc).forEach(function (template) {
        var templateEl = document.importNode(template, true);
        document.body.appendChild(templateEl);
      });
    });
  }
}

document.addEventListener('vr-markup-ready', function () {
  internals.vrMarkupReady = true;
});

module.exports = document.registerElement(
  'vr-element',
  {
    prototype: Object.create(
      HTMLElement.prototype,
      {
        createdCallback: {
          value: function () {
            var self = this;
            self.placeholders = [];
            if (self.ownerDocument !== document) {
              setTimeout(function () {
                document.body.appendChild(self);
              });
            }
          }
        },

        attributeBlacklist: {
          value: {
            name: true,
            id: true
          }
        },

        attachedCallback: {
          value: function () {
            this.sceneEl = utils.$('vr-scene');
            if (internals.vrMarkupReady) {
              this.inject();
              return;
            }
            document.addEventListener('vr-markup-ready', this.attachEventListeners.bind(this));
            this.addEventListener('loaded', this.inject.bind(this));
          }
        },

        detachedCallback: {
          value: function () {
            var self = this;
            self.removeTemplateListener();
            self.placeholders.forEach(function (el) {
              self.sceneEl.remove(el);
            });
          },
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
              if (!node.isVRNode) { return; }
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
            VRUtils.fireEvent(this, 'loaded');
            this.hasLoaded = true;
          }
        },

        register: {
          value: function (tagName) {
            if (this.registered) { return; }
            this.registered = true;

            var tagNameLower = tagName.toLowerCase();

            VRUtils.log('registering <%s>', tagNameLower);

            document.registerElement(
              tagNameLower,
              {
                prototype: Object.create(
                  VRObject.prototype, {
                    attributeChangedCallback: {
                      value: function () {
                        this.rerender();
                      }
                    },

                    rerender: {
                      value: function (force) {
                        if (!this.replaced) { return; }
                        if (!force && this.lastOuterHTML === this.outerHTML) { return; }

                        // Use the defaults defined on the original `<vr-element>`.
                        var template = utils.$('vr-element[name="' + tagName + '"]');
                        var attrsDefault = template ? utils.$$(template.attributes) : [];

                        var templateAttrs = {};
                        attrsDefault.concat(this.originalAttrs).forEach(function (attr) {
                          templateAttrs[attr.name] = attr.value;
                        });

                        if (force) {
                          // If the template has changed, remove any attributes
                          // that were added after this element was created.
                          utils.$$(this.attributes).forEach(function (attr) {
                            if (attr.name in templateAttrs) { return; }
                            this.removeAttribute(attr.name);
                          }, this);
                        }

                        var newHTML = utils.format(template.querySelector('template').innerHTML, templateAttrs);
                        if (this.innerHTML !== newHTML) {
                          // TODO: In the future use something like Virtual
                          // so we are doing the fewest number of DOM changes.
                          this.innerHTML = newHTML;
                        }

                        this.lastOuterHTML = this.outerHTML;
                      },
                      writable: window.debug
                    },

                    initDefaultComponents: {
                      value: function (force) {
                        if (force) {
                          VRObject.prototype.initDefaultComponents.call(this);
                        }
                      },
                      writable: window.debug
                    }
                  }
                )
              });
          }
        },

        removeTemplateListener: {
          value: function () {
            if (!this.mixinObserver) { return; }
            this.mixinObserver.disconnect();
            this.mixinObserver = null;
          },
          writable: window.debug
        },

        attachTemplateListener: {
          value: function (tagName) {
            var self = this;
            if (self.mixinObserver) { self.mixinObserver.disconnect(); }
            self.mixinObserver = new MutationObserver(function (mutations) {
              self.placeholders.forEach(function (el) {
                el.rerender(true);
              });
            });
            self.mixinObserver.observe(self, {
              attributes: true,
              characterData: true,
              childList: true,
              subtree: true
            });
          },
          writable: window.debug
        },

        inject: {
          value: function () {
            var self = this;
            if (self.injected) { return; }
            self.injected = true;

            var tagName = self.getAttribute('name');
            if (!tagName) { return; }

            self.attachTemplateListener(tagName);
            self.register(tagName);

            var placeholders = utils.$$(tagName, self.sceneEl);

            // Use any defaults defined on the `<vr-element name="yolo" color="cyan">`.
            var attrsDefault = utils.$$(self.attributes);

            placeholders.forEach(function (placeholder, idx) {
              var then = window.performance.now();

              // Use the attributes passed on the `<vr-yolo color="salmon">`.
              var attrsPassed = utils.$$(placeholder.attributes);
              // Use both, in that order.
              var placeholderAttrs = {};

              attrsDefault.concat(attrsPassed).forEach(function (attr) {
                placeholderAttrs[attr.name] = attr.value;
              });

              Object.keys(placeholderAttrs).forEach(function (key) {
                if (key.toLowerCase() in self.attributeBlacklist) { return; }
                placeholder.setAttribute(key, placeholderAttrs[key]);
              });

              var el = document.createElement('vr-object');
              el.id = 'injected--' + tagName + '-' + (idx + 1);
              el.className = 'injected injected--' + tagName + ' injected--' + tagName + '-' + (idx + 1);
              el.innerHTML = utils.format(self.querySelector('template').innerHTML, placeholderAttrs);
              placeholder.initDefaultComponents(true);  // We want this to happen only *after* we've added our attributes.
              placeholder.originalAttrs = utils.$$(placeholder.attributes);
              placeholder.innerHTML = el.innerHTML;
              placeholder.replaced = true;
              self.sceneEl.add(el);

              VRUtils.log('<%s> injected (%.4f ms)', tagName, window.performance.now() - then);

              self.placeholders.push(placeholder);
            });
          }
        }
      }
    )
  }
);
