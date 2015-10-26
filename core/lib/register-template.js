var VRMarkup = require('@mozvr/vr-markup');
var utils = require('./utils');

var VRObject = VRMarkup.VRObject;
var VRUtils = VRMarkup.utils;

document.registerElement('vr-root', {prototype: Object.create(VRObject.prototype)});

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
              // We emit an event so `<vr-object>` knows when we've been
              // registered and adds our children as `object3D`s.
              this.emit('nodeready');
              this.rerender();
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
              var templateAttrs = utils.mergeAttrs(template, this);
              Object.keys(templateAttrs).filter(function (key) {
                var value = templateAttrs[key];
                var component = this.components[key];
                if (component && typeof value === 'object') {
                  templateAttrs[key] = component.stringifyAttributes(value);
                }
              }, this);

              this.root = utils.$$(this.children).filter(function (el) {
                return el.tagName.toLowerCase() === 'vr-root';
              })[0];

              if (!this.root) {
                this.root = document.createElement('vr-root');
                this.appendChild(this.root);
              }

              var newHTML = utils.format(template.innerHTML, templateAttrs);
              if (newHTML !== this.root.innerHTML) {
                this.root.innerHTML = newHTML;
              }

              this.lastOuterHTML = this.outerHTML;
            },
            writable: window.debug
          }
        }
      )
    });
};
