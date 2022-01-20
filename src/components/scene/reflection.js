/* global THREE, XRWebGLBinding */
var register = require('../../core/component').registerComponent;
var COMPONENTS = require('../../core/component').components;

// source: view-source:https://storage.googleapis.com/chromium-webxr-test/r886480/proposals/lighting-estimation.html
function updateLights (estimate, probeLight, directionalLight, directionalLightPosition) {
  var intensityScalar =
    Math.max(1.0,
      Math.max(estimate.primaryLightIntensity.x,
        Math.max(estimate.primaryLightIntensity.y,
          estimate.primaryLightIntensity.z)));

  probeLight.sh.fromArray(estimate.sphericalHarmonicsCoefficients);
  probeLight.intensity = 1;

  directionalLight.color.setRGB(
    estimate.primaryLightIntensity.x / intensityScalar,
    estimate.primaryLightIntensity.y / intensityScalar,
    estimate.primaryLightIntensity.z / intensityScalar);

  directionalLight.intensity = intensityScalar;
  directionalLightPosition.copy(estimate.primaryLightDirection);
}

module.exports.Component = register('reflection', {
  schema: {
    directionalLight: { type: 'selector' }
  },
  init: function () {
    var self = this;
    this.cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, { generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter });
    this.lightProbeTarget = new THREE.WebGLCubeRenderTarget(16, { generateMipmaps: false });
    this.cubeCamera = new THREE.CubeCamera(0.1, 1000, this.cubeRenderTarget);
    this.needsVREnvironmentUpdate = true;
    this.timeSinceUpdate = 0;
    this.updateXRCubeMap = this.updateXRCubeMap.bind(this);

    // Update WebXR to support light-estimation
    var webxrData = this.el.getAttribute('webxr');
    var optionalFeaturesArray = webxrData.optionalFeatures;
    if (!optionalFeaturesArray.includes('light-estimation')) {
      optionalFeaturesArray.push('light-estimation');
      this.el.setAttribute('webxr', webxrData);
    }

    this.el.sceneEl.addEventListener('enter-vr', function () {
      var renderer = self.el.renderer;
      var session = renderer.xr.getSession();
      if (
        session.requestLightProbe && self.el.sceneEl.is('ar-mode')
      ) {
        self.startLightProbe();
      }
    });

    this.el.sceneEl.addEventListener('exit-vr', function () {
      self.stopLightProbe();
    });
  },
  stopLightProbe: function () {
    this.xrLightProbe = null;
    this.probeLight.components.light.light.intensity = 0;
    this.needsVREnvironmentUpdate = true;
  },
  startLightProbe: function () {
    this.needsLightProbeUpdate = true;
  },
  setupLightProbe: function () {
    var renderer = this.el.renderer;
    var xrSession = renderer.xr.getSession();
    var self = this;
    var gl = renderer.getContext();

    if (!this.probeLight) {
      var probeLight = document.createElement('a-light');
      probeLight.setAttribute('type', 'probe');
      probeLight.setAttribute('intensity', 0);
      this.el.appendChild(probeLight);
      this.probeLight = probeLight;
    }

    this.glBinding = new XRWebGLBinding(xrSession, gl);
    gl.getExtension('EXT_sRGB');
    gl.getExtension('OES_texture_half_float');

    xrSession.requestLightProbe()
      .then(function (lightProbe) {
        self.xrLightProbe = lightProbe;
        lightProbe.addEventListener('reflectionchange', self.updateXRCubeMap);
      })
      .catch(function (err) {
        console.warn('Lighting estimation not supported: ' + err.message);
        console.warn('Are you missing: webxr="optionalFeatures: light-estimation;" from <a-scene>?');
      });
  },
  updateXRCubeMap: function () {
    // Update Cube Map, cubeMap maybe some unavailable on some hardware
    var scene = this.el.object3D;
    var renderer = this.el.renderer;
    var cubeMap = this.glBinding.getReflectionCubeMap(this.xrLightProbe);
    if (cubeMap) {
      var rendererProps = renderer.properties.get(this.lightProbeTarget.texture);
      rendererProps.__webglTexture = cubeMap;
      scene.environment = this.lightProbeTarget.texture;
    }
  },
  tick: function () {
    var scene = this.el.object3D;
    var renderer = this.el.renderer;
    var frame = this.el.sceneEl.frame;

    if (frame && this.xrLightProbe) {
      // light estimate may not yet be available, it takes a few frames to start working
      var estimate = frame.getLightEstimate(this.xrLightProbe);

      if (estimate) {
        updateLights(
          estimate,
          this.probeLight.components.light.light,
          this.data.directionalLight.components.light.light,
          this.data.directionalLight.object3D.position
        );
      }
    }

    if (this.needsVREnvironmentUpdate) {
      this.needsVREnvironmentUpdate = false;
      this.cubeCamera.position.set(0, 1.6, 0);
      scene.environment = null;
      this.cubeCamera.update(renderer, scene);
      scene.environment = this.cubeRenderTarget.texture;
    }

    if (this.needsLightProbeUpdate && frame) {
      // wait until the XR Session has started before trying to make
      // the light probe
      this.setupLightProbe();
      this.needsLightProbeUpdate = false;
    }
  },

  remove: function () {
    var data = this.data;
    var object3D = this.el.object3D;
    if (data.transparent) {
      object3D.background = null;
      return;
    }
    object3D.background = COMPONENTS[this.name].schema.color.default;
  }
});
