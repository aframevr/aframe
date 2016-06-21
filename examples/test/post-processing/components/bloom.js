/* global AFRAME THREE */

/*
Kawase bloom, described here
https://software.intel.com/en-us/blogs/2014/07/15/an-investigation-of-fast-real-time-gpu-based-image-blur-algorithms
*/

AFRAME.registerComponent('bloom', {
  dependencies: ['post-process'],
  following: true, // boolean true is shortcut for reusing the  definition of the dependencies property.

  schema: {
    passes: { default: '-0.5 0 1 2 2 3' },
    intensity: { default: 1.0 }
  },

  setupPostState: function () {
    this.scenePost = new THREE.Scene();

    // The camera is not actually used.
    this.cameraPost = new THREE.OrthographicCamera(1, 1, 1, 1, 1, 1);

    this.quadPost = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), null);
    this.scenePost.add(this.quadPost);
  },

  init: function () {
    this.setupPostState();
    this.quadPost.material = new THREE.ShaderMaterial({
      uniforms: {
        srcTexture: { type: 't', value: null },
        resolution: {type: 'v2', value: new THREE.Vector2(0, 0)},
        step: { type: 'v2', value: new THREE.Vector2(0, 0) },
        threxp: { type: 'v2', value: new THREE.Vector2(0, 0) }
      },
      vertexShader: this.vertexText,
      fragmentShader: this.fragmentText,

      depthWrite: false

    });
    var rtOptions = { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat };
    this.renderTargets = [
      new THREE.WebGLRenderTarget(1, 1, rtOptions),
      new THREE.WebGLRenderTarget(1, 1, rtOptions)
    ];
    this.el.emit('post-modified');
  },

  remove: function () {
    this.el.emit('post-modified');
  },

  update: function () {
    this.postIntensity = this.data.intensity;
  },

  // We're doing bloom at half resolution for performance. Most blurry effects can get away with that.
  getTargets: function () {
    var srt = this.el.sceneEl.renderTarget;
    for (var i = 0; i < 2; i++) {
      var rt = this.renderTargets[i];
      if (rt.width !== srt.width / 2 || rt.height !== srt.height / 2) {
        rt.setSize(srt.width / 2, srt.height / 2);
      }
    }
    return this.renderTargets;
  },

  tock: function () {
    var rts = this.getTargets();
    var el = this.el;
    var scene = el.sceneEl;
    var uns = this.quadPost.material.uniforms;
    var rt = scene.renderTarget;

    // Ping pong the render targets progressively blurring more on each pass.
    var passes = this.data.passes.split(' ');
    for (var i = 0; i < passes.length; i++) {
      var ps = +(passes[i]) + 0.5;
      uns.step.value.set(ps, ps);
      uns.srcTexture.value = rt;
      if (!i) uns.threxp.value.set(16, 0); else uns.threxp.value.set(1, 0);
      rt = rts[i & 1];
      uns.resolution.value.set(rt.width, rt.height);

      scene.renderer.render(this.scenePost, this.cameraPost, rt);
    }
    this.renderTarget = rt;
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
    'uniform vec2 threxp;',
    'uniform vec2 step;',

    'void main(){',
    '    vec2 uv = gl_FragCoord.xy/resolution;',
    '    vec2 st = step/resolution;',
    '    vec4 color = vec4(0.0);',

    '   color += texture2D(srcTexture,uv + st);',
    '    color += texture2D(srcTexture,uv + vec2(st.x,-st.y));',
    '    color += texture2D(srcTexture,uv - vec2(st.x,-st.y));',
    '    color += texture2D(srcTexture,uv - st);',
    '    color /= 4.0;',
    '    gl_FragColor = vec4(pow(color.rgb,vec3(threxp.x))+vec3(threxp.y), 1.0);',
    '}'
  ].join('\n')
});
