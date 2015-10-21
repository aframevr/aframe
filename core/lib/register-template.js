var VRMarkup = require('@mozvr/vr-markup');
var utils = require('./utils');

var VRObject = VRMarkup.VRObject;
var VRUtils = VRMarkup.utils;

module.exports = function (tagName) {
  var tagNameLower = tagName.toLowerCase();
  var perfStart = window.performance.now();

  VRUtils.log('registering <%s>', tagNameLower);

  return document.registerElement(
    tagNameLower,
    {
      prototype: Object.create(
        VRObject.prototype, {
          attachedCallback: {
            value: function () {
              VRUtils.log('<%s> injected (%.4f ms)', tagName, window.performance.now() - perfStart);
            }
          },

          attributeChangedCallback: {
            value: function (attr, oldVal, newVal) {
              if (oldVal === newVal) { return; }
              this.rerender();
            },
            writable: window.debug
          },

          detachedCallback: {
            value: function () {
              if (!this.sceneEl) {
                this.sceneEl = utils.$('vr-scene');
              }
              this.sceneEl.remove(this);
            },
            writable: window.debug
          },

          rerender: {
            value: function (force) {
              if (!force && this.lastOuterHTML === this.outerHTML) { return; }

              var template = utils.$('template[is="vr-template"][element="' + tagName + '"]');
              if (!template) { return; }

              // Use the defaults defined on the original `<template is="vr-template">`.
              var templateAttrs = utils.mergeAttrs(template.attributes, this.attributes);

              var newHTML = utils.format(template.innerHTML, templateAttrs);
              if (newHTML !== this.innerHTML) {
                this.innerHTML = newHTML;
              }

              this.lastOuterHTML = this.outerHTML;
            },
            writable: window.debug
          }
        }
      )
    });
};
