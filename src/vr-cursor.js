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
            geometry.computeBoundingBox();
            var bb = geometry.boundingBox;
            this.cursorBias = bb.max.z - bb.min.z + 0.001;
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
            // Offset the ray to start past the cursor, so its geometry is
            // not intersected.
            parentPosition.add(cursorPosition);
            parentPosition.sub(new THREE.Vector3(0, 0, this.cursorBias));
            raycaster.set(parentPosition, direction);
            return raycaster.intersectObjects(objects, true);
          }
        },

        handleClick: {
          value: function () {
            var scene = this.sceneEl.object3D;
            var intersectedObjs = this.intersect(scene.children);
            if (intersectedObjs.length) {
              intersectedObjs[0].object.el.click();
            }
          }
        },

        handleMouseEnter: {
          value: function () {
            // Eventually we can support all types of custom mouse events à la jQuery's mouse events:
            // https://api.jquery.com/category/events/mouse-events/
            var scene = this.sceneEl.object3D;
            var intersectedObjs = this.intersect(scene.children);
            if (intersectedObjs.length) {
              this.handleIntersection(intersectedObjs[0]);
            } else if (this.intersectedEl) {
              this.clearExistingIntersections();
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

        clearExistingIntersections: {
          value: function () {
            this.intersectedEl.dispatchEvent(new CustomEvent('mouseleave'));
            this.intersectedEl = null;
          }
        },

        handleIntersection: {
          value: function (obj) {
            var el = obj.object.el;

            if (!this.intersectedEl) {
              // A new intersection where previously there was none.
              this.intersectedEl = el;
              el.dispatchEvent(new CustomEvent('mouseenter'));
              this.changeGeometry(true);
            } else if (this.intersectedEl !== el) {
              // A new intersection where previously a different element was
              // and now needs a mouseleave event.
              this.clearExistingIntersections();
              this.intersectedEl = el;
              el.dispatchEvent(new CustomEvent('mouseenter'));
            }
          }
        }
      })
  }
);
