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

module.exports.Component = register('background', {
  schema: {
    color: { type: 'color', default: 'black' },
    transparent: { default: false },
    generateEnvironment: { default: true },
    directionalLight: { type: 'selector' }
  },
  init: function () {
    var self = this;

    this.pmremGenerator = new THREE.PMREMGenerator(this.el.renderer);
    this.pmremGenerator.compileCubemapShader();
    this.cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, { format: THREE.RGBFormat, generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter });
    this.lightProbeTarget = new THREE.WebGLCubeRenderTarget(16, { format: THREE.RGBFormat, generateMipmaps: false });
    this.cubeCamera = new THREE.CubeCamera(0.1, 1000, this.cubeRenderTarget);
    this.needsEnvironmentUpdate = true;
    this.timeSinceUpdate = 0;

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
    var data = this.data;
    var scene = this.el.sceneEl.object3D;
    this.xrLightProbe = null;

    this.probeLight.components.light.light.intensity = 0;
    if (this.ownDirectionalLight) {
      this.ownDirectionalLight.components.light.light.intensity = 0;
    }

    if (data.generateEnvironment) {
      this.needsEnvironmentUpdate = true;
    } else {
      scene.environment = null;
    }
  },
  setupLightsForLightingEstimation: function () {
    // Make a directionalLight if required
    if (this.data.directionalLight) {
      this.directionalLight = this.data.directionalLight;
    } else {
      var directionalLight = this.ownDirectionalLight || document.createElement('a-light');
      directionalLight.setAttribute('type', 'directional');
      directionalLight.setAttribute('intensity', 0);
      this.el.appendChild(directionalLight);
      this.directionalLight = directionalLight;
      this.ownDirectionalLight = directionalLight;
    }

    if (!this.probeLight) {
      var probeLight = document.createElement('a-light');
      probeLight.setAttribute('type', 'probe');
      probeLight.setAttribute('intensity', 0);
      this.el.appendChild(probeLight);
      this.probeLight = probeLight;
    }
  },
  startLightProbe: function () {
    var data = this.data;
    var scene = this.el.sceneEl.object3D;

    if (data.generateEnvironment) {
      this.needsLightProbeUpdate = true;
      this.needsEnvironmentUpdate = true;
    } else {
      scene.environment = null;
    }
  },
  setupLightProbe: function () {
    var scene = this.el.object3D;
    var renderer = this.el.renderer;
    var xrSession = renderer.xr.getSession();
    var self = this;
    var gl = renderer.getContext();

    this.setupLightsForLightingEstimation();

    this.glBinding = new XRWebGLBinding(xrSession, gl);
    gl.getExtension('EXT_sRGB');
    gl.getExtension('OES_texture_half_float');

    xrSession.requestLightProbe()
      .then(function (lightProbe) {
        scene.environment = self.lightProbeTarget.texture;

        self.xrLightProbe = lightProbe;
        lightProbe.addEventListener('reflectionchange', function onReflectionChanged () {
          self.needsEnvironmentUpdate = true;
        });
      })
      .catch(function (err) {
        console.warn('Lighting estimation not supported: ' + err.message);
        console.warn('Are you missing: webxr="optionalFeatures: light-estimation;" from <a-scene>?');
      });
  },
  update: function () {
    var scene = this.el.sceneEl.object3D;
    var data = this.data;
    var object3D = this.el.object3D;

    if (data.transparent) {
      object3D.background = null;
    } else {
      object3D.background = new THREE.Color(data.color);
    }

    if (data.generateEnvironment) {
      this.needsEnvironmentUpdate = true;
    } else {
      scene.environment = null;
    }
  },

  updateXRCubeMap: function () {
    // Update Cube Map, cubeMap maybe some unavailable on some hardware
    var renderer = this.el.renderer;
    var cubeMap = this.glBinding.getReflectionCubeMap(this.xrLightProbe);
    if (cubeMap) {
      var rendererProps = renderer.properties.get(this.lightProbeTarget.texture);
      rendererProps.__webglTexture = cubeMap;
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
          this.directionalLight.components.light.light,
          this.directionalLight.object3D.position
        );
      }
    }

    if (!this.needsEnvironmentUpdate) {
      return;
    }

    if (this.needsLightProbeUpdate) {
      // wait until the XR Session has started before trying to make
      // the light probe
      if (!frame) {
        return;
      }
      this.needsLightProbeUpdate = false;
      this.setupLightProbe();
    }

    if (this.xrLightProbe) {
      this.updateXRCubeMap();
    } else {
      this.cubeCamera.position.set(0, 1.6, 0);
      scene.environment = null;
      this.cubeCamera.update(renderer, scene);
      scene.environment = this.pmremGenerator.fromCubemap(
        this.cubeRenderTarget.texture
      ).texture;
    }

    this.needsEnvironmentUpdate = false;
  },

  remove: function () {
    var data = this.data;
    var object3D = this.el.object3D;
    if (data.transparent) {
      object3D.background = null;
      return;
    }
    this.pmremGenerator.dispose();
    object3D.background = COMPONENTS[this.name].schema.color.default;
  }
});
