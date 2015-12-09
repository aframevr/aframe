var debug = require('../utils/debug');
var coordinates = require('../utils/coordinates');
var registerComponent = require('../core/component').registerComponent;
var THREE = require('../../lib/three');

var warn = debug('components:look-at:warn');
var isCoordinate = coordinates.isCoordinate;

/**
 * Look-at component.
 * Modifies rotation to either track another entity OR do a one-time turn towards a position
 * vector.
 *
 * If tracking an object via setting the component value via a selector, look-at will register
 * a behavior to the scene to update rotation on every tick.
 *
 * Examples:
 *
 * look-at="#the-mirror"
 * look-at="0 5 -2"
 *
 * @param Look-at either takes a target selector pointing to another object or a
 *        position.
 * @member {object} target3D - object3D of targeted element that look-at is currently
           tracking.
 * @member {object} vector - Helper vector to do matrix transformations.
 */
module.exports.Component = registerComponent('look-at', {
  init: function () {
    this.target3D = null;
    this.vector = new THREE.Vector3();
  },

  /**
   * If tracking an object, this will be called on every tick.
   * If looking at a position vector, this will only be called once (until further updates).
   */
  update: function () {
    var self = this;
    var data = self.data;
    var position = data.position;
    var object3D = self.el.object3D;
    var target3D = self.target3D;
    var targetEl;
    var targetSelector = data.targetSelector;

    // Track target object position. Depends on parent object keeping global transforms up
    // to state with updateMatrixWorld(). In practice, this is handled by the renderer.
    if (target3D) {
      return object3D.lookAt(self.vector.setFromMatrixPosition(target3D.matrixWorld));
    }

    // Query for the element, grab its object3D, then register a behavior on the scene to
    // track the target on every tick.
    if (targetSelector) {
      targetEl = document.querySelector(targetSelector);
      if (!targetEl) {
        warn('"' + targetSelector + '" does not point to a valid entity to look-at');
        return;
      }
      if (!targetEl.object3D) {
        return targetEl.addEventListener('loaded', function () {
          self.beginTracking(targetEl);
        });
      }
      return self.beginTracking(targetEl);
    }

    // Look at a position.
    if (position) {
      object3D.lookAt(new THREE.Vector3(position.x, position.y, position.z));
      return;
    }

    // No longer looking at anything (i.e., look-at="").
    if (!position && !targetSelector) { return self.remove(); }
  },

  /**
   * Remove follow behavior on remove (callback).
   */
  remove: function () {
    this.el.sceneEl.removeBehavior(this);
  },

  beginTracking: function (targetEl) {
    this.target3D = targetEl.object3D;
    this.el.sceneEl.addBehavior(this);
  },

  /**
   * Determine whether attribute value is a target selector or a position.
   * Parse the attribute value if it is a position.
   *
   * @param {string} value - HTML attribute of component.
   * @returns {object}
   */
  parse: function (value) {
    if (!value) {
      return {
        position: null,
        targetSelector: null
      };
    }
    // Check if value is a position. Need to match digits since a target selector could have
    // three values as well (e.g., look-at="#el .el .box").
    if (isCoordinate(value)) {
      return {
        position: coordinates.parse(value),
        targetSelector: null
      };
    }
    return {
      position: null,
      targetSelector: value
    };
  },

  stringify: coordinates.componentMixin.stringify
});
