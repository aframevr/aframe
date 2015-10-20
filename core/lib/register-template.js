var VRMarkup = require('@mozvr/vr-markup');
var utils = require('./utils');

var VRObject = VRMarkup.VRObject;
var VRUtils = VRMarkup.utils;

module.exports = function (tagName) {
  var tagNameLower = tagName.toLowerCase();

  VRUtils.log('registering <%s>', tagNameLower);

  return document.registerElement(
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

              // Use the defaults defined on the original `<template is="vr-template">`.
              var template = utils.$('template[is="vr-template"][element="' + tagName + '"]');
              var attrsDefault = template ? utils.$$(template.attributes) : [];

              var templateAttrs = {};
              var passedAttrs = force ? this.originalAttrs : utils.$$(this.attributes);
              attrsDefault.concat(passedAttrs).forEach(function (attr) {
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

              var newHTML = utils.format(template.innerHTML, templateAttrs);
              if (this.innerHTML !== newHTML) {
                // TODO: In the future use something like Virtual
                // so we are doing the fewest number of DOM changes.
                this.innerHTML = newHTML;
              }

              this.lastOuterHTML = this.outerHTML;
            },
            writable: window.debug
          },

          /**
           * Overrides `initDefaultComponents` from `VRObject`.
           *
           * By default, this will get called when the element is attached.
           * But we want to initialize the default components
           * only *after* we've added our attributes.
           *
           * @param {Boolean} force Whether to call the original method from `VRObject`.
           */
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
};
