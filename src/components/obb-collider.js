var registerComponent = require('../core/component').registerComponent;
var THREE = require('../lib/three');

registerComponent('obb-collider', {
  schema: {
    size: {default: 0},
    trackedObject3D: {default: ''},
    minimumColliderDimension: {default: 0.02},
    centerModel: {default: false}
  },

  init: function () {
    this.previousScale = new THREE.Vector3();
    this.auxEuler = new THREE.Euler();

    this.boundingBox = new THREE.Box3();
    this.boundingBoxSize = new THREE.Vector3();
    this.updateCollider = this.updateCollider.bind(this);

    this.onModelLoaded = this.onModelLoaded.bind(this);
    this.updateBoundingBox = this.updateBoundingBox.bind(this);

    this.el.addEventListener('model-loaded', this.onModelLoaded);
    this.updateCollider();
    this.system.addCollider(this.el);
  },

  remove: function () {
    this.system.removeCollider(this.el);
  },

  update: function () {
    if (this.data.trackedObject3D) {
      this.trackedObject3DPath = this.data.trackedObject3D.split('.');
    }
  },

  onModelLoaded: function () {
    if (this.data.centerModel) { this.centerModel(); }
    this.updateCollider();
  },

  centerModel: function () {
    var el = this.el;
    var model = el.components['gltf-model'] && el.components['gltf-model'].model;
    var box;
    var center;

    if (!model) { return; }
    this.el.removeObject3D('mesh');
    box = new THREE.Box3().setFromObject(model);
    center = box.getCenter(new THREE.Vector3());
    model.position.x += (model.position.x - center.x);
    model.position.y += (model.position.y - center.y);
    model.position.z += (model.position.z - center.z);
    this.el.setObject3D('mesh', model);
  },

  updateCollider: function () {
    var el = this.el;
    var boundingBoxSize = this.boundingBoxSize;
    var aabb = this.aabb = this.aabb || new THREE.OBB();
    this.obb = this.obb || new THREE.OBB();

    // Defer if entity has not yet loaded.
    if (!el.hasLoaded) {
      el.addEventListener('loaded', this.updateCollider);
      return;
    }

    this.updateBoundingBox();
    aabb.halfSize.copy(boundingBoxSize).multiplyScalar(0.5);

    if (this.el.sceneEl.systems['obb-collider'].data.showColliders) {
      this.showCollider();
    }
  },

  showCollider: function () {
    this.updateColliderMesh();
    this.renderColliderMesh.visible = true;
  },

  updateColliderMesh: function () {
    var renderColliderMesh = this.renderColliderMesh;
    var boundingBoxSize = this.boundingBoxSize;
    if (!renderColliderMesh) {
      this.initColliderMesh();
      return;
    }

    // Destroy current geometry.
    renderColliderMesh.geometry.dispose();
    renderColliderMesh.geometry = new THREE.BoxGeometry(boundingBoxSize.x, boundingBoxSize.y, boundingBoxSize.z);
  },

  hideCollider: function () {
    if (!this.renderColliderMesh) { return; }
    this.renderColliderMesh.visible = false;
  },

  initColliderMesh: function () {
    var boundingBoxSize;
    var renderColliderGeometry;
    var renderColliderMesh;

    boundingBoxSize = this.boundingBoxSize;
    renderColliderGeometry = this.renderColliderGeometry = new THREE.BoxGeometry(boundingBoxSize.x, boundingBoxSize.y, boundingBoxSize.z);
    renderColliderMesh = this.renderColliderMesh = new THREE.Mesh(renderColliderGeometry, new THREE.MeshLambertMaterial({color: 0x00ff00, side: THREE.DoubleSide}));
    renderColliderMesh.matrixAutoUpdate = false;
    renderColliderMesh.matrixWorldAutoUpdate = false;
    // THREE scene forces matrix world update even if matrixWorldAutoUpdate set to false.
    renderColliderMesh.updateMatrixWorld = function () { /* no op */ };
    this.el.sceneEl.object3D.add(renderColliderMesh);
  },

  updateBoundingBox: function () {
    var auxEuler = this.auxEuler;
    var boundingBox = this.boundingBox;
    var size = this.data.size;
    var trackedObject3D = this.trackedObject3D || this.el.object3D;
    var boundingBoxSize = this.boundingBoxSize;
    var minimumColliderDimension = this.data.minimumColliderDimension;

    // user defined size takes precedence.
    if (size) {
      this.boundingBoxSize.x = size;
      this.boundingBoxSize.y = size;
      this.boundingBoxSize.z = size;
      return;
    }

    this.previousScale.copy(trackedObject3D.scale);

    // Bounding box is created axis-aligned AABB.
    // If there's any local rotation the box will be bigger than expected.
    // It undoes the local entity rotation and then restores so box has the expected size.
    auxEuler.copy(trackedObject3D.rotation);
    trackedObject3D.rotation.set(0, 0, 0);

    trackedObject3D.updateMatrixWorld(true);
    boundingBox.setFromObject(trackedObject3D, true);
    boundingBox.getSize(boundingBoxSize);

    boundingBoxSize.x = boundingBoxSize.x < minimumColliderDimension ? minimumColliderDimension : boundingBoxSize.x;
    boundingBoxSize.y = boundingBoxSize.y < minimumColliderDimension ? minimumColliderDimension : boundingBoxSize.y;
    boundingBoxSize.z = boundingBoxSize.z < minimumColliderDimension ? minimumColliderDimension : boundingBoxSize.z;

    // Restore rotation.
    this.el.object3D.rotation.copy(auxEuler);
  },

  checkTrackedObject: function () {
    var trackedObject3DPath = this.trackedObject3DPath;
    var trackedObject3D;

    if (trackedObject3DPath &&
        trackedObject3DPath.length &&
        !this.trackedObject3D) {
      trackedObject3D = this.el;
      for (var i = 0; i < trackedObject3DPath.length; i++) {
        trackedObject3D = trackedObject3D[trackedObject3DPath[i]];
        if (!trackedObject3D) { break; }
      }
      if (trackedObject3D) {
        this.trackedObject3D = trackedObject3D;
        this.updateCollider();
      }
    }
    return this.trackedObject3D;
  },

  tick: (function () {
    var auxPosition = new THREE.Vector3();
    var auxScale = new THREE.Vector3();
    var auxQuaternion = new THREE.Quaternion();
    var auxMatrix = new THREE.Matrix4();

    return function () {
      var obb = this.obb;
      var renderColliderMesh = this.renderColliderMesh;
      var trackedObject3D = this.checkTrackedObject() || this.el.object3D;

      if (!trackedObject3D) { return; }

      // Recalculate collider if scale has changed.
      if (trackedObject3D.scale.x !== this.previousScale.x ||
          trackedObject3D.scale.y !== this.previousScale.y ||
          trackedObject3D.scale.z !== this.previousScale.z) {
        this.updateCollider();
      }

      trackedObject3D.updateMatrix();
      trackedObject3D.updateMatrixWorld();
      trackedObject3D.matrixWorld.decompose(auxPosition, auxQuaternion, auxScale);
      // reset scale, keep position and rotation
      auxScale.set(1, 1, 1);
      auxMatrix.compose(auxPosition, auxQuaternion, auxScale);
      // Update OBB visual representation.
      if (renderColliderMesh) { renderColliderMesh.matrixWorld.copy(auxMatrix); }

      // Reset OBB with AABB and apply entity matrix. applyMatrix4 changes OBB internal state.
      obb.copy(this.aabb);
      obb.applyMatrix4(auxMatrix);
    };
  })()
});
