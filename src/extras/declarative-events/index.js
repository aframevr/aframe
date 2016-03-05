var ANode = require('../../core/a-node');
var registerElement = require('../../core/a-register-element').registerElement;

/**
 * Declarative events to help register event listeners that set attributes on other entities.
 * A convenience layer and helper for those that might not know Javascript.
 *
 * Note that the event that <a-event> registers is not delegated as this helper is mainly
 * for those that do not know Javascript and writing raw markup. In which case, delegated
 * events are not needed. Also helps reduce scope of this helper and encourages people to
 * learn to register their own event handlers.
 *
 * @member {string} name - Event name.
 * @member {array} targetEls - Elements to modify on event. Defaults to parent element.
 */
module.exports = registerElement('a-event', {
  prototype: Object.create(ANode.prototype, {
    createdCallback: {
      value: function () {
        this.el = null;
        this.isAEvent = true;
        this.name = '';
        this.targetEls = [];
      }
    },

    attachedCallback: {
      value: function () {
        var targetSelector = this.getAttribute('target');
        this.el = this.parentNode;
        this.name = this.getAttribute('name') || this.getAttribute('type');

        if (targetSelector) {
          this.targetEls = this.closest('a-scene').querySelectorAll(targetSelector);
        } else {
          this.targetEls = [this.el];
        }

        if (this.deprecated) {
          console.warn(
            '<' + this.tagName.toLowerCase() + '>' +
            ' has been DEPRECATED. Use <a-event name="' + this.name + '">' +
            ' instead.'
          );
        }

        // Deprecate `type` for `name`.
        if (this.hasAttribute('type')) {
          console.log(
            '<a-event type> has been DEPRECATED. Use <a-event name> instead.'
          );
        }

        this.listener = this.attachEventListener();
        this.load();
      }
    },

    detachedCallback: {
      value: function () {
        var listener = this.listener;
        if (!listener) { return; }
        this.removeEventListener(this.name, listener);
      }
    },

    attachEventListener: {
      value: function () {
        var attributes = this.attributes;
        var el = this.el;
        var name = this.name;
        var targetEls = this.targetEls;

        return el.addEventListener(name, function () {
          var attribute;
          var attributeName;
          var attributeSplit;
          var attributeValue;
          var targetEl;

          for (var i = 0; i < targetEls.length; i++) {
            for (var j = 0; j < attributes.length; j++) {
              attribute = attributes[j];
              attributeName = attribute.name;
              attributeValue = attribute.value;
              targetEl = targetEls[i];

              // target is a keyword for <a-event>.
              if (attributeName === 'target') { continue; }

              // Handle component property selector like `material.color`.
              if (attributeName.indexOf('.') !== -1) {
                attributeSplit = attributeName.split('.');
                targetEl.setAttribute(attributeSplit[0], attributeSplit[1],
                                      attributeValue);
                continue;
              }

              // Set plain attribute.
              targetEl.setAttribute(attributeName, attributeValue);
            }
          }
        });
      }
    }
  })
});
