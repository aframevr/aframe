var registerShader = require('../core/shader').registerShader;
var THREE = require('../lib/three');

var VERTEX_SHADER = [
  '#include <common>',
  '#include <fog_pars_vertex>',
  '#include <logdepthbuf_pars_vertex>',

  'out vec2 vUV;',

  'void main(void) {',
  '  vUV = uv;',
  '  #include <begin_vertex>',
  '  #include <project_vertex>',
  '  #include <logdepthbuf_vertex>',
  '  #include <fog_vertex>',
  '}'
].join('\n');

var FRAGMENT_SHADER = [
  '#include <common>',
  '#include <fog_pars_fragment>',
  '#include <logdepthbuf_pars_fragment>',

  'uniform float alphaTest;',
  'uniform float opacity;',
  'uniform sampler2D map;',
  'uniform vec3 color;',
  'in vec2 vUV;',

  'float contour(float width, float value) {',
  '  return smoothstep(0.5 - value, 0.5 + value, width);',
  '}',

  // FIXME: Experimentally determined constants.
  '#define BIG_ENOUGH 0.001',
  '#define MODIFIED_ALPHATEST (0.02 * isBigEnough / BIG_ENOUGH)',

  'void main() {',
  '  vec2 uv = vUV;',
  '  vec4 texColor = texture(map, uv);',
  '  float dist = texColor.a;',
  '  float width = fwidth(dist);',
  '  float alpha = contour(dist, width);',
  '  float dscale = 0.353505;',

  '  vec2 duv = dscale * (dFdx(uv) + dFdy(uv));',
  '  float isBigEnough = max(abs(duv.x), abs(duv.y));',

     // When texel is too small, blend raw alpha value rather than supersampling.
     // FIXME: experimentally determined constant
  '  if (isBigEnough > BIG_ENOUGH) {',
  '    float ratio = BIG_ENOUGH / isBigEnough;',
  '    alpha = ratio * alpha + (1.0 - ratio) * dist;',
  '  }',

     // Otherwise do weighted supersampling.
     // FIXME: why this weighting?
  '  if (isBigEnough <= BIG_ENOUGH) {',
  '    vec4 box = vec4 (uv - duv, uv + duv);',
  '    alpha = (alpha + 0.5 * (',
  '      contour(texture(map, box.xy).a, width)',
  '      + contour(texture(map, box.zw).a, width)',
  '      + contour(texture(map, box.xw).a, width)',
  '      + contour(texture(map, box.zy).a, width)',
  '    )) / 3.0;',
  '  }',

       // Do modified alpha test.
  '  if (alpha < alphaTest * MODIFIED_ALPHATEST) { discard; return; }',

  '  gl_FragColor = vec4(color, opacity * alpha);',
  '  #include <logdepthbuf_fragment>',
  '  #include <tonemapping_fragment>',
  '  #include <colorspace_fragment>',
  '  #include <fog_fragment>',
  '}'
].join('\n');

/**
 * Signed distance field.
 * Used by text component.
 */
module.exports.Shader = registerShader('sdf', {
  schema: {
    alphaTest: {type: 'number', is: 'uniform', default: 0.5},
    color: {type: 'color', is: 'uniform', default: 'white'},
    map: {type: 'map', is: 'uniform'},
    opacity: {type: 'number', is: 'uniform', default: 1.0}
  },

  vertexShader: VERTEX_SHADER,

  fragmentShader: FRAGMENT_SHADER,

  init: function (data) {
     this.uniforms = THREE.UniformsUtils.merge([
       THREE.UniformsLib.fog,
       this.initVariables(data, 'uniform')
     ]);
     this.material = new THREE.ShaderMaterial({
       uniforms: this.uniforms,
       vertexShader: this.vertexShader,
       fragmentShader: this.fragmentShader,
       fog: true
     });
     return this.material;
   }
});
