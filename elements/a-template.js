/* global HTMLTemplateElement, HTMLImports, MutationObserver */

window.addEventListener('HTMLImportsLoaded', injectFromPolyfilledImports);

// NOTE: HTML Imports polyfill must come before we include `aframe-core`.
if (!('import' in document.createElement('link'))) {
  require('../lib/vendor/HTMLImports');
}

var aframeCore = require('aframe-core');
var registerTemplate = require('./lib/register-template');
var utils = require('./lib/utils');

var registerElement = aframeCore.registerElement.registerElement;

function injectFromPolyfilledImports () {
  if (!HTMLImports || HTMLImports.useNative) { return; }

  Object.keys(HTMLImports.importer.documents).forEach(function (key) {
    var doc = HTMLImports.importer.documents[key];
    insertTemplateElements(doc);
  });
}

function insertTemplateElements (doc) {
  var sceneEl = utils.$('a-scene');
  var assetsEl = utils.$('a-assets');
  if (!assetsEl) {
    assetsEl = document.createElement('a-assets');
    sceneEl.parentNode.insertBefore(assetsEl, sceneEl);
  }

  utils.$$('a-mixin', doc).forEach(function (mixinEl) {
    var mixinCloneEl = document.importNode(mixinEl, true);
    assetsEl.appendChild(mixinCloneEl);
  });

  utils.$$('template[is="a-template"]', doc).forEach(function (templateEl) {
    var templateCloneEl = document.importNode(templateEl, true);
    document.body.appendChild(templateCloneEl);
  });
}

module.exports = registerElement(
  'a-template',
  {
    extends: 'template',  // This lets us do `<template is="a-template">`.
    prototype: Object.create(
      HTMLTemplateElement.prototype,
      {
        createdCallback: {
          value: function () {
            var self = this;
            self.placeholders = [];
            // For Chrome: https://github.com/aframevr/aframe-core/issues/321
            window.addEventListener('load', function () {
              appendElement();
              function appendElement () {
                var isInDocument = self.ownerDocument === document;
                // TODO: Handle `<a-mixin>` from imported templates for Chrome.
                if (!isInDocument) { document.body.appendChild(self); }
              }
            });
          },
          writable: window.debug
        },

        attachedCallback: {
          value: function () {
            this.load();
            this.inject();
          },
          writable: window.debug
        },

        detachedCallback: {
          value: function () {
            // XXX: Hack for VS to hide templates from source.
            // var self = this;
            // self.removeTemplateListener();
            // self.placeholders.forEach(function (el) {
            //   self.sceneEl.remove(el);
            // });
          },
          writable: window.debug
        },

        load: {
          value: function () {
            // To prevent emitting the loaded event more than once.
            if (this.hasLoaded) { return; }
            utils.fireEvent(this, 'loaded');
            this.hasLoaded = true;
          },
          writable: window.debug
        },

        register: {
          value: function (tagName) {
            if (this.registered) { return; }
            this.registered = true;
            return registerTemplate(tagName);
          },
          writable: window.debug
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

            var tagName = self.getAttribute('element');
            if (!tagName) { return; }

            self.attachTemplateListener(tagName);
            self.register(tagName);
          },
          writable: window.debug
        }
      }
    )
  }
);
