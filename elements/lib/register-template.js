var aframeCore = require('@mozvr/aframe-core');
var utils = require('./utils');

var registerElement = aframeCore.registerElement.registerElement;
var AEntity = aframeCore.AEntity;
var AComponents = aframeCore.AComponents;

var ATTRIBUTE_BLACKLIST = utils.extend({
  id: true,
  name: true,
  class: true,
  target: true
});
var COMPONENT_BLACKLIST = utils.extend({}, AComponents);

registerElement('a-root', {prototype: Object.create(AEntity.prototype)});

module.exports = function (tagName) {
  var tagNameLower = tagName.toLowerCase();

  return registerElement(
    tagNameLower,
    {
      prototype: Object.create(
        AEntity.prototype, {
          attachedCallback: {
            value: function () {
              // We emit an event so `<a-entity>` knows when we've been
              // registered and adds our children as `object3D`s.
              this.emit('nodeready');
              this.rerender(false, true);
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
            value: ATTRIBUTE_BLACKLIST,
            writable: window.debug
          },

          componentBlacklist: {
            value: COMPONENT_BLACKLIST,
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
            value: function (force, firstTime) {
              var self = this;
              if (!force && this.lastOuterHTML === this.outerHTML) { return; }
              var template = utils.$('template[is="a-template"][element="' + tagName + '"]');
              if (!template) { return; }

              // Use the defaults defined on the original `<template is="a-template">`.
              var templateAttrs = utils.mergeAttrs(template, this);
              utils.forEach(template.attributes, function (attr) {
                if (attr.name in self.componentBlacklist) {
                  if (firstTime) {
                    utils.warn('Cannot use attribute name "%s" for template ' +
                      'definition of <%s> because it is a core component',
                      attr.name, tagNameLower);
                  }
                  delete templateAttrs[attr.name];
                }
              });
              Object.keys(templateAttrs).filter(function (key) {
                if (key in this.attributeBlacklist) {
                  // Move these unique identifier attributes over
                  // (i.e., `id`, `name`, `class`, `target`).
                  delete templateAttrs[key];
                }
                var value = templateAttrs[key];
                var component = this.components[key];
                if (component && typeof value === 'object') {
                  templateAttrs[key] = component.stringify(value);
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
