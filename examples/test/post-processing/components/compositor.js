/* global AFRAME THREE */

// The compositor. Blends the blurred renderTarget from the bloom component.
// It also checks opacity and converts parts of the frame to ascii(Alpha masking).
AFRAME.registerComponent('post-process', {

  init: function () {
    this.setupPostState();
    this.postModified();

    this.el.sceneEl.renderTarget.depthTexture = new THREE.DepthTexture();
    this.el.sceneEl.renderTarget.stencilBuffer = false;
    this.el.sceneEl.enablePostProcessing = true;

    this.evh = this.postModified.bind(this);
    this.el.sceneEl.addEventListener('post-modified', this.evh);
  },

  setupPostState: function () {
    this.scenePost = new THREE.Scene();

    // The camera is not actually used.
    this.cameraPost = new THREE.OrthographicCamera(1, 1, 1, 1, 1, 1);

    this.quadPost = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), null);
    this.scenePost.add(this.quadPost);
  },

  postModified: function (ev) {
    this.needsConfig = true;
  },

  // Whenever the postproc setup changes, the compositor shader is recompiled
  config: function () {
    var behaviors = this.el.sceneEl.behaviors.tock('bloom');
    var bloom = behaviors.length ? behaviors[0] : null;
    console.log('POST-MODIFIED', behaviors);
    this.needsConfig = false;

    var uniforms = {
      srcTexture: { type: 't', value: this.el.sceneEl.renderTarget },
      resolution: {type: 'v2', value: new THREE.Vector2(0, 0)}
    };
    var defines = {};
    var scene = this.el.sceneEl;
    if (bloom) {
      uniforms.bloomTexture = { type: 't', value: null };
      uniforms.bloomIntensity = { type: 'f', value: bloom.postIntensity };
      defines['BLEND_BLOOM'] = 1;
      this.bloomComponent = bloom;
    }

    uniforms.cameraNear = { type: 'f', value: scene.camera.near };
    uniforms.cameraFar = { type: 'f', value: scene.camera.far };

    if (scene.renderTarget.depthTexture) {
      uniforms.depthTexture = { type: 't', value: null };
      defines['BLEND_DEPTH'] = 1;
    }

    this.quadPost.material = new THREE.ShaderMaterial({
      defines: defines,
      uniforms: uniforms,
      vertexShader: this.vertexText,
      fragmentShader: this.fragmentText,

      depthWrite: false

    });
  },

  // Traverse scene objects and set opacity based on the postOpacity attribute set by the pulse component.
  tick: function (time) {
    this.el.sceneEl.object3D.traverse(function (obj) {
      var mat = obj.material;
      if (mat && mat.postOpacity !== undefined) {
        mat.opacity = mat.postOpacity;
      }
    });
    var renderTarget = this.el.sceneEl.renderTarget;
    if (!renderTarget.depthTexture) {
      renderTarget.depthTexture = new THREE.DepthTexture();
      renderTarget.stencilBuffer = false;
    }
  },

  // Cleanup the scene objects opacities.
  remove: function () {
    this.el.sceneEl.object3D.traverse(function (obj) {
      var mat = obj.material;
      if (mat && mat.postOpacity !== undefined) {
        mat.opacity = 1;
      }
    });
    this.el.sceneEl.removeEventListener('post-modified', this.evh);
  },

  tock: function () {
    var el = this.el;
    var scene = el.sceneEl;
    var rt = scene.renderTarget;

    if (this.needsConfig) {
      this.config();
    }

    var uns = this.quadPost.material.uniforms;
    uns.resolution.value.set(rt.width, rt.height);

    if (uns.bloomTexture) {
      uns.bloomTexture.value = this.bloomComponent.renderTarget;
    }

    if (uns.depthTexture) {
      uns.depthTexture.value = scene.renderTarget.depthTexture;
    }

    scene.renderer.render(this.scenePost, this.cameraPost);
  },

  vertexText: [
    'uniform vec2 resolution;',

    'void main() {',
    '    gl_Position =  vec4(( position.xy ) * resolution, 1.0, 1.0 );',
    '}'
  ].join('\n'),

  fragmentText: [
    'uniform sampler2D srcTexture;',
    'uniform vec2 resolution;',
    'uniform float cameraNear;',
    'uniform float cameraFar;',

    '#if defined BLEND_BLOOM',
    'uniform sampler2D bloomTexture;',
    'uniform float bloomIntensity;',
    '#endif',

    '#if defined BLEND_DEPTH',
    'uniform sampler2D depthTexture;',

    'float readDepth (vec2 uv) {',
    '  float cameraFarPlusNear = cameraFar + cameraNear;',
    '  float cameraFarMinusNear = cameraFar - cameraNear;',
    '  float cameraCoef = 2.0 * cameraNear;',
    '  return cameraCoef / (cameraFarPlusNear - texture2D(depthTexture, uv).x * cameraFarMinusNear);',
    '}',
    '#endif',

    '// Bitmap to ASCII (not really) fragment shader by movAX13h, September 2013',
    '// --- This shader is now used in Pixi JS ---',

    'float character(float n, vec2 p) // some compilers have the word "char" reserved',
    '{',
    '  p = floor(p*vec2(4.0, -4.0) + 2.5);',
    '  if (clamp(p.x, 0.0, 4.0) == p.x && clamp(p.y, 0.0, 4.0) == p.y)',
    '  {',
    '    if (int(mod(n/exp2(p.x + 5.0*p.y), 2.0)) == 1) return 1.0;',
    '  }	',
    '  return 0.0;',
    '}',

    'void main()',
    '{',
    '  vec2 uv = gl_FragCoord.xy/resolution;',
    '  vec4 col = texture2D(srcTexture, floor(gl_FragCoord.xy/8.0)*8.0/resolution);	',
    '  ',
    '  float gray = (col.r + col.g + col.b)/3.0;',
    '  ',
    '  float n = 65536.0;       // .',
    '  if (gray > 0.2) n = 65600.0;  // :',
    '  if (gray > 0.3) n = 332772.0;  // *',
    '  if (gray > 0.4) n = 15255086.0; // o ',
    '  if (gray > 0.5) n = 23385164.0; // &',
    '  if (gray > 0.6) n = 15252014.0; // 8',
    '  if (gray > 0.7) n = 13199452.0; // @',
    '  if (gray > 0.8) n = 11512810.0; // #',
    '  float split = 0.33;',
    '  #if defined BLEND_DEPTH',
    '  split = smoothstep(0.3,0.9,readDepth(uv));',
    '  #endif',

    '  vec2 p = mod(gl_FragCoord.xy/4.0, 2.0) - vec2(1.0);',
    '  vec4 ocol = texture2D(srcTexture, uv );',
    '  vec3 acol = ((1.0-split) * col.rgb * character(n, p) + split * ocol.rgb);',

    '  vec3 color = mix(ocol.rgb,acol.rgb,ocol.a);',
    '  ',

    '  #if defined BLEND_BLOOM',
    '  color += texture2D(bloomTexture,uv).rgb * bloomIntensity;',
    '  #endif',

    '  gl_FragColor = vec4(color,1.0);',
    '}'
  ].join('\n')
});
