var aframeCore = require('@mozvr/aframe-core');
var utils = require('./utils');

var registerElement = aframeCore.registerElement.registerElement;
var AObject = aframeCore.AObject;

registerElement('a-root', {prototype: Object.create(AObject.prototype)});

module.exports = function (tagName) {
  var tagNameLower = tagName.toLowerCase();
  var perfStart = window.performance.now();

  utils.log('registering <%s>', tagNameLower);

  return registerElement(
    tagNameLower,
    {
      prototype: Object.create(
        AObject.prototype, {
          attachedCallback: {
            value: function () {
              utils.log('<%s> injected (%.4f ms)', tagName, window.performance.now() - perfStart);
              // We emit an event so `<a-object>` knows when we've been
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

          attributeBlacklist: {
            value: {
              id: true,
              name: true,
              class: true,
              target: true
            },
            writable: window.debug
          },

          detachedCallback: {
            value: function () {
              if (!this.sceneEl) {
                this.sceneEl = utils.$('a-scene');
              }
              this.sceneEl.remove(this);
            },
            writable: window.debug
          },

          rerender: {
            value: function (force) {
              if (!force && this.lastOuterHTML === this.outerHTML) { return; }
              var template = utils.$('template[is="a-template"][element="' + tagName + '"]');
              if (!template) { return; }

              // Use the defaults defined on the original `<template is="a-template">`.
              var templateAttrs = utils.mergeAttrs(template, this);
              Object.keys(templateAttrs).filter(function (key) {
                if (key in this.attributeBlacklist) {
                  // Move these unique identifier attributes over
                  // (i.e., `id`, `name`, `class`, `target`).
                  this.removeAttribute(key);
                }
                var value = templateAttrs[key];
                var component = this.components[key];
                if (component && typeof value === 'object') {
                  templateAttrs[key] = component.stringifyAttributes(value);
                }
              }, this);

              this.root = utils.$$(this.children).filter(function (el) {
                return el.tagName.toLowerCase() === 'a-root';
              })[0];

              if (!this.root) {
                this.root = document.createElement('a-root');
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
