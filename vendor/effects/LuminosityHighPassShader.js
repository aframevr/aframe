/**
 * @author bhouston / http://clara.io/
 *
 * Luminosity
 * http://en.wikipedia.org/wiki/Luminosity
 */

THREE.LuminosityHighPassShader = {

  shaderID: "luminosityHighPass",

  uniforms: {

    "tDiffuse": { type: "t", value: null },
    "luminosityThreshold": { type: "f", value: 1.0 },
    "smoothWidth": { type: "f", value: 1.0 },
    "defaultColor": { type: "c", value: new THREE.Color( 0x000000 ) },
    "defaultOpacity":  { type: "f", value: 0.0 }

  },

  vertexShader: [

    "varying vec2 vUv;",

    "void main() {",

      "vUv = uv;",

      "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

    "}"

  ].join("\n"),

  fragmentShader: [

    "uniform sampler2D tDiffuse;",
    "uniform vec3 defaultColor;",
    "uniform float defaultOpacity;",
    "uniform float luminosityThreshold;",
    "uniform float smoothWidth;",

    "varying vec2 vUv;",

    "void main() {",

      "vec4 texel = texture2D( tDiffuse, vUv );",

      "vec3 luma = vec3( 0.299, 0.587, 0.114 );",

      "float v = dot( texel.xyz, luma );",

      "vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );",

      "float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );",

      "gl_FragColor = mix( outputColor, texel, alpha );",

    "}"

  ].join("\n")

};
