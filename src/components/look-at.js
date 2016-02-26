var debug = require('../utils/debug');
var coordinates = require('../utils/coordinates');
var registerComponent = require('../core/component').registerComponent;
var THREE = require('../lib/three');

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
  schema: {
    default: '',

    parse: function (value) {
      if (isCoordinate(value) || typeof value === 'object') {
        return coordinates.parse(value);
      }
      return value;
    },

    stringify: function (data) {
      if (typeof data === 'object') {
        return coordinates.stringify(data);
      }
      return data;
    }
  },

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
    var target = self.data;
    var object3D = self.el.object3D;
    var targetEl;

    // No longer looking at anything (i.e., look-at="").
    if (!target || (typeof target === 'object' && !Object.keys(target).length)) {
      return self.remove();
    }

    // Look at a position.
    if (typeof target === 'object') {
      return object3D.lookAt(new THREE.Vector3(target.x, target.y, target.z));
    }

    // Assume target is a string.
    // Query for the element, grab its object3D, then register a behavior on the scene to
    // track the target on every tick.
    targetEl = self.el.sceneEl.querySelector(target);
    if (!targetEl) {
      warn('"' + target + '" does not point to a valid entity to look-at');
      return;
    }
    if (!targetEl.hasLoaded) {
      return targetEl.addEventListener('loaded', function () {
        self.beginTracking(targetEl);
      });
    }
    return self.beginTracking(targetEl);
  },

  tick: function (t) {
    // Track target object position. Depends on parent object keeping global transforms up
    // to state with updateMatrixWorld(). In practice, this is handled by the renderer.
    var target3D = this.target3D;
    if (target3D) {
      return this.el.object3D.lookAt(this.vector.setFromMatrixPosition(target3D.matrixWorld));
    }
  },

  beginTracking: function (targetEl) {
    this.target3D = targetEl.object3D;
  }
});
