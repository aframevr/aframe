/* global HTMLTemplateElement, HTMLImports, MutationObserver */

window.addEventListener('HTMLImportsLoaded', injectFromPolyfilledImports);

// NOTE: HTML Imports polyfill must come before we include `vr-markup`.
if (!('import' in document.createElement('link'))) {
  require('../lib/vendor/HTMLImports');
}

var VRMarkup = require('@mozvr/vr-markup');
var registerTemplate = require('./lib/register-template');
var utils = require('./lib/utils');

var registerElement = VRMarkup.registerElement.registerElement;
var VRUtils = VRMarkup.utils;

function injectFromPolyfilledImports () {
  if (!HTMLImports || HTMLImports.useNative) { return; }

  Object.keys(HTMLImports.importer.documents).forEach(function (key) {
    var doc = HTMLImports.importer.documents[key];
    insertTemplateElements(doc);
  });
}

function insertTemplateElements (doc) {
  var sceneEl = utils.$('vr-scene');
  var assetsEl = utils.$('vr-assets');
  if (!assetsEl) {
    assetsEl = document.createElement('vr-assets');
    sceneEl.parentNode.insertBefore(assetsEl, sceneEl);
  }

  utils.$$('vr-mixin', doc).forEach(function (mixinEl) {
    var mixinCloneEl = document.importNode(mixinEl, true);
    assetsEl.appendChild(mixinCloneEl);
  });

  utils.$$('template[is="vr-template"]', doc).forEach(function (templateEl) {
    var templateCloneEl = document.importNode(templateEl, true);
    document.body.appendChild(templateCloneEl);
  });
}

function runAfterSceneLoaded (cb) {
  var sceneEl = utils.$('vr-scene');
  if (!sceneEl) { return; }
  if (sceneEl.hasLoaded) {
    cb(sceneEl);
    return;
  }
  sceneEl.addEventListener('loaded', function () {
    cb(sceneEl);
  });
}

module.exports = registerElement(
  'vr-template',
  {
    extends: 'template',  // This lets us do `<template is="vr-template">`.
    prototype: Object.create(
      HTMLTemplateElement.prototype,
      {
        createdCallback: {
          value: function () {
            var self = this;
            self.placeholders = [];
            // For Chrome: https://github.com/MozVR/aframe-core/issues/321
            window.addEventListener('load', function () {
              runAfterSceneLoaded(appendElement);
              function appendElement () {
                var isInDocument = self.ownerDocument === document;
                // TODO: Handle `<vr-mixin>` from imported templates for Chrome.
                if (!isInDocument) { document.body.appendChild(self); }
              }
            });
          },
          writable: window.debug
        },

        attachedCallback: {
          value: function () {
            var self = this;
            runAfterSceneLoaded(function () {
              self.load();
              self.inject();
            });
          },
          writable: window.debug
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

        load: {
          value: function () {
            // To prevent emitting the loaded event more than once.
            if (this.hasLoaded) { return; }
            VRUtils.fireEvent(this, 'loaded');
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
