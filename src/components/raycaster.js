var registerComponent = require('../core/component').registerComponent;
var THREE = require('../lib/three');
var utils = require('../utils/');

var bind = utils.bind;

var dummyVec = new THREE.Vector3();

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
    direction: {type: 'vec3', default: {x: 0, y: 0, z: -1}},
    far: {default: 1000},
    interval: {default: 100},
    near: {default: 0},
    objects: {default: ''},
    origin: {type: 'vec3'},
    recursive: {default: true},
    showLine: {default: false},
    useWorldCoordinates: {default: false}
  },

  init: function () {
    // Calculate unit vector for line direction. Can be multiplied via scalar to performantly
    // adjust line length.
    this.lineData = {};
    this.lineEndVec3 = new THREE.Vector3();
    this.unitLineEndVec3 = new THREE.Vector3();
    this.intersectedEls = [];
    this.objects = null;
    this.prevCheckTime = undefined;
    this.prevIntersectedEls = [];
    this.raycaster = new THREE.Raycaster();
    this.updateOriginDirection();
    this.refreshObjects = bind(this.refreshObjects, this);
    this.refreshOnceChildLoaded = bind(this.refreshOnceChildLoaded, this);
  },

  /**
   * Create or update raycaster object.
   */
  update: function (oldData) {
    var data = this.data;
    var el = this.el;
    var raycaster = this.raycaster;

    // Set raycaster properties.
    raycaster.far = data.far;
    raycaster.near = data.near;

    // Draw line.
    if (data.showLine &&
        (data.far !== oldData.far || data.origin !== oldData.origin ||
         data.direction !== oldData.direction)) {
      this.unitLineEndVec3.copy(data.origin).add(data.direction).normalize();
      this.drawLine();
    }
    if (!data.showLine && oldData.showLine) {
      el.removeAttribute('line');
    }

    this.refreshObjects();
  },

  play: function () {
    this.el.sceneEl.addEventListener('loaded', this.refreshObjects);
    this.el.sceneEl.addEventListener('child-attached', this.refreshOnceChildLoaded);
    this.el.sceneEl.addEventListener('child-detached', this.refreshObjects);
  },

  pause: function () {
    this.el.sceneEl.removeEventListener('loaded', this.refreshObjects);
    this.el.sceneEl.removeEventListener('child-attached', this.refreshOnceChildLoaded);
    this.el.sceneEl.removeEventListener('child-detached', this.refreshObjects);
  },

  remove: function () {
    if (this.data.showLine) {
      this.el.removeAttribute('line');
    }
  },

  /**
   * Update list of objects to test for intersection once child is loaded.
   */
  refreshOnceChildLoaded: function (evt) {
    var self = this;
    var childEl = evt.detail.el;
    if (!childEl) { return; }
    if (childEl.hasLoaded) {
      this.refreshObjects();
    } else {
      childEl.addEventListener('loaded', function nowRefresh (evt) {
        childEl.removeEventListener('loaded', nowRefresh);
        self.refreshObjects();
      });
    }
  },

  /**
   * Update list of objects to test for intersection.
   */
  refreshObjects: function () {
    var children;
    var data = this.data;
    var i;
    var objects;
    // Target entities.
    var targetEls = data.objects ? this.el.sceneEl.querySelectorAll(data.objects) : null;

    // Push meshes onto list of objects to intersect.
    if (targetEls) {
      objects = [];
      for (i = 0; i < targetEls.length; i++) {
        objects.push(targetEls[i].object3D);
      }
    } else {
      // If objects not defined, intersect with everything.
      objects = this.el.sceneEl.object3D.children;
    }

    this.objects = [];
    for (i = 0; i < objects.length; i++) {
      // A-Frame wraps everything in THREE.Group. Grab the children.
      children = objects[i].children;

      // Add the object3D children for non-recursive raycasting.
      // If no children, refresh after entity loaded.
      if (children) { this.objects.push.apply(this.objects, children); }
    }
  },

  /**
   * Check for intersections and cleared intersections on an interval.
   */
  tick: function (time) {
    var el = this.el;
    var data = this.data;
    var i;
    var intersectedEls = this.intersectedEls;
    var intersections;
    var lineLength;
    var prevCheckTime = this.prevCheckTime;
    var prevIntersectedEls = this.prevIntersectedEls;

    // Only check for intersection if interval time has passed.
    if (prevCheckTime && (time - prevCheckTime < data.interval)) { return; }
    // Update check time.
    this.prevCheckTime = time;

    // Store old previously intersected entities.
    copyArray(this.prevIntersectedEls, this.intersectedEls);

    // Raycast.
    this.updateOriginDirection();
    intersections = this.raycaster.intersectObjects(this.objects, data.recursive);

    // Only keep intersections against objects that have a reference to an entity.
    intersections = intersections.filter(function hasEl (intersection) {
      // Don't intersect with own line.
      if (data.showLine && intersection.object === el.getObject3D('line')) { return false; }
      return !!intersection.object.el;
    });

    // Update intersectedEls.
    intersectedEls.length = intersections.length;
    for (i = 0; i < intersections.length; i++) {
      intersectedEls[i] = intersections[i].object.el;
    }

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

    // Update line length.
    if (data.showLine) {
      if (intersections.length) {
        if (intersections[0].object.el === el && intersections[1]) {
          lineLength = intersections[1].distance;
        } else {
          lineLength = intersections[0].distance;
        }
      }
      this.drawLine(lineLength);
    }
  },

  /**
   * Update origin and direction of raycaster using entity transforms and supplied origin or
   * direction offsets.
   */
  updateOriginDirection: (function () {
    var direction = new THREE.Vector3();
    var quaternion = new THREE.Quaternion();
    var originVec3 = new THREE.Vector3();

    // Closure to make quaternion/vector3 objects private.
    return function updateOriginDirection () {
      var el = this.el;
      var data = this.data;

      if (data.useWorldCoordinates) {
        this.raycaster.set(data.origin, data.direction);
        return;
      }

      // Grab the position and rotation.
      el.object3D.updateMatrixWorld();
      el.object3D.matrixWorld.decompose(originVec3, quaternion, dummyVec);

      // If non-zero origin, translate the origin into world space.
      if (data.origin.x !== 0 || data.origin.y !== 0 || data.origin.z !== 0) {
        originVec3 = el.object3D.localToWorld(originVec3.copy(data.origin));
      }

      // three.js raycaster direction is relative to 0, 0, 0 NOT the origin / offset we
      // provide. Apply the offset to the direction, then rotation from the object,
      // and normalize.
      direction.copy(data.direction).add(data.origin).applyQuaternion(quaternion).normalize();

      // Apply offset and direction, in world coordinates.
      this.raycaster.set(originVec3, direction);
    };
  })(),

  /**
   * Create or update line to give raycaster visual representation.
   * Customize the line through through line component.
   * We draw the line in the raycaster component to customize the line to the
   * raycaster's origin, direction, and far.
   *
   * Unlike the raycaster, we create the line as a child of the object. The line will
   * be affected by the transforms of the objects, so we don't have to calculate transforms
   * like we do with the raycaster.
   *
   * @param {number} length - Length of line. Pass in to shorten the line to the intersection
   *   point. If not provided, length will default to the max length, `raycaster.far`.
   */
  drawLine: (function (length) {
    var lineEndVec3 = new THREE.Vector3();
    var lineData = {};

    return function (length) {
      var data = this.data;
      var el = this.el;

      // Treat Infinity as 1000m for the line.
      if (length === undefined) {
        length = data.far === Infinity ? 1000 : data.far;
      }

      // Update the length of the line if given. `unitLineEndVec3` is the direction
      // given by data.direction, then we apply a scalar to give it a length.
      lineData.start = data.origin;
      lineData.end = lineEndVec3.copy(this.unitLineEndVec3).multiplyScalar(length);
      el.setAttribute('line', lineData);
    };
  })()
});

/**
 * Copy contents of one array to another without allocating new array.
 */
function copyArray (a, b) {
  var i;
  a.length = b.length;
  for (i = 0; i < b.length; i++) {
    a[i] = b[i];
  }
}
