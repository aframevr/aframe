var aframeCore = require('@mozvr/aframe-core');
var utils = require('./utils');

var AComponents = aframeCore.AComponents;
var debug = utils.debug;
var error = debug('elements:lib:register-primitive:error');
var log = debug('elements:lib:register-primitive');

var AEntity = aframeCore.AEntity;
var wrapElement = utils.wrapElement;

module.exports = function (tagName, proto) {
  var tagNameLower = tagName.toLowerCase();
  var perfStart = window.performance.now();

  log('registering <%s>', tagNameLower);

  return wrapElement(tagNameLower, AEntity,
    utils.extend({
      defaults: {
        value: {}
      },

      mappings: {
        value: {}
      },

      transforms: {
        value: {}
      },

      applyComponentData: {
        value: function (data) {
          var self = this;
          data = data || {};
          Object.keys(data).forEach(function (componentName) {
            var componentData = data[componentName];
            self.setEntityAttribute(componentName, undefined, componentData);
          });
          self.componentData = data;
        }
      },

      getTransformedValue: {
        value: function (attr, value) {
          if (!this.transforms || !this.transforms[attr]) { return value; }
          return this.transforms[attr].bind(this)(value);
        }
      },

      createdCallback: {
        value: function () {
          this.data = {};
          this.componentData = {};
        }
      },

      attachedCallback: {
        value: function () {
          var self = this;
          self.applyComponentData(self.defaults);
          var attrs = {};
          var origAttrs = self.attributes;
          Object.keys(origAttrs).forEach(function (attrKey) {
            var attr = origAttrs[attrKey];
            attrs[attr.name] = attr.value;
            self.syncAttributeToComponent(attr.name, attr.value);
          });
        }
      },

      syncAttributeToComponent: {
        value: function (attr, value) {
          if (!attr || !this.mappings[attr]) { return; }
          var componentPropertyPair = this.mappings[attr].split('.');
          var component = componentPropertyPair[0];
          var property = componentPropertyPair[1];

          value = this.getTransformedValue(attr, value);
          console.log('•••••', attr, value);

          var theComponent = AComponents[component];
          if (theComponent) {
            this.persistAttributeData(attr, value);
            this.persistComponentData(component, property, value);
            this.updateComponent(component, this.componentData[component]);
          }
        }
      },

      persistAttributeData: {
        value: function (attr, value) {
          if (!this.data) { this.data = {}; }
          this.data[attr] = value;
        }
      },

      persistComponentData: {
        value: function (component, property, value) {
          if (!this.componentData[component]) {
            this.componentData[component] = {};
          }
          this.componentData[component][property] = value;
        }
      },

      attributeChangedCallback: {
        value: function (attr, oldVal, newVal) {
          if (!this.mappings[attr]) {
            AEntity.prototype.attributeChangedCallback.call(this, attr, oldVal, newVal);
            return;
          }
          this.syncAttributeToComponent(attr, newVal);
        }
      }
    },
    proto)
  );
};
