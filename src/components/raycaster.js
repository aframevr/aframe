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

      document.addEventListener('mousedown', el.emitter('mousedown'));
      document.addEventListener('mouseup', el.emitter('mouseup'));
      document.addEventListener('click', el.emitter('click'));

      el.addEventListener('mousedown', this.emitOnIntersection('mousedown'));
      el.addEventListener('mouseup', this.emitOnIntersection('mouseup'));
      el.addEventListener('click', this.emitOnIntersection('click'));
    }
  },

  pollForHoverIntersections: {
    value: function () {
      requestInterval(100, this.onMouseEnter.bind(this));
    }
  },

  emitOnIntersection: {
    value: function (eventName) {
      var self = this;
      return function () {
        var closest = self.getClosestIntersected();
        if (!closest) { return; }
        closest.object.el.emit(eventName);
      };
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
      this.intersectedEl.emit('mouseleave');
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
      el.emit('mouseenter hover');
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
