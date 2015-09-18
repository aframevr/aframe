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
            this.intersectedEls = {};
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
            var radius = this.getAttribute('radius', 10);
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

        handleClick: {
          value: function () {
            var scene = this.sceneEl.object3D;
            var intersectedObjects = this.intersect(scene.children);
            intersectedObjects.forEach(function (obj) {
              obj.object.el.click();
            });
          }
        },

        handleMouseEnter: {
          value: function () {
            // Eventually we can support all types of custom mouse events à la jQuery's mouse events:
            // https://api.jquery.com/category/events/mouse-events/
            var scene = this.sceneEl.object3D;
            var intersectedObjects = this.intersect(scene.children);
            intersectedObjects.forEach(this.handleIntersection.bind(this));
            Object.keys(this.intersectedEls).forEach(this.emitMouseEvents.bind(this));
          }
        },

        handleIntersection: {
          value: function (obj) {
            var el = obj.object.el;
            var id = obj.object.id;
            this.intersectedEls[id] = this.intersectedEls[id] || {el: el, firedHover: false};
            this.intersectedEls[id].justIntersected = true;
          }
        },

        emitMouseEvents: {
          value: function (id) {
            var obj = this.intersectedEls[id];
            var el = obj.el;

            if (obj.justIntersected) {
              if (!obj.firedHover) {
                el.dispatchEvent(new CustomEvent('mouseenter'));
                obj.firedHover = true;
              }
              obj.justIntersected = false;
            } else {
              el.dispatchEvent(new CustomEvent('mouseleave'));
              delete this.intersectedEls[id];
            }
          }
        }
      })
  }
);
