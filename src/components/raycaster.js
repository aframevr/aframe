/* global CustomEvent */

var registerComponent = require('../core/register-component');
var requestInterval = require('request-interval');
var THREE = require('../../lib/three');

module.exports.Component = registerComponent('raycaster', {
  init: {
    value: function () {
      this.raycaster = new THREE.Raycaster();
      this.intersectedEl = null;
      this.attachEventListeners();
      this.pollForHoverIntersections();
    }
  },

  attachEventListeners: {
    value: function () {
      var el = this.el;
      document.addEventListener('mousedown', this.onMouseDown.bind(this), false);
      el.addEventListener('click', this.onClick.bind(this));
    }
  },

  pollForHoverIntersections: {
    value: function () {
      requestInterval(100, this.onMouseEnter.bind(this));
    }
  },

  onClick: {
    value: function () {
      var closest = this.getClosestIntersected();
      if (closest) { closest.object.el.click(); }
    }
  },

  onMouseDown: {
    value: function () {
      this.el.click();
    }
  },

  onMouseEnter: {
    value: function () {
      var closest = this.getClosestIntersected();
      if (closest) {
        this.handleIntersection(closest);
        return;
      }
      // If we have no intersections other than the cursor itself,
      // but we still have a previously intersected element, clear it.
      if (this.intersectedEl) {
        this.clearExistingIntersection();
      }
    }
  },

  intersect: {
    value: function (objects) {
      var el = this.el;
      var raycaster = this.raycaster;
      var cursor = el.object3D;
      var parent = el.parentNode.object3D;
      var originPosition = new THREE.Vector3().setFromMatrixPosition(parent.matrixWorld);
      var cursorPosition = new THREE.Vector3().setFromMatrixPosition(cursor.matrixWorld);
      var direction = cursorPosition.sub(originPosition).normalize();
      raycaster.set(originPosition, direction);
      return raycaster.intersectObjects(objects, true);
    }
  },

  clearExistingIntersection: {
    value: function () {
      this.intersectedEl.dispatchEvent(new CustomEvent('mouseleave'));
      this.intersectedEl = null;
    }
  },

  // May return null if no objects are intersected.
  getClosestIntersected: {
    value: function () {
      var scene = this.el.sceneEl.object3D;
      var intersectedObjs = this.intersect(scene.children);
      for (var i = 0; i < intersectedObjs.length; ++i) {
        // Find the closest element that is not the cursor itself.
        if (intersectedObjs[i].object !== this.el.object3D) {
          return intersectedObjs[i];
        }
      }
      return null;
    }
  },

  setExistingIntersection: {
    value: function (el) {
      this.intersectedEl = el;
      el.dispatchEvent(new CustomEvent('mouseenter'));
    }
  },

  handleIntersection: {
    value: function (obj) {
      var el = obj.object.el;

      if (!this.intersectedEl) {
        // A new intersection where previously there was none.
        this.setExistingIntersection(el);
      } else if (this.intersectedEl !== el) {
        // A new intersection where previously a different element was
        // and now needs a mouseleave event.
        this.clearExistingIntersection();
        this.setExistingIntersection(el);
      }
    }
  }

});
