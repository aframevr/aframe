/* global ImageData, Map */
var arrowURL = 'data:image/webp;base64,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';
var register = require('../../core/component').registerComponent;
var THREE = require('../../lib/three');
var CAM_LAYER = 21;

function HitTest (renderer, options) {
  this.renderer = renderer;
  this.xrHitTestSource = null;

  renderer.xr.addEventListener('sessionend', function () {
    this.xrHitTestSource = null;
  }.bind(this));
  renderer.xr.addEventListener('sessionstart', function () {
    this.sessionStart(options);
  }.bind(this));

  if (this.renderer.xr.isPresenting) {
    this.sessionStart(options);
  }
}

HitTest.prototype.sessionStart = function sessionStart (options) {
  this.session = this.renderer.xr.getSession();
  try {
    if (options.space) {
      this.session.requestHitTestSource(options)
      .then(function (xrHitTestSource) {
        this.xrHitTestSource = xrHitTestSource;
      }.bind(this));
    } else if (options.profile) {
      this.session.requestHitTestSourceForTransientInput(options)
      .then(function (xrHitTestSource) {
        this.xrHitTestSource = xrHitTestSource;
        this.transient = true;
      }.bind(this));
    }
  } catch (e) {
    console.warn('Cannot requestHitTestSource Are you missing: webxr="optionalFeatures: hit-test;" from <a-scene>?');
  }
};

HitTest.prototype.doHit = function doHit (frame) {
  if (!this.renderer.xr.isPresenting) {
    return;
  }
  var refSpace = this.renderer.xr.getReferenceSpace();
  var xrViewerPose = frame.getViewerPose(refSpace);
  var hitTestResults;
  var results;

  if (this.xrHitTestSource && xrViewerPose) {
    if (this.transient) {
      hitTestResults = frame.getHitTestResultsForTransientInput(this.xrHitTestSource);
      if (hitTestResults.length > 0) {
        results = hitTestResults[0].results;
        if (results.length > 0) {
          return results[0].getPose(refSpace);
        } else {
          return false;
        }
      } else {
        return false;
      }
    } else {
      hitTestResults = frame.getHitTestResults(this.xrHitTestSource);
      if (hitTestResults.length > 0) {
        return hitTestResults[0].getPose(refSpace);
      } else {
        return false;
      }
    }
  }
};

var hitTestCache;
var tempVec3 = new THREE.Vector3();
module.exports.Component = register('ar-hit-test', {
  schema: {
    target: { type: 'selector' },
    enabled: { default: true },
    src: {
      default: arrowURL,
      type: 'map'
    },
    type: {
      default: 'footprint',
      oneOf: ['footprint', 'map']
    },
    footprintDepth: {
      default: 0.1
    }
  },

  init: function () {
    this.hitTest = null;
    this.imageDataArray = new Uint8ClampedArray(512 * 512 * 4);
    this.imageData = new ImageData(this.imageDataArray, 512, 512);

    this.textureCache = new Map();

    this.orthoCam = new THREE.OrthographicCamera();
    this.orthoCam.layers.set(CAM_LAYER);
    this.textureTarget = new THREE.WebGLRenderTarget(512, 512, {});
    this.basicMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000
    });
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
    this.canvas.width = 512;
    this.canvas.height = 512;
    this.canvasTexture = new THREE.CanvasTexture(this.canvas, {
      alpha: true
    });

    this.el.sceneEl.renderer.xr.addEventListener('sessionend', function () {
      this.hitTest = null;
    }.bind(this));

    this.el.sceneEl.renderer.xr.addEventListener('sessionstart', function () {
      var renderer = this.el.sceneEl.renderer;
      var session = this.session = renderer.xr.getSession();
      this.hasPosedOnce = false;
      this.bboxMesh.visible = true;

      // Default to selecting through the face
      session.requestReferenceSpace('viewer')
      .then(function (viewerSpace) {
        this.hitTest = new HitTest(renderer, {
          space: viewerSpace
        });

        this.el.emit('ar-hit-test-start');
      }.bind(this));

      // These are transient inputs so need to be handled seperately
      var profileToSupport = 'generic-touchscreen';
      var transientHitTest = new HitTest(renderer, {
        profile: profileToSupport
      });

      session.addEventListener('selectstart', function (e) {
        if (this.data.enabled !== true) {
          return;
        }

        var inputSource = e.inputSource;

        /* window.Map is present in any browser that can reach this code */
        if (!hitTestCache) {
          hitTestCache = new window.Map();
        }

        this.bboxMesh.visible = true;

        if (this.hasPosedOnce === true) {
          this.el.emit('ar-hit-test-select-start', {
            inputSource: inputSource,
            position: this.bboxMesh.position,
            orientation: this.bboxMesh.quaternion
          });

          if (inputSource.profiles[0] === profileToSupport) {
            this.hitTest = transientHitTest;
          } else {
            this.hitTest = hitTestCache.get(inputSource) || new HitTest(renderer, {
              space: inputSource.targetRaySpace
            });
            hitTestCache.set(inputSource, this.hitTest);
          }
        }
      }.bind(this));

      session.addEventListener('selectend', function (e) {
        this.hitTest = null;
        if (this.data.enabled !== true) {
          return;
        }

        var inputSource = e.inputSource;
        var target;

        if (this.hasPosedOnce === true) {
          this.el.emit('ar-hit-test-select', {
            inputSource: inputSource,
            position: this.bboxMesh.position,
            orientation: this.bboxMesh.quaternion
          });
          this.bboxMesh.visible = false;

          if (this.data.target) {
            target = this.data.target;
            target.object3D.quaternion.copy(this.bboxMesh.quaternion);
            target.object3D.position.copy(this.bboxMesh.position);

            tempVec3.copy(this.bboxOffset);
            tempVec3.applyQuaternion(this.bboxMesh.quaternion);
            target.object3D.position.sub(tempVec3);
            target.object3D.visible = true;
          }
        }
      }.bind(this));
    }.bind(this));

    this.bboxOffset = new THREE.Vector3();
    this.update = this.update.bind(this);
    this.makeBBox();
  },
  update: function () {
    this.bboxNeedsUpdate = true;
    this.data.target.object3D.layers.enable(CAM_LAYER);
    this.data.target.object3D.traverse(function (child) {
      child.layers.enable(CAM_LAYER);
    });
    this.data.target.removeEventListener('model-loaded', this.update);
    this.data.target.addEventListener('model-loaded', this.update);
  },
  makeBBox: function () {
    var geometry = new THREE.PlaneGeometry(1, 1);
    var material = new THREE.MeshBasicMaterial({
      transparent: true
    });
    geometry.rotateX(-Math.PI / 2);
    this.bbox = new THREE.Box3();
    this.bboxMesh = new THREE.Mesh(geometry, material);
    this.bboxMesh.visible = false;
    this.el.setObject3D('ar-hit-test', this.bboxMesh);
  },
  updateFootprint: function () {
    var renderer = this.el.sceneEl.renderer;
    var oldRenderTarget, oldBackground;
    this.bboxMesh.material.map = this.canvasTexture;
    this.bboxMesh.material.needsUpdate = true;
    this.orthoCam.rotation.set(-Math.PI / 2, 0, 0);
    this.orthoCam.position.copy(this.bboxMesh.position);
    this.orthoCam.position.y -= this.bboxMesh.scale.y / 2;
    this.orthoCam.near = 0.1;
    this.orthoCam.far = this.orthoCam.near + (this.data.footprintDepth * this.bboxMesh.scale.y);
    this.orthoCam.position.y += this.orthoCam.far;
    this.orthoCam.right = this.bboxMesh.scale.x / 2;
    this.orthoCam.left = -this.bboxMesh.scale.x / 2;
    this.orthoCam.top = this.bboxMesh.scale.z / 2;
    this.orthoCam.bottom = -this.bboxMesh.scale.z / 2;
    this.orthoCam.updateProjectionMatrix();

    oldRenderTarget = renderer.getRenderTarget();
    renderer.setRenderTarget(this.textureTarget);
    oldBackground = this.el.object3D.background;
    this.el.object3D.overrideMaterial = this.basicMaterial;
    this.el.object3D.background = null;
    renderer.render(this.el.object3D, this.orthoCam);
    this.el.object3D.background = oldBackground;
    this.el.object3D.overrideMaterial = null;
    renderer.setRenderTarget(oldRenderTarget);
    renderer.readRenderTargetPixels(this.textureTarget, 0, 0, 512, 512, this.imageDataArray);

    this.ctx.putImageData(this.imageData, 0, 0);
    this.ctx.shadowColor = 'white';
    this.ctx.shadowBlur = 10;
    this.ctx.drawImage(this.canvas, 0, 0);
    var tempImageData = this.ctx.getImageData(0, 0, 512, 512);
    for (var i = 0; i < 512 * 512; i++) {
      // if it's a little bit transparent but not opaque make it middle transparent
      if (tempImageData.data[ i * 4 + 3 ] !== 0 && tempImageData.data[ i * 4 + 3 ] !== 255) {
        tempImageData.data[ i * 4 + 3 ] = 128;
      }
    }
    this.ctx.putImageData(tempImageData, 0, 0);
    this.canvasTexture.needsUpdate = true;
  },
  tick: function () {
    var pose;
    var frame = this.el.sceneEl.frame;

    if (this.bboxNeedsUpdate) {
      this.bboxNeedsUpdate = false;

      if (!this.data.target || this.data.type === 'map') {
        var texture;
        if (this.textureCache.has(this.data.src)) {
          texture = this.textureCache.get(this.data.src);
        } else {
          texture = new THREE.TextureLoader().load(this.data.src);
          this.textureCache.set(this.data.src, texture);
        }
        this.bboxMesh.material.map = texture;
        this.bboxMesh.material.needsUpdate = true;
      }

      if (this.data.target) {
        this.bbox.setFromObject(this.data.target.object3D);
        this.bbox.getCenter(this.bboxMesh.position);
        this.bbox.getSize(this.bboxMesh.scale);

        if (this.data.type === 'footprint') {
          // Add a little buffer for the footprint border
          this.bboxMesh.scale.x *= 1.04;
          this.bboxMesh.scale.z *= 1.04;
          this.updateFootprint();
        }

        this.bboxMesh.position.y -= this.bboxMesh.scale.y / 2;
        this.bboxOffset.copy(this.bboxMesh.position);
        this.bboxOffset.sub(this.data.target.object3D.position);
      }
    }

    if (this.hitTest) {
      pose = this.hitTest.doHit(frame);
      if (pose) {
        if (this.hasPosedOnce !== true) {
          this.hasPosedOnce = true;
          this.el.emit('ar-hit-test-achieved');
        }
        this.bboxMesh.visible = true;
        this.bboxMesh.position.copy(pose.transform.position);
        this.bboxMesh.quaternion.copy(pose.transform.orientation);
      }
    }
  }
});
