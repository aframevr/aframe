/* global CustomEvent */

require('./vr-register-element');

var requestInterval = require('request-interval');
var THREE = require('../lib/three');

var VRObject = require('./core/vr-object');

module.exports = document.registerElement(
  'vr-cursor',
  {
    prototype: Object.create(
      VRObject.prototype, {
        createdCallback: {
          value: function () {
            var material = this.getMaterial();
            var geometry = this.getGeometry();
            this.object3D = new THREE.Mesh(geometry, material);
            this.raycaster = new THREE.Raycaster();
            this.intersectedEl = null;
            this.attachEventListeners();
            this.pollForHoverIntersections();
            this.load();
          }
        },

        attachEventListeners: {
          value: function () {
            document.addEventListener('mousedown', this.onMouseDown.bind(this), false);
            this.addEventListener('click', this.handleClick.bind(this));
          }
        },

        pollForHoverIntersections: {
          value: function () {
            requestInterval(100, this.handleMouseEnter.bind(this));
          }
        },

        onMouseDown: {
          value: function () {
            this.click();
          }
        },

        attributeChangedCallback: {
          value: function () {
            var material = this.getMaterial();
            var geometry = this.getGeometry();
            this.object3D.geometry = geometry;
            this.object3D.material = material;
          }
        },

        getGeometry: {
          value: function () {
            var radius = this.getAttribute('radius', 0.005);
            var geometryId = this.getAttribute('geometry');
            var geometryEl = geometryId ? document.querySelector('#' + geometryId) : undefined;
            return (geometryEl && geometryEl.geometry) || new THREE.SphereGeometry(radius, 64, 40);
          }
        },

        getMaterial: {
          value: function () {
            var materialId = this.getAttribute('material');
            var materialEl = materialId ? document.querySelector('#' + materialId) : undefined;
            return (materialEl && materialEl.material) || new THREE.MeshBasicMaterial({color: 0xff0000, side: THREE.DoubleSide});
          }
        },

        intersect: {
          value: function (objects) {
            var raycaster = this.raycaster;
            var cursor = this.object3D;
            var cursorPosition = cursor.position.clone();
            cursor.localToWorld(cursorPosition);
            var parent = this.parentNode.object3D;
            var parentPosition = parent.position.clone();
            parent.localToWorld(parentPosition);
            var direction = cursorPosition.sub(parentPosition).normalize();
            raycaster.set(parentPosition, direction);
            return raycaster.intersectObjects(objects, true);
          }
        },

        // May return null if no objects are intersected.
        getClosestIntersected: {
          value: function () {
            var scene = this.sceneEl.object3D;
            var intersectedObjs = this.intersect(scene.children);
            for (var i = 0; i < intersectedObjs.length; ++i) {
              // Find the closest element that is not the cursor itself.
              if (intersectedObjs[i].object !== this.object3D) {
                return intersectedObjs[i];
              }
            }
            return null;
          }
        },

        handleClick: {
          value: function () {
            var closest = this.getClosestIntersected();
            if (closest) { closest.object.el.click(); }
          }
        },

        handleMouseEnter: {
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
              this.changeGeometry(false);
            }
          }
        },

        changeGeometry: {
          value: function (highlight) {
            this.object3D.geometry = highlight
              ? new THREE.SphereGeometry(0.01, 64, 40) : this.getGeometry();
          }
        },

        clearExistingIntersection: {
          value: function () {
            this.intersectedEl.dispatchEvent(new CustomEvent('mouseleave'));
            this.intersectedEl = null;
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
              this.changeGeometry(true);
            } else if (this.intersectedEl !== el) {
              // A new intersection where previously a different element was
              // and now needs a mouseleave event.
              this.clearExistingIntersection();
              this.setExistingIntersection(el);
            }
          }
        }
      })
  }
);
