var registerShader = require('../core/shader').registerShader;

var isWebGL2AVailable = !!document.createElement('canvas').getContext('webgl2');

var VERTEX_SHADER_WEBGL1 = [
  'attribute vec2 uv;',
  'attribute vec3 position;',
  'uniform mat4 projectionMatrix;',
  'uniform mat4 modelViewMatrix;',
  'varying vec2 vUV;',
  'void main(void) {',
  '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
  '  vUV = uv;',
  '}'
].join('\n');

var VERTEX_SHADER_WEBGL2 = [
  '#version 300 es',
  'in vec2 uv;',
  'in vec3 position;',
  'uniform mat4 projectionMatrix;',
  'uniform mat4 modelViewMatrix;',
  'out vec2 vUV;',
  'void main(void) {',
  '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
  '  vUV = uv;',
  '}'
].join('\n');

var VERTEX_SHADER = isWebGL2AVailable ? VERTEX_SHADER_WEBGL2 : VERTEX_SHADER_WEBGL1;

var FRAGMENT_SHADER_WEBGL1 = [
  '#ifdef GL_OES_standard_derivatives',
  '#extension GL_OES_standard_derivatives: enable',
  '#endif',
  'precision highp float;',
  'uniform bool negate;',
  'uniform float alphaTest;',
  'uniform float opacity;',
  'uniform sampler2D map;',
  'uniform vec3 color;',
  'varying vec2 vUV;',

  'float median(float r, float g, float b) {',
  '  return max(min(r, g), min(max(r, g), b));',
  '}',

  // FIXME: Experimentally determined constants.
  '#define BIG_ENOUGH 0.001',
  '#define MODIFIED_ALPHATEST (0.02 * isBigEnough / BIG_ENOUGH)',

  'void main() {',
  '  vec3 sampleColor = texture2D(map, vUV).rgb;',
  '  if (negate) { sampleColor = 1.0 - sampleColor; }',

  '  float sigDist = median(sampleColor.r, sampleColor.g, sampleColor.b) - 0.5;',
  '  float alpha = clamp(sigDist / fwidth(sigDist) + 0.5, 0.0, 1.0);',
  '  float dscale = 0.353505;',
  '  vec2 duv = dscale * (dFdx(vUV) + dFdy(vUV));',
  '  float isBigEnough = max(abs(duv.x), abs(duv.y));',

  // When texel is too small, blend raw alpha value rather than supersampling.
  // FIXME: Experimentally determined constant.
  '  // Do modified alpha test.',
  '  if (isBigEnough > BIG_ENOUGH) {',
  '    float ratio = BIG_ENOUGH / isBigEnough;',
  '    alpha = ratio * alpha + (1.0 - ratio) * (sigDist + 0.5);',
  '  }',

  '  // Do modified alpha test.',
  '  if (alpha < alphaTest * MODIFIED_ALPHATEST) { discard; return; }',
  '  gl_FragColor = vec4(color.xyz, alpha * opacity);',
  '}'
].join('\n');

var FRAGMENT_SHADER_WEBGL2 = [
  '#version 300 es',
  'precision highp float;',
  'uniform bool negate;',
  'uniform float alphaTest;',
  'uniform float opacity;',
  'uniform sampler2D map;',
  'uniform vec3 color;',
  'in vec2 vUV;',
  'out vec4 fragColor;',

  'float median(float r, float g, float b) {',
  '  return max(min(r, g), min(max(r, g), b));',
  '}',

  // FIXME: Experimentally determined constants.
  '#define BIG_ENOUGH 0.001',
  '#define MODIFIED_ALPHATEST (0.02 * isBigEnough / BIG_ENOUGH)',

  'void main() {',
  '  vec3 sampleColor = texture(map, vUV).rgb;',
  '  if (negate) { sampleColor = 1.0 - sampleColor; }',

  '  float sigDist = median(sampleColor.r, sampleColor.g, sampleColor.b) - 0.5;',
  '  float alpha = clamp(sigDist / fwidth(sigDist) + 0.5, 0.0, 1.0);',
  '  float dscale = 0.353505;',
  '  vec2 duv = dscale * (dFdx(vUV) + dFdy(vUV));',
  '  float isBigEnough = max(abs(duv.x), abs(duv.y));',

  // When texel is too small, blend raw alpha value rather than supersampling.
  // FIXME: Experimentally determined constant.
  '  // Do modified alpha test.',
  '  if (isBigEnough > BIG_ENOUGH) {',
  '    float ratio = BIG_ENOUGH / isBigEnough;',
  '    alpha = ratio * alpha + (1.0 - ratio) * (sigDist + 0.5);',
  '  }',

  '  // Do modified alpha test.',
  '  if (alpha < alphaTest * MODIFIED_ALPHATEST) { discard; return; }',
  '  fragColor = vec4(color.xyz, alpha * opacity);',
  '}'
].join('\n');

var FRAGMENT_SHADER = isWebGL2AVailable ? FRAGMENT_SHADER_WEBGL2 : FRAGMENT_SHADER_WEBGL1;

/**
 * Multi-channel signed distance field.
 * Used by text component.
 */
module.exports.Shader = registerShader('msdf', {
  schema: {
    alphaTest: {type: 'number', is: 'uniform', default: 0.5},
    color: {type: 'color', is: 'uniform', default: 'white'},
    map: {type: 'map', is: 'uniform'},
    negate: {type: 'boolean', is: 'uniform', default: true},
    opacity: {type: 'number', is: 'uniform', default: 1.0}
  },

  raw: true,

  vertexShader: VERTEX_SHADER,

  fragmentShader: FRAGMENT_SHADER
});
