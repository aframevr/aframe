var registerShader = require('../core/shader').registerShader;

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
    // FIXME: experimentally determined constants
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
    '#ifdef GL_OES_standard_derivatives',
    'float contour(float width, float value) {',
    '  return smoothstep(0.5 - value, 0.5 + value, width);',
    '}',
    '#else',
    'float aastep(float value, float afwidth) {',
    '  return smoothstep(0.5 - afwidth, 0.5 + afwidth, value);',
    '}',
    '#endif',
    'void main() {',
    '#ifdef GL_OES_standard_derivatives',
    // when we have derivatives and can get texel size etc., that allows supersampling etc.
    '  vec2 uv = vUV;',
    '  vec4 texColor = texture2D(map, uv);',
    '  float dist = texColor.a;',
    '  float width = fwidth(dist);',
    '  float alpha = contour(dist, width);',
    '  float dscale = 0.353505;',
    '  vec2 duv = dscale * (dFdx(uv) + dFdy(uv));',
    '  float isBigEnough = max(abs(duv.x), abs(duv.y));',
    // when texel is too small, blend raw alpha value rather than supersampling etc.
    // FIXME: experimentally determined constant
    '  if (isBigEnough > BIG_ENOUGH) {',
    '    float ratio = BIG_ENOUGH / isBigEnough;',
    '    alpha = ratio * alpha + (1.0 - ratio) * dist;',
    '  }',
    // otherwise do weighted supersampling
    // FIXME: why this weighting?
    '  else if (isBigEnough <= BIG_ENOUGH) {',
    '    vec4 box = vec4 (uv - duv, uv + duv);',
    '    alpha = (alpha + 0.5 * (',
    '      contour(texture2D(map, box.xy).a, width)',
    '      + contour(texture2D(map, box.zw).a, width)',
    '      + contour(texture2D(map, box.xw).a, width)',
    '      + contour(texture2D(map, box.zy).a, width)',
    '    )) / 3.0;',
    '  }',
    // when texel is big enough, do standard alpha test
    // FIXME: experimentally determined constant
    // looks much better if we DON'T do this, but do we get Z fighting etc.?
    '  if (isBigEnough <= BIG_ENOUGH && alpha < alphaTest) { discard; return; }',
    // else do modified alpha test
    // FIXME: experimentally determined constant
    '  if (alpha < alphaTest * MODIFIED_ALPHATEST) { discard; return; }',
    '#else',
    '  vec4 texColor = texture2D(map, vUV);',
    '  float value = texColor.a;',
    // when we don't have derivatives, use approximations
    // FIXME: if we understood font pixel dimensions, this could probably be improved
    '  float afwidth = (1.0 / 32.0) * (1.4142135623730951 / (2.0 * gl_FragCoord.w));',
    '  float alpha = aastep(value, afwidth);',
    // use gl_FragCoord.w to guess when we should blend
    // FIXME: if we understood font pixel dimensions, this could probably be improved
    '  float ratio = (gl_FragCoord.w >= ALL_SMOOTH) ? 1.0 : (gl_FragCoord.w < ALL_ROUGH) ? 0.0 : (gl_FragCoord.w - ALL_ROUGH) / (ALL_SMOOTH - ALL_ROUGH);',
    '  if (alpha < alphaTest) { if (ratio >= 1.0) { discard; return; } alpha = 0.0; }',
    '  alpha = alpha * ratio + (1.0 - ratio) * value;',
    '  if (ratio < 1.0)',
    '    if (alpha <= DISCARD_ALPHA) { discard; return; }',
    '#endif',
    '  gl_FragColor = vec4(color, opacity * alpha);',
    '}'
  ].join('\n')
});
