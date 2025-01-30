/**
 * Unreal Bloom Effect
 * Implementation for A-Frame
 * Code modified from Akbartus's UnrealBloomPass.js
 * https://github.com/akbartus/A-Frame-Component-Postprocessing
 */


//////////////////////////////
// Copy Shader			        //
//////////////////////////////
const CopyShader = {

  name: 'CopyShader',

  uniforms: {

    'tDiffuse': { value: null },
    'opacity': { value: 1.0 }

  },

  vertexShader: /* glsl */`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,

  fragmentShader: /* glsl */`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );
			gl_FragColor.a *= opacity;


		}`

};

//////////////////////////////
// Pass       			        //
//////////////////////////////
const BufferGeometry = THREE.BufferGeometry;
const Float32BufferAttribute = THREE.Float32BufferAttribute;
const OrthographicCamera = THREE.OrthographicCamera;
const Mesh = THREE.Mesh;

class Pass {

  constructor() {

    this.isPass = true;

    // if set to true, the pass is processed by the composer
    this.enabled = true;

    // if set to true, the pass indicates to swap read and write buffer after rendering
    this.needsSwap = true;

    // if set to true, the pass clears its buffer before rendering
    this.clear = false;

    // if set to true, the result of the pass is rendered to screen. This is set automatically by EffectComposer.
    this.renderToScreen = false;

  }

  setSize( /* width, height */) { }

  render( /* renderer, writeBuffer, readBuffer, deltaTime, maskActive */) {

    console.error('THREE.Pass: .render() must be implemented in derived pass.');

  }

  dispose() { }

}

// Helper for passes that need to fill the viewport with a single quad.

const _camera = new OrthographicCamera(- 1, 1, 1, - 1, 0, 1);

// https://github.com/mrdoob/three.js/pull/21358

const _geometry = new BufferGeometry();
_geometry.setAttribute('position', new Float32BufferAttribute([- 1, 3, 0, - 1, - 1, 0, 3, - 1, 0], 3));
_geometry.setAttribute('uv', new Float32BufferAttribute([0, 2, 0, 0, 2, 0], 2));

class FullScreenQuad {

  constructor(material) {

    this._mesh = new Mesh(_geometry, material);

  }

  dispose() {

    this._mesh.geometry.dispose();

  }

  render(renderer) {

    // Disable XR projection for fullscreen effects
    // https://github.com/mrdoob/three.js/pull/18846
    const xrEnabled = renderer.xr.enabled;

    renderer.xr.enabled = false;
    renderer.render(this._mesh, _camera);
    renderer.xr.enabled = xrEnabled;

  }

  get material() {

    return this._mesh.material;

  }

  set material(value) {

    this._mesh.material = value;

  }

}

//////////////////////////////
// Shader Pass			        //
//////////////////////////////
const ShaderMaterial = THREE.ShaderMaterial;
const UniformsUtils = THREE.UniformsUtils;

class ShaderPass extends Pass {

  constructor(shader, textureID) {

    super();

    this.textureID = (textureID !== undefined) ? textureID : 'tDiffuse';

    if (shader instanceof ShaderMaterial) {

      this.uniforms = shader.uniforms;

      this.material = shader;

    } else if (shader) {

      this.uniforms = UniformsUtils.clone(shader.uniforms);

      this.material = new ShaderMaterial({

        name: (shader.name !== undefined) ? shader.name : 'unspecified',
        defines: Object.assign({}, shader.defines),
        uniforms: this.uniforms,
        vertexShader: shader.vertexShader,
        fragmentShader: shader.fragmentShader

      });

    }

    this.fsQuad = new FullScreenQuad(this.material);

  }

  render(renderer, writeBuffer, readBuffer /*, deltaTime, maskActive */) {

    if (this.uniforms[this.textureID]) {

      this.uniforms[this.textureID].value = readBuffer.texture;

    }

    this.fsQuad.material = this.material;

    if (this.renderToScreen) {

      renderer.setRenderTarget(null);
      this.fsQuad.render(renderer);

    } else {

      renderer.setRenderTarget(writeBuffer);
      // TODO: Avoid using autoClear properties, see https://github.com/mrdoob/three.js/pull/15571#issuecomment-465669600
      if (this.clear) renderer.clear(renderer.autoClearColor, renderer.autoClearDepth, renderer.autoClearStencil);
      this.fsQuad.render(renderer);

    }

  }

  dispose() {

    this.material.dispose();

    this.fsQuad.dispose();

  }

}



//////////////////////////////
// Effect Composer          //
//////////////////////////////
const Clock = THREE.Clock;
const HalfFloatType = THREE.HalfFloatType;
const Vector2 = THREE.Vector2;
const WebGLRenderTarget = THREE.WebGLRenderTarget;

const size = /* @__PURE__ */ new Vector2();

class EffectComposer {

  constructor(renderer, renderTarget) {

    this.renderer = renderer;

    this._pixelRatio = renderer.getPixelRatio();

    if (renderTarget === undefined) {

      renderer.getSize(size);
      this._width = size.width;
      this._height = size.height;

      renderTarget = new WebGLRenderTarget(this._width * this._pixelRatio, this._height * this._pixelRatio, { type: HalfFloatType });
      renderTarget.texture.name = 'EffectComposer.rt1';

    } else {

      this._width = renderTarget.width;
      this._height = renderTarget.height;

    }

    this.renderTarget1 = renderTarget;
    this.renderTarget2 = renderTarget.clone();
    this.renderTarget2.texture.name = 'EffectComposer.rt2';

    this.writeBuffer = this.renderTarget1;
    this.readBuffer = this.renderTarget2;

    this.renderToScreen = true;

    this.passes = [];

    this.copyPass = new ShaderPass(CopyShader);

    this.clock = new Clock();

    this.onSessionStateChange = this.onSessionStateChange.bind(this);
    this.renderer.xr.addEventListener('sessionstart', this.onSessionStateChange);
    this.renderer.xr.addEventListener('sessionend', this.onSessionStateChange);

  }

  onSessionStateChange() {

    this.renderer.getSize(size);
    this._width = size.width;
    this._height = size.height;

    this._pixelRatio = this.renderer.xr.isPresenting ? 1 : this.renderer.getPixelRatio();

    this.setSize(this._width, this._height);

  }

  swapBuffers() {

    const tmp = this.readBuffer;
    this.readBuffer = this.writeBuffer;
    this.writeBuffer = tmp;

  }

  addPass(pass) {

    this.passes.push(pass);
    pass.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio);

  }

  insertPass(pass, index) {

    this.passes.splice(index, 0, pass);
    pass.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio);

  }

  removePass(pass) {

    const index = this.passes.indexOf(pass);

    if (index !== - 1) {

      this.passes.splice(index, 1);

    }

  }

  isLastEnabledPass(passIndex) {

    for (let i = passIndex + 1; i < this.passes.length; i++) {

      if (this.passes[i].enabled) {

        return false;

      }

    }

    return true;

  }

  render(deltaTime) {

    // deltaTime value is in seconds

    if (deltaTime === undefined) {

      deltaTime = this.clock.getDelta();

    }

    const currentRenderTarget = this.renderer.getRenderTarget();

    let maskActive = false;

    for (let i = 0, il = this.passes.length; i < il; i++) {

      const pass = this.passes[i];

      if (pass.enabled === false) continue;

      pass.renderToScreen = (this.renderToScreen && this.isLastEnabledPass(i));
      pass.render(this.renderer, this.writeBuffer, this.readBuffer, deltaTime, maskActive);

      if (pass.needsSwap) {

        if (maskActive) {

          const context = this.renderer.getContext();
          const stencil = this.renderer.state.buffers.stencil;

          //context.stencilFunc( context.NOTEQUAL, 1, 0xffffffff );
          stencil.setFunc(context.NOTEQUAL, 1, 0xffffffff);

          this.copyPass.render(this.renderer, this.writeBuffer, this.readBuffer, deltaTime);

          //context.stencilFunc( context.EQUAL, 1, 0xffffffff );
          stencil.setFunc(context.EQUAL, 1, 0xffffffff);

        }

        this.swapBuffers();

      }


    }

    this.renderer.setRenderTarget(currentRenderTarget);

  }

  reset(renderTarget) {

    if (renderTarget === undefined) {

      this.renderer.getSize(size);
      this._pixelRatio = this.renderer.getPixelRatio();
      this._width = size.width;
      this._height = size.height;

      renderTarget = this.renderTarget1.clone();
      renderTarget.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio);

    }

    this.renderTarget1.dispose();
    this.renderTarget2.dispose();
    this.renderTarget1 = renderTarget;
    this.renderTarget2 = renderTarget.clone();

    this.writeBuffer = this.renderTarget1;
    this.readBuffer = this.renderTarget2;

  }

  setSize(width, height) {

    this._width = width;
    this._height = height;

    const effectiveWidth = this._width * this._pixelRatio;
    const effectiveHeight = this._height * this._pixelRatio;

    this.renderTarget1.setSize(effectiveWidth, effectiveHeight);
    this.renderTarget2.setSize(effectiveWidth, effectiveHeight);

    for (let i = 0; i < this.passes.length; i++) {

      this.passes[i].setSize(effectiveWidth, effectiveHeight);

    }

  }

  setPixelRatio(pixelRatio) {

    this._pixelRatio = pixelRatio;

    this.setSize(this._width, this._height);

  }

  dispose() {

    this.renderTarget1.dispose();
    this.renderTarget2.dispose();

    this.copyPass.dispose();

    this.renderer.xr.removeEventListener('sessionstart', this.onSessionStateChange);
    this.renderer.xr.removeEventListener('sessionend', this.onSessionStateChange);

  }

}


//////////////////////////////
// Render Pass 			    //
//////////////////////////////
const Color = THREE.Color;
class RenderPass extends Pass {

  constructor(scene, camera, overrideMaterial, clearColor, clearAlpha) {

    super();

    this.scene = scene;
    this.camera = camera;

    this.overrideMaterial = overrideMaterial;

    this.clearColor = clearColor;
    this.clearAlpha = (clearAlpha !== undefined) ? clearAlpha : 0;

    this.clear = true;
    this.clearDepth = false;
    this.needsSwap = false;
    this._oldClearColor = new Color();

  }

  render(renderer, writeBuffer, readBuffer /*, deltaTime, maskActive */) {

    const oldAutoClear = renderer.autoClear;
    renderer.autoClear = false;

    let oldClearAlpha, oldOverrideMaterial;

    if (this.overrideMaterial !== undefined) {

      oldOverrideMaterial = this.scene.overrideMaterial;

      this.scene.overrideMaterial = this.overrideMaterial;

    }

    if (this.clearColor) {

      renderer.getClearColor(this._oldClearColor);
      oldClearAlpha = renderer.getClearAlpha();

      renderer.setClearColor(this.clearColor, this.clearAlpha);

    }

    if (this.clearDepth) {

      renderer.clearDepth();

    }

    renderer.setRenderTarget(this.renderToScreen ? null : readBuffer);

    // TODO: Avoid using autoClear properties, see https://github.com/mrdoob/three.js/pull/15571#issuecomment-465669600
    if (this.clear) renderer.clear(renderer.autoClearColor, renderer.autoClearDepth, renderer.autoClearStencil);
    renderer.render(this.scene, this.camera);

    if (this.clearColor) {

      renderer.setClearColor(this._oldClearColor, oldClearAlpha);

    }

    if (this.overrideMaterial !== undefined) {

      this.scene.overrideMaterial = oldOverrideMaterial;

    }

    renderer.autoClear = oldAutoClear;

  }

}

//////////////////////////////
//  UNREAL BLOOM EFFECT		  //
//////////////////////////////

// Luminosity High Pass Shader
/**
 * Luminosity
 * http://en.wikipedia.org/wiki/Luminosity
 */

const LuminosityHighPassShader = {
  shaderID: "luminosityHighPass",

  uniforms: {
    tDiffuse: { value: null },
    luminosityThreshold: { value: 1.0 },
    smoothWidth: { value: 1.0 },
    defaultColor: { value: new Color(0x000000) },
    defaultOpacity: { value: 0.0 },
  },

  vertexShader: /* glsl */ `
  
          varying vec2 vUv;
  
          void main() {
  
              vUv = uv;
  
              gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  
          }`,

  fragmentShader: /* glsl */ `
  
          uniform sampler2D tDiffuse;
          uniform vec3 defaultColor;
          uniform float defaultOpacity;
          uniform float luminosityThreshold;
          uniform float smoothWidth;
  
          varying vec2 vUv;
  
          void main() {
  
              vec4 texel = texture2D( tDiffuse, vUv );
  
              vec3 luma = vec3( 0.299, 0.587, 0.114 );
  
              float v = dot( texel.xyz, luma );
  
              vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );
  
              float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );
  
              gl_FragColor = mix( outputColor, texel, alpha );
  
          }`,
};

// Unreal Bloom Pass
const AdditiveBlending = THREE.AdditiveBlending;
const MeshBasicMaterial = THREE.MeshBasicMaterial;
const Vector3 = THREE.Vector3;
/**
 * UnrealBloomPass is inspired by the bloom pass of Unreal Engine. It creates a
 * mip map chain of bloom textures and blurs them with different radii. Because
 * of the weighted combination of mips, and because larger blurs are done on
 * higher mips, this effect provides good quality and performance.
 *
 * Reference:
 * - https://docs.unrealengine.com/latest/INT/Engine/Rendering/PostProcessEffects/Bloom/
 */
class UnrealBloomPass extends Pass {
  constructor(resolution, strength, radius, threshold) {
    super();

    this.strength = strength !== undefined ? strength : 1;
    this.radius = radius;
    this.threshold = threshold;

    if (resolution === undefined) {
      console.log("Resolution not defined, using default value");
      this.resolution = new Vector2(256, 256);
    }
    else {
      console.log("Resolution defined, using the value");
      console.log(resolution);
      this.resolution = new Vector2(resolution.x, resolution.y);
    }

    // create color only once here, reuse it later inside the render function
    this.clearColor = new Color(0, 0, 0);

    // render targets
    this.renderTargetsHorizontal = [];
    this.renderTargetsVertical = [];
    this.nMips = 5;
    let resx = Math.round(this.resolution.x / 2);
    let resy = Math.round(this.resolution.y / 2);

    this.renderTargetBright = new WebGLRenderTarget(resx, resy, {
      type: HalfFloatType,
    });
    this.renderTargetBright.texture.name = "UnrealBloomPass.bright";
    this.renderTargetBright.texture.generateMipmaps = false;

    for (let i = 0; i < this.nMips; i++) {
      const renderTargetHorizonal = new WebGLRenderTarget(resx, resy, {
        type: HalfFloatType,
      });

      renderTargetHorizonal.texture.name = "UnrealBloomPass.h" + i;
      renderTargetHorizonal.texture.generateMipmaps = false;

      this.renderTargetsHorizontal.push(renderTargetHorizonal);

      const renderTargetVertical = new WebGLRenderTarget(resx, resy, {
        type: HalfFloatType,
      });

      renderTargetVertical.texture.name = "UnrealBloomPass.v" + i;
      renderTargetVertical.texture.generateMipmaps = false;

      this.renderTargetsVertical.push(renderTargetVertical);

      resx = Math.round(resx / 2);

      resy = Math.round(resy / 2);
    }

    // luminosity high pass material

    const highPassShader = LuminosityHighPassShader;
    this.highPassUniforms = UniformsUtils.clone(highPassShader.uniforms);

    this.highPassUniforms["luminosityThreshold"].value = threshold;
    this.highPassUniforms["smoothWidth"].value = 0.01;

    this.materialHighPassFilter = new ShaderMaterial({
      uniforms: this.highPassUniforms,
      vertexShader: highPassShader.vertexShader,
      fragmentShader: highPassShader.fragmentShader,
      defines: {},
    });

    // Gaussian Blur Materials
    this.separableBlurMaterials = [];
    const kernelSizeArray = [3, 5, 7, 9, 11];
    resx = Math.round(this.resolution.x / 2);
    resy = Math.round(this.resolution.y / 2);

    for (let i = 0; i < this.nMips; i++) {
      this.separableBlurMaterials.push(
        this.getSeperableBlurMaterial(kernelSizeArray[i])
      );

      this.separableBlurMaterials[i].uniforms["texSize"].value = new Vector2(
        resx,
        resy
      );

      resx = Math.round(resx / 2);

      resy = Math.round(resy / 2);
    }

    // Composite material
    this.compositeMaterial = this.getCompositeMaterial(this.nMips);
    this.compositeMaterial.uniforms["blurTexture1"].value =
      this.renderTargetsVertical[0].texture;
    this.compositeMaterial.uniforms["blurTexture2"].value =
      this.renderTargetsVertical[1].texture;
    this.compositeMaterial.uniforms["blurTexture3"].value =
      this.renderTargetsVertical[2].texture;
    this.compositeMaterial.uniforms["blurTexture4"].value =
      this.renderTargetsVertical[3].texture;
    this.compositeMaterial.uniforms["blurTexture5"].value =
      this.renderTargetsVertical[4].texture;
    this.compositeMaterial.uniforms["bloomStrength"].value = strength;
    this.compositeMaterial.uniforms["bloomRadius"].value = 0.1;
    this.compositeMaterial.needsUpdate = true;

    const bloomFactors = [1.0, 0.8, 0.6, 0.4, 0.2];
    this.compositeMaterial.uniforms["bloomFactors"].value = bloomFactors;
    this.bloomTintColors = [
      new Vector3(1, 1, 1),
      new Vector3(1, 1, 1),
      new Vector3(1, 1, 1),
      new Vector3(1, 1, 1),
      new Vector3(1, 1, 1),
    ];
    this.compositeMaterial.uniforms["bloomTintColors"].value =
      this.bloomTintColors;

    // copy material

    const copyShader = CopyShader;

    this.copyUniforms = UniformsUtils.clone(copyShader.uniforms);
    this.copyUniforms["opacity"].value = 1.0;

    this.materialCopy = new ShaderMaterial({
      uniforms: this.copyUniforms,
      vertexShader: copyShader.vertexShader,
      fragmentShader: copyShader.fragmentShader,
      blending: AdditiveBlending,
      depthTest: false,
      depthWrite: false,
      transparent: true,
    });

    this.enabled = true;
    this.needsSwap = false;

    this._oldClearColor = new Color();
    this.oldClearAlpha = 1;

    this.basic = new MeshBasicMaterial();

    this.fsQuad = new FullScreenQuad(null);
  }

  dispose() {
    for (let i = 0; i < this.renderTargetsHorizontal.length; i++) {
      this.renderTargetsHorizontal[i].dispose();
    }

    for (let i = 0; i < this.renderTargetsVertical.length; i++) {
      this.renderTargetsVertical[i].dispose();
    }

    this.renderTargetBright.dispose();

    //

    for (let i = 0; i < this.separableBlurMaterials.length; i++) {
      this.separableBlurMaterials[i].dispose();
    }

    this.compositeMaterial.dispose();
    this.materialCopy.dispose();
    this.basic.dispose();

    //

    this.fsQuad.dispose();
  }

  setSize(width, height) {
    let resx = Math.round(width / 2);
    let resy = Math.round(height / 2);

    this.renderTargetBright.setSize(resx, resy);

    for (let i = 0; i < this.nMips; i++) {
      this.renderTargetsHorizontal[i].setSize(resx, resy);
      this.renderTargetsVertical[i].setSize(resx, resy);

      this.separableBlurMaterials[i].uniforms["texSize"].value = new Vector2(
        resx,
        resy
      );

      resx = Math.round(resx / 2);
      resy = Math.round(resy / 2);
    }
  }

  render(renderer, writeBuffer, readBuffer, deltaTime, maskActive) {
    renderer.getClearColor(this._oldClearColor);
    this.oldClearAlpha = renderer.getClearAlpha();
    const oldAutoClear = renderer.autoClear;
    renderer.autoClear = false;

    renderer.setClearColor(this.clearColor, 0);

    if (maskActive) renderer.state.buffers.stencil.setTest(false);

    // Render input to screen

    if (this.renderToScreen) {
      this.fsQuad.material = this.basic;
      this.basic.map = readBuffer.texture;

      renderer.setRenderTarget(null);
      renderer.clear();
      this.fsQuad.render(renderer);
    }

    // 1. Extract Bright Areas

    this.highPassUniforms["tDiffuse"].value = readBuffer.texture;
    this.highPassUniforms["luminosityThreshold"].value = this.threshold;
    this.fsQuad.material = this.materialHighPassFilter;

    renderer.setRenderTarget(this.renderTargetBright);
    renderer.clear();
    this.fsQuad.render(renderer);

    // 2. Blur All the mips progressively

    let inputRenderTarget = this.renderTargetBright;

    for (let i = 0; i < this.nMips; i++) {
      this.fsQuad.material = this.separableBlurMaterials[i];

      this.separableBlurMaterials[i].uniforms["colorTexture"].value =
        inputRenderTarget.texture;
      this.separableBlurMaterials[i].uniforms["direction"].value =
        UnrealBloomPass.BlurDirectionX;
      renderer.setRenderTarget(this.renderTargetsHorizontal[i]);
      renderer.clear();
      this.fsQuad.render(renderer);

      this.separableBlurMaterials[i].uniforms["colorTexture"].value =
        this.renderTargetsHorizontal[i].texture;
      this.separableBlurMaterials[i].uniforms["direction"].value =
        UnrealBloomPass.BlurDirectionY;
      renderer.setRenderTarget(this.renderTargetsVertical[i]);
      renderer.clear();
      this.fsQuad.render(renderer);

      inputRenderTarget = this.renderTargetsVertical[i];
    }

    // Composite All the mips

    this.fsQuad.material = this.compositeMaterial;
    this.compositeMaterial.uniforms["bloomStrength"].value = this.strength;
    this.compositeMaterial.uniforms["bloomRadius"].value = this.radius;
    this.compositeMaterial.uniforms["bloomTintColors"].value =
      this.bloomTintColors;

    renderer.setRenderTarget(this.renderTargetsHorizontal[0]);
    renderer.clear();
    this.fsQuad.render(renderer);

    // Blend it additively over the input texture

    this.fsQuad.material = this.materialCopy;
    this.copyUniforms["tDiffuse"].value =
      this.renderTargetsHorizontal[0].texture;

    if (maskActive) renderer.state.buffers.stencil.setTest(true);

    if (this.renderToScreen) {
      renderer.setRenderTarget(null);
      this.fsQuad.render(renderer);
    } else {
      renderer.setRenderTarget(readBuffer);
      this.fsQuad.render(renderer);
    }

    // Restore renderer settings

    renderer.setClearColor(this._oldClearColor, this.oldClearAlpha);
    renderer.autoClear = oldAutoClear;
  }

  getSeperableBlurMaterial(kernelRadius) {
    return new ShaderMaterial({
      defines: {
        KERNEL_RADIUS: kernelRadius,
        SIGMA: kernelRadius,
      },

      uniforms: {
        colorTexture: { value: null },
        texSize: { value: new Vector2(0.5, 0.5) },
        direction: { value: new Vector2(0.5, 0.5) },
      },

      vertexShader: `varying vec2 vUv;
                  void main() {
                      vUv = uv;
                      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                  }`,

      fragmentShader: `#include <common>
                  varying vec2 vUv;
                  uniform sampler2D colorTexture;
                  uniform vec2 texSize;
                  uniform vec2 direction;
  
                  float gaussianPdf(in float x, in float sigma) {
                      return 0.39894 * exp( -0.5 * x * x/( sigma * sigma))/sigma;
                  }
                  void main() {
                      vec2 invSize = 1.0 / texSize;
                      float fSigma = float(SIGMA);
                      float weightSum = gaussianPdf(0.0, fSigma);
                      vec3 diffuseSum = texture2D( colorTexture, vUv).rgb * weightSum;
                      for( int i = 1; i < KERNEL_RADIUS; i ++ ) {
                          float x = float(i);
                          float w = gaussianPdf(x, fSigma);
                          vec2 uvOffset = direction * invSize * x;
                          vec3 sample1 = texture2D( colorTexture, vUv + uvOffset).rgb;
                          vec3 sample2 = texture2D( colorTexture, vUv - uvOffset).rgb;
                          diffuseSum += (sample1 + sample2) * w;
                          weightSum += 2.0 * w;
                      }
                      gl_FragColor = vec4(diffuseSum/weightSum, 1.0);
                  }`,
    });
  }

  getCompositeMaterial(nMips) {
    return new ShaderMaterial({
      defines: {
        NUM_MIPS: nMips,
      },

      uniforms: {
        blurTexture1: { value: null },
        blurTexture2: { value: null },
        blurTexture3: { value: null },
        blurTexture4: { value: null },
        blurTexture5: { value: null },
        bloomStrength: { value: 1.0 },
        bloomFactors: { value: null },
        bloomTintColors: { value: null },
        bloomRadius: { value: 0.0 },
      },

      vertexShader: `varying vec2 vUv;
                  void main() {
                      vUv = uv;
                      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                  }`,

      fragmentShader: `varying vec2 vUv;
                  uniform sampler2D blurTexture1;
                  uniform sampler2D blurTexture2;
                  uniform sampler2D blurTexture3;
                  uniform sampler2D blurTexture4;
                  uniform sampler2D blurTexture5;
                  uniform float bloomStrength;
                  uniform float bloomRadius;
                  uniform float bloomFactors[NUM_MIPS];
                  uniform vec3 bloomTintColors[NUM_MIPS];
  
                  float lerpBloomFactor(const in float factor) {
                      float mirrorFactor = 1.2 - factor;
                      return mix(factor, mirrorFactor, bloomRadius);
                  }
  
                  void main() {
                      gl_FragColor = bloomStrength * ( lerpBloomFactor(bloomFactors[0]) * vec4(bloomTintColors[0], 1.0) * texture2D(blurTexture1, vUv) +
                          lerpBloomFactor(bloomFactors[1]) * vec4(bloomTintColors[1], 1.0) * texture2D(blurTexture2, vUv) +
                          lerpBloomFactor(bloomFactors[2]) * vec4(bloomTintColors[2], 1.0) * texture2D(blurTexture3, vUv) +
                          lerpBloomFactor(bloomFactors[3]) * vec4(bloomTintColors[3], 1.0) * texture2D(blurTexture4, vUv) +
                          lerpBloomFactor(bloomFactors[4]) * vec4(bloomTintColors[4], 1.0) * texture2D(blurTexture5, vUv) );
                  }`,
    });
  }
}

UnrealBloomPass.BlurDirectionX = new Vector2(1.0, 0.0);
UnrealBloomPass.BlurDirectionY = new Vector2(0.0, 1.0);


/////////////////////////////////////
// A-FRAME COMPONENT: POST-PROCESSING //
/////////////////////////////////////
AFRAME.registerComponent("bloom", {
  schema: {
    threshold: {
      type: "number",
      default: 0,
    },
    strength: {
      type: "number",
      default: 0.4,
    },
    radius: {
      type: "number",
      default: 0,
    },
    exposure: {
      type: "number",
      default: 1,
    },
  },
  init: function () {

    console.log("Post-processing INIT effect: " + this.data.effect);
    this.scene = this.el.object3D;
    this.renderer = this.el.renderer;
    this.camera = this.el.camera;
    this.bound = false;

    var that = this;

    // delay half second to get the right resolution
    setTimeout(function () {
      that.evaluateEffect();
      that.bind();
    }, 500);
  },
  update: function (oldData) {
    console.log("Post-processing UPDATE effect");
    this.evaluateEffect();
  },
  evaluateEffect: function () {
    this.scene = this.el.object3D;
    this.renderer = this.el.renderer;
    this.camera = this.el.camera;
    this.composer = new EffectComposer(this.renderer);
    const renderScene = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderScene);

    // creating bloom pass    
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(
        this.renderer.domElement.clientWidth,
        this.renderer.domElement.clientHeight
      ),
      1.5,
      0.4,
      0.85
    );

    bloomPass.threshold = this.data.threshold;
    bloomPass.strength = this.data.strength;
    bloomPass.radius = this.data.radius;
    this.composer.addPass(bloomPass);
  },
  tick: function (t, dt) {
    this.t = t;
    this.dt = dt;
  },
  bind: function () {
    const render = this.renderer.render;
    const system = this;
    let isDigest = false;

    this.renderer.render = function () {

      if (isDigest) {
        render.apply(this, arguments);
      } else {
        isDigest = true;
        if (system.occlusionComposer) {
          system.occlusionComposer.render(system.dt);
        } else {
          system.composer.render(system.dt);
        }
        isDigest = false;
      }

    };

  },
});
