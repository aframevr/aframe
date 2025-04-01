/* global THREE */
/**
 * Unreal Bloom Effect
 * Implementation for A-Frame
 * Code modified from Akbartus's post-processing A-Frame integration
 * https://github.com/akbartus/A-Frame-Component-Postprocessing
 */

import AFRAME from 'aframe';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

AFRAME.registerComponent('bloom', {
  schema: {
    enabled: { type: 'boolean', default: true },
    threshold: { type: 'number', default: 1 },
    strength: { type: 'number', default: 0.5 },
    radius: { type: 'number', default: 1 }
  },
  events: {
    rendererresize: function () {
      if (!this.composer) { return; }
      this.renderer.getSize(this.size);
      this.composer.setSize(this.size.width, this.size.height);
    }
  },
  init: function () {
    this.size = new THREE.Vector2();
    this.scene = this.el.object3D;
    this.renderer = this.el.renderer;
    this.originalRender = this.el.renderer.render;
    if (this.data.enabled) {
      this.bind();
    }
  },
  update: function (oldData) {
    if (oldData.enabled === false && this.data.enabled === true) {
      this.bind();
    }

    if (oldData.enabled === true && this.data.enabled === false) {
      this.el.renderer.render = this.originalRender;
    }

    if (!this.data.enabled) { return; }

    if (this.composer) {
      this.composer.dispose();
    }
    // create composer with multisampling to avoid aliasing
    var resolution = this.renderer.getDrawingBufferSize(new THREE.Vector2());
    var renderTarget = new THREE.WebGLRenderTarget(
      resolution.width,
      resolution.height,
      { type: THREE.HalfFloatType, samples: 8 }
    );

    this.composer = new EffectComposer(this.renderer, renderTarget);

    // create render pass
    if (!this.renderPass) {
      this.renderPass = new RenderPass(this.scene, this.el.camera);
    }
    this.composer.addPass(this.renderPass);

    // create bloom pass
    var strength = this.data.strength;
    var radius = this.data.radius;
    var threshold = this.data.threshold;
    if (this.bloomPass) { this.bloomPass.dispose(); }
    this.bloomPass = new UnrealBloomPass(
      resolution,
      strength,
      radius,
      threshold
    );
    this.composer.addPass(this.bloomPass);

    // create output pass
    if (this.outputPass) { this.outputPass.dispose(); }
    this.outputPass = new OutputPass();
    this.composer.addPass(this.outputPass);
  },

  bind: function () {
    var self = this;
    var isInsideComposerRender = false;

    this.el.renderer.render = function () {
      if (isInsideComposerRender) {
        self.originalRender.apply(this, arguments);
      } else {
        isInsideComposerRender = true;
        // always set the current active camera on the RenderPass so that the
        // inspector controls are working properly with post-processing enabled
        self.renderPass.camera = self.el.camera;
        self.composer.render(self.el.sceneEl.delta / 1000);
        isInsideComposerRender = false;
      }
    };
  },

  remove: function () {
    this.el.renderer.render = this.originalRender;
    if (this.bloomPass) { this.bloomPass.dispose(); }
    if (this.outputPass) { this.outputPass.dispose(); }
    if (this.composer) { this.composer.dispose(); }
  }
});
