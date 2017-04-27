var registerShader = require('../core/shader').registerShader;

/**
 * Multi-channel signed distance field.
 * Used by text component.
 */
module.exports.Shader = registerShader('msdf', {
  schema: {
    alphaTest: {type: 'number', is: 'uniform', default: 0.5},
    color: {type: 'color', is: 'uniform', default: 'white'},
    map: {type: 'map', is: 'uniform'},
    opacity: {type: 'number', is: 'uniform', default: 1.0}
  },

  raw: true,

  vertexShader: [
    'attribute vec2 uv;',
    'attribute vec3 position;',
    'uniform mat4 projectionMatrix;',
    'uniform mat4 modelViewMatrix;',
    'varying vec2 vUV;',
    'void main(void) {',
    '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
    '  vUV = uv;',
    '}'
  ].join('\n'),

  fragmentShader: [
    '#ifdef GL_OES_standard_derivatives',
    '#extension GL_OES_standard_derivatives: enable',
    '#endif',

    'precision highp float;',
    // FIXME: Experimentally determined constants.
    '#define BIG_ENOUGH 0.001',
    '#define MODIFIED_ALPHATEST (0.02 * isBigEnough / BIG_ENOUGH)',
    '#define ALL_SMOOTH 0.4',
    '#define ALL_ROUGH 0.02',
    '#define DISCARD_ALPHA (alphaTest / (2.2 - 1.2 * ratio))',
    'uniform sampler2D map;',
    'uniform vec3 color;',
    'uniform float opacity;',
    'uniform float alphaTest;',
    'varying vec2 vUV;',

    'float median(float r, float g, float b) {',
    '  return max(min(r, g), min(max(r, g), b));',
    '}',
    'void main() {',
    '  vec3 sample = 1.0 - texture2D(map, vUV).rgb;',
    '  float sigDist = median(sample.r, sample.g, sample.b) - 0.5;',
    '  float alpha = clamp(sigDist/fwidth(sigDist) + 0.5, 0.0, 1.0);',
    '  float dscale = 0.353505;',
    '  vec2 duv = dscale * (dFdx(vUV) + dFdy(vUV));',
    '  float isBigEnough = max(abs(duv.x), abs(duv.y));',
    // When texel is too small, blend raw alpha value rather than supersampling.
    // FIXME: Experimentally determined constant.
    '  if (isBigEnough > BIG_ENOUGH) {',
    '    float ratio = BIG_ENOUGH / isBigEnough;',
    '    alpha = ratio * alpha + (1.0 - ratio) * (sigDist + 0.5);',
    '  }',
    // When texel is big enough, do standard alpha test.
    // FIXME: Experimentally determined constant.
    // Looks much better if we *don't* do this, but do we get Z fighting?
    '  if (isBigEnough <= BIG_ENOUGH && alpha < alphaTest) { discard; return; }',
    // Else, do modified alpha test.
    // FIXME: Experimentally determined constant.
    '  if (alpha < alphaTest * MODIFIED_ALPHATEST) { discard; return; }',
    '  gl_FragColor = vec4(color.xyz, alpha * opacity);',
    '}'
  ].join('\n')
});
