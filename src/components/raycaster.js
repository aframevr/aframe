var registerComponent = require('../core/component').registerComponent;
var THREE = require('../lib/three');
var bind = require('../utils/').bind;

var scaleDummy = new THREE.Vector3();

/**
 * Raycaster component.
 *
 * Pass options to three.js Raycaster including which objects to test.
 * Poll for intersections.
 * Emit event on origin entity and on target entity on intersect.
 *
 * @member {array} intersectedEls - List of currently intersected entities.
 * @member {array} objects - Cached list of meshes to intersect.
 * @member {number} prevCheckTime - Previous time intersection was checked. To help interval.
 * @member {object} raycaster - three.js Raycaster.
 */
module.exports.Component = registerComponent('raycaster', {
  schema: {
    far: {default: Infinity}, // Infinity.
    interval: {default: 100},
    near: {default: 0},
    objects: {default: ''},
    recursive: {default: true}
  },

  init: function () {
    this.direction = new THREE.Vector3();
    this.intersectedEls = [];
    this.objects = null;
    this.prevCheckTime = undefined;
    this.raycaster = new THREE.Raycaster();
    this.updateOriginDirection();
    this.refreshObjects = bind(this.refreshObjects, this);
  },

  play: function () {
    this.el.sceneEl.addEventListener('child-attached', this.refreshObjects);
    this.el.sceneEl.addEventListener('child-detached', this.refreshObjects);
  },

  pause: function () {
    this.el.sceneEl.removeEventListener('child-attached', this.refreshObjects);
    this.el.sceneEl.removeEventListener('child-detached', this.refreshObjects);
  },

  /**
   * Create or update raycaster object.
   */
  update: function () {
    var data = this.data;
    var raycaster = this.raycaster;

    // Set raycaster properties.
    raycaster.far = data.far;
    raycaster.near = data.near;

    this.refreshObjects();
  },

  /**
   * Update list of objects to test for intersection.
   */
  refreshObjects: function () {
    var data = this.data;
    var i;
    var objectEls;

    // Push meshes onto list of objects to intersect.
    if (data.objects) {
      objectEls = this.el.sceneEl.querySelectorAll(data.objects);
      this.objects = [];
      for (i = 0; i < objectEls.length; i++) {
        this.objects.push(objectEls[i].object3D);
      }
      return;
    }

    // If objects not defined, intersect with everything.
    this.objects = this.el.sceneEl.object3D.children;
  },

  /**
   * Check for intersections and cleared intersections on an interval.
   */
  tick: function (time) {
    var el = this.el;
    var data = this.data;
    var intersectedEls;
    var intersections;
    var prevCheckTime = this.prevCheckTime;
    var prevIntersectedEls;

    // Only check for intersection if interval time has passed.
    if (prevCheckTime && (time - prevCheckTime < data.interval)) { return; }

    // Store old previously intersected entities.
    prevIntersectedEls = this.intersectedEls.slice();

    // Raycast.
    this.updateOriginDirection();
    intersections = this.raycaster.intersectObjects(this.objects, data.recursive);

    // Only keep intersections against objects that have a reference to an entity.
    intersections = intersections.filter(function hasEl (intersection) {
      return !!intersection.object.el;
    });

    // Update intersectedEls.
    intersectedEls = this.intersectedEls = intersections.map(function getEl (intersection) {
      return intersection.object.el;
    });

    // Emit intersected on intersected entity per intersected entity.
    intersections.forEach(function emitEvents (intersection) {
      var intersectedEl = intersection.object.el;
      intersectedEl.emit('raycaster-intersected', {el: el, intersection: intersection});
    });

    // Emit all intersections at once on raycasting entity.
    if (intersections.length) {
      el.emit('raycaster-intersection', {
        els: intersectedEls,
        intersections: intersections
      });
    }

    // Emit intersection cleared on both entities per formerly intersected entity.
    prevIntersectedEls.forEach(function checkStillIntersected (intersectedEl) {
      if (intersectedEls.indexOf(intersectedEl) !== -1) { return; }
      el.emit('raycaster-intersection-cleared', {el: intersectedEl});
      intersectedEl.emit('raycaster-intersected-cleared', {el: el});
    });
  },

  /**
   * Set origin and direction of raycaster using entity position and rotation.
   */
  updateOriginDirection: (function () {
    var directionHelper = new THREE.Quaternion();
    var originVec3 = new THREE.Vector3();

    // Closure to make quaternion/vector3 objects private.
    return function updateOriginDirection () {
      var el = this.el;
      var object3D = el.object3D;

      // Update matrix world.
      object3D.updateMatrixWorld();
      // Grab the position and rotation.
      object3D.matrixWorld.decompose(originVec3, directionHelper, scaleDummy);
      // Apply rotation to a 0, 0, -1 vector.
      this.direction.set(0, 0, -1);
      this.direction.applyQuaternion(directionHelper);

      this.raycaster.set(originVec3, this.direction);
    };
  })()
});
