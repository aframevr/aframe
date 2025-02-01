/* global THREE */
/**
 * Unreal Bloom Effect
 * Implementation for A-Frame
 * Code modified from Akbartus's post-processing A-Frame integration
 * https://github.com/akbartus/A-Frame-Component-Postprocessing
 */

import AFRAME from "aframe";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

AFRAME.registerComponent("bloom", {
  schema: {
    threshold: { type: "number", default: 1 },
    strength: { type: "number", default: 0.5 },
    radius: { type: "number", default: 1 },
  },
  events: {
    rendererresize: function () {
      this.renderer.getSize(this.size);
      this.composer.setSize(this.size.width, this.size.height);
    },
    "enter-vr": function () {
      this.renderer.getSize(this.size);
      this.composer.setSize(this.size.width, this.size.height);
    },
  },
  init() {
    this.size = new THREE.Vector2();
    this.scene = this.el.object3D;
    this.renderer = this.el.renderer;
    this.camera = this.el.camera;
    this.bind();
  },
  update: function () {
    if (this.composer) {
      this.composer.dispose();
    }
    // create composer with multisampling to avoid aliasing
    const resolution = this.renderer.getDrawingBufferSize(new THREE.Vector2());
    const renderTarget = new THREE.WebGLRenderTarget(
      resolution.width,
      resolution.height,
      { type: THREE.HalfFloatType, samples: 8 }
    );

    this.composer = new EffectComposer(this.renderer, renderTarget);

    const renderScene = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderScene);

    // creating bloom pass
    const strength = this.data.strength;
    const radius = this.data.radius;
    const threshold = this.data.threshold;
    if (this.bloomPass) {
      this.bloomPass.dispose();
    }
    this.bloomPass = new UnrealBloomPass(
      resolution,
      strength,
      radius,
      threshold
    );

    const fsQuadRender = function (renderer) {
      // Disable XR projection for fullscreen effects
      // https://github.com/mrdoob/three.js/pull/18846
      const xrEnabled = renderer.xr.enabled;
      const _camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      renderer.xr.enabled = false;
      renderer.render(this._mesh, _camera);
      renderer.xr.enabled = xrEnabled;
    };
    this.bloomPass.fsQuad.render = fsQuadRender;

    this.composer.addPass(this.bloomPass);

    if (this.outputPass) {
      this.outputPass.dispose();
    }
    this.outputPass = new OutputPass(THREE.AgXToneMapping);
    this.outputPass.fsQuad.render = fsQuadRender;
    this.composer.addPass(this.outputPass);
  },

  bind: function () {
    this.originalRender = this.el.renderer.render;
    const self = this;
    let isInsideComposerRender = false;

    this.el.renderer.render = function () {
      if (isInsideComposerRender) {
        self.originalRender.apply(this, arguments);
      } else {
        isInsideComposerRender = true;
        self.composer.render(self.el.sceneEl.delta / 1000);
        isInsideComposerRender = false;
      }
    };
  },

  remove() {
    this.el.renderer.render = this.originalRender;
    this.bloomPass.dispose();
    this.outputPass.dispose();
    this.composer.dispose();
  },
});
