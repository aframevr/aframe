/* global HTMLTemplateElement, HTMLImports, MutationObserver */

window.addEventListener('HTMLImportsLoaded', function () {
  importTemplates();
});

// NOTE: HTML Imports polyfill must come before we include `vr-markup`.
var hasImports = document.createElement('link').import;
if (!hasImports) {
  require('../lib/vendor/HTMLImports');
}

var VRMarkup = require('@mozvr/vr-markup');
var registerTemplate = require('./lib/register-template');
var utils = require('./lib/utils');

var VRUtils = VRMarkup.utils;

var internals = {};

function importTemplates () {
  if (HTMLImports && !HTMLImports.useNative) {
    Object.keys(HTMLImports.importer.documents).forEach(function (key) {
      var doc = HTMLImports.importer.documents[key];
      utils.$$('template[is="vr-template"]', doc).forEach(function (template) {
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
  'vr-template',
  {
    extends: 'template',
    prototype: Object.create(
      HTMLTemplateElement.prototype,
      {
        createdCallback: {
          value: function () {
            var self = this;
            self.placeholders = [];
            if (self.ownerDocument !== document) {
              // TODO: Fix native HTML Imports for Chrome.
              // See https://github.com/MozVR/vr-components/issues/53
              setTimeout(function () {
                document.body.appendChild(self);
              });
            }
          }
        },

        attributeBlacklist: {
          value: {
            name: true,
            id: true,
            is: true
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
            return registerTemplate(tagName);
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

            // Use any defaults defined on the `<template is="vr-template" name="yolo" color="cyan">`.
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

              placeholder.initDefaultComponents(true);  // We want this to happen only *after* we've added our attributes.
              placeholder.originalAttrs = utils.$$(placeholder.attributes);
              placeholder.innerHTML = utils.format(self.innerHTML, placeholderAttrs);
              placeholder.replaced = true;
              self.sceneEl.add(placeholder);

              VRUtils.log('<%s> injected (%.4f ms)', tagName, window.performance.now() - then);

              self.placeholders.push(placeholder);
            });
          }
        }
      }
    )
  }
);
