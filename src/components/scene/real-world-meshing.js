/* global XRPlane */
import * as THREE from 'three';
import { registerComponent as register } from '../../core/component.js';

/**
 * Real World Meshing.
 *
 * Create entities with meshes corresponding to 3D surfaces detected in user's environment.
 * It requires a browser with support for the WebXR Mesh and Plane detection modules.
 *
 */
export var Component = register('real-world-meshing', {
  schema: {
    filterLabels: {type: 'array'},
    meshesEnabled: {default: true},
    meshMixin: {default: true},
    planesEnabled: {default: true},
    planeMixin: {default: ''}
  },

  sceneOnly: true,

  init: function () {
    var webxrData = this.el.getAttribute('webxr');
    var requiredFeaturesArray = webxrData.requiredFeatures;
    if (requiredFeaturesArray.indexOf('mesh-detection') === -1) {
      requiredFeaturesArray.push('mesh-detection');
      this.el.setAttribute('webxr', webxrData);
    }
    if (requiredFeaturesArray.indexOf('plane-detection') === -1) {
      requiredFeaturesArray.push('plane-detection');
      this.el.setAttribute('webxr', webxrData);
    }
    this.meshEntities = [];
    this.initWorldMeshEntity = this.initWorldMeshEntity.bind(this);
  },

  tick: function () {
    if (!this.el.is('ar-mode')) { return; }
    this.detectMeshes();
    this.updateMeshes();
  },

  detectMeshes: function () {
    var data = this.data;
    var detectedMeshes;
    var detectedPlanes;
    var sceneEl = this.el;
    var frame;
    var meshEntities = this.meshEntities;
    var present = false;
    var newMeshes = [];
    var filterLabels = this.data.filterLabels;

    frame = sceneEl.frame;
    detectedMeshes = frame.detectedMeshes;
    detectedPlanes = frame.detectedPlanes;

    for (var i = 0; i < meshEntities.length; i++) {
      meshEntities[i].present = false;
    }

    if (data.meshesEnabled) {
      for (var mesh of detectedMeshes.values()) {
        // Ignore meshes that don't match the filterLabels.
        if (filterLabels.length && filterLabels.indexOf(mesh.semanticLabel) === -1) { continue; }
        for (i = 0; i < meshEntities.length; i++) {
          if (mesh === meshEntities[i].mesh) {
            present = true;
            meshEntities[i].present = true;
            if (meshEntities[i].lastChangedTime < mesh.lastChangedTime) {
              this.updateMeshGeometry(meshEntities[i].el, mesh);
            }
            meshEntities[i].lastChangedTime = mesh.lastChangedTime;
            break;
          }
        }
        if (!present) { newMeshes.push(mesh); }
        present = false;
      }
    }

    if (data.planesEnabled) {
      for (mesh of detectedPlanes.values()) {
        // Ignore meshes that don't match the filterLabels.
        if (filterLabels.length && filterLabels.indexOf(mesh.semanticLabel) === -1) { continue; }
        for (i = 0; i < meshEntities.length; i++) {
          if (mesh === meshEntities[i].mesh) {
            present = true;
            meshEntities[i].present = true;
            if (meshEntities[i].lastChangedTime < mesh.lastChangedTime) {
              this.updateMeshGeometry(meshEntities[i].el, mesh);
            }
            meshEntities[i].lastChangedTime = mesh.lastChangedTime;
            break;
          }
        }
        if (!present) { newMeshes.push(mesh); }
        present = false;
      }
    }

    this.deleteMeshes();
    this.createNewMeshes(newMeshes);
  },

  updateMeshes: (function () {
    var auxMatrix = new THREE.Matrix4();
    return function () {
      var meshPose;
      var sceneEl = this.el;
      var meshEl;
      var frame = sceneEl.frame;
      var meshEntities = this.meshEntities;
      var referenceSpace = sceneEl.renderer.xr.getReferenceSpace();
      var meshSpace;
      for (var i = 0; i < meshEntities.length; i++) {
        meshSpace = meshEntities[i].mesh.meshSpace || meshEntities[i].mesh.planeSpace;
        meshPose = frame.getPose(meshSpace, referenceSpace);
        meshEl = meshEntities[i].el;
        if (!meshEl.hasLoaded) { continue; }
        auxMatrix.fromArray(meshPose.transform.matrix);
        auxMatrix.decompose(meshEl.object3D.position, meshEl.object3D.quaternion, meshEl.object3D.scale);
      }
    };
  })(),

  deleteMeshes: function () {
    var meshEntities = this.meshEntities;
    var newMeshEntities = [];
    for (var i = 0; i < meshEntities.length; i++) {
      if (!meshEntities[i].present) {
        this.el.removeChild(meshEntities[i]);
      } else {
        newMeshEntities.push(meshEntities[i]);
      }
    }
    this.meshEntities = newMeshEntities;
  },

  createNewMeshes: function (newMeshes) {
    var meshEl;
    for (var i = 0; i < newMeshes.length; i++) {
      meshEl = document.createElement('a-entity');
      this.meshEntities.push({
        mesh: newMeshes[i],
        el: meshEl
      });
      meshEl.addEventListener('loaded', this.initWorldMeshEntity);
      this.el.appendChild(meshEl);
    }
  },

  initMeshGeometry: function (mesh) {
    var geometry;
    var shape;
    var polygon;

    if (mesh instanceof XRPlane) {
      shape = new THREE.Shape();
      polygon = mesh.polygon;
      for (var i = 0; i < polygon.length; ++i) {
        if (i === 0) {
          shape.moveTo(polygon[i].x, polygon[i].z);
        } else {
          shape.lineTo(polygon[i].x, polygon[i].z);
        }
      }
      geometry = new THREE.ShapeGeometry(shape);
      geometry.rotateX(Math.PI / 2);
      return geometry;
    }

    geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(mesh.vertices, 3)
    );
    geometry.setIndex(new THREE.BufferAttribute(mesh.indices, 1));
    return geometry;
  },

  initWorldMeshEntity: function (evt) {
    var el = evt.target;
    var geometry;
    var mesh;
    var meshEntity;
    var meshEntities = this.meshEntities;
    for (var i = 0; i < meshEntities.length; i++) {
      if (meshEntities[i].el === el) {
        meshEntity = meshEntities[i];
        break;
      }
    }
    geometry = this.initMeshGeometry(meshEntity.mesh);
    mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color: Math.random() * 0xFFFFFF, side: THREE.DoubleSide}));
    el.setObject3D('mesh', mesh);
    if (meshEntity.mesh instanceof XRPlane && this.data.planeMixin) {
      el.setAttribute('mixin', this.data.planeMixin);
    } else {
      if (this.data.meshMixin) {
        el.setAttribute('mixin', this.data.meshMixin);
      }
    }
    el.setAttribute('data-world-mesh', meshEntity.mesh.semanticLabel);
  },

  updateMeshGeometry: function (entityEl, mesh) {
    var entityMesh = entityEl.getObject3D('mesh');
    entityMesh.geometry.dispose();
    entityMesh.geometry = this.initMeshGeometry(mesh);
  }
});
