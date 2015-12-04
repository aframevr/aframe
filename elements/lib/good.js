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

      applyComponentData: {
        value: function (data) {
          var self = this;
          data = data || {};
          Object.keys(data).forEach(function (key) {
            self.setEntityAttribute(key, undefined, data[key]);
          });
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
          console.log('º', component, '{' + property + ': ' + value + '}');

          // TODO: check if component.
          var isComponent = AComponents[component];
          if (isComponent) {
            var data = {};
            data[property] = value;
            this.updateComponent(component, data);
          }
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
