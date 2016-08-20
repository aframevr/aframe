/* global AFRAME */
AFRAME.registerShader('noise', {
  schema: {
    time: { type: 'time', is: 'uniform' },
    color: { type: 'color', is: 'uniform', default: 'red' },
    weight: { type: 'number', default: 1.0, is: 'uniform' }
  },

  vertexShader: [
    'vec3 mod289(vec3 x)', 
    '{',
      'return x - floor(x * (1.0 / 289.0)) * 289.0;',
    '}',

    'vec4 mod289(vec4 x)',
    '{',
      'return x - floor(x * (1.0 / 289.0)) * 289.0;',
    '}',

    'vec4 permute(vec4 x)',
    '{',
      'return mod289(((x*34.0)+1.0)*x);',
    '}',

    'vec4 taylorInvSqrt(vec4 r)',
    '{',
      'return 1.79284291400159 - 0.85373472095314 * r;',
    '}',

    'vec3 fade(vec3 t) {',
      'return t*t*t*(t*(t*6.0-15.0)+10.0);',
    '}',

    '// Classic Perlin noise, periodic variant',
    'float pnoise(vec3 P, vec3 rep)',
    '{',
      'vec3 Pi0 = mod(floor(P), rep); // Integer part, modulo period',
      'vec3 Pi1 = mod(Pi0 + vec3(1.0), rep); // Integer part + 1, mod period',
      'Pi0 = mod289(Pi0);',
      'Pi1 = mod289(Pi1);',
      'vec3 Pf0 = fract(P); // Fractional part for interpolation',
      'vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0',
      'vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);',
      'vec4 iy = vec4(Pi0.yy, Pi1.yy);',
      'vec4 iz0 = Pi0.zzzz;',
      'vec4 iz1 = Pi1.zzzz;',

      'vec4 ixy = permute(permute(ix) + iy);',
      'vec4 ixy0 = permute(ixy + iz0);',
      'vec4 ixy1 = permute(ixy + iz1);',

      'vec4 gx0 = ixy0 * (1.0 / 7.0);',
      'vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;',
      'gx0 = fract(gx0);',
      'vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);',
      'vec4 sz0 = step(gz0, vec4(0.0));',
      'gx0 -= sz0 * (step(0.0, gx0) - 0.5);',
      'gy0 -= sz0 * (step(0.0, gy0) - 0.5);',

      'vec4 gx1 = ixy1 * (1.0 / 7.0);',
      'vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;',
      'gx1 = fract(gx1);',
      'vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);',
      'vec4 sz1 = step(gz1, vec4(0.0));',
      'gx1 -= sz1 * (step(0.0, gx1) - 0.5);',
      'gy1 -= sz1 * (step(0.0, gy1) - 0.5);',

      'vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);',
      'vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);',
      'vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);',
      'vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);',
      'vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);',
      'vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);',
      'vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);',
      'vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);',

      'vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));',
      'g000 *= norm0.x;',
      'g010 *= norm0.y;',
      'g100 *= norm0.z;',
      'g110 *= norm0.w;',
      'vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));',
      'g001 *= norm1.x;',
      'g011 *= norm1.y;',
      'g101 *= norm1.z;',
      'g111 *= norm1.w;',

      'float n000 = dot(g000, Pf0);',
      'float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));',
      'float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));',
      'float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));',
      'float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));',
      'float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));',
      'float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));',
      'float n111 = dot(g111, Pf1);',

      'vec3 fade_xyz = fade(Pf0);',
      'vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);',
      'vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);',
      'float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); ',
      'return 2.2 * n_xyz;',
    '}',

      'float f( vec3 p ) {',
        'return pnoise( vec3( p ), vec3( 10.0, 10.0, 10.0 ) );',
      '}',

      'varying vec3 vNormal;',
      'varying vec3 vReflect;',
      'varying float ao;',
      'uniform float time;',
      'uniform float weight;',

      'float fround( float value ) {',
        'return floor( value + 0.5 );',
      '}',

      'vec3 v3round( vec3 value ) {',
        'return vec3( fround( value.x ), fround( value.y ), fround( value.z ) );',
      '}',

      'void main() {',

        'vec3 evNormal = normal;',
        'vec3 aniNormal = 2.0 * evNormal + time / 1000.0;',
        'float f0 = weight * f( aniNormal );',
        'float fx = weight * f( aniNormal + vec3( .0001, 0.0, 0.0 ) );',
        'float fy = weight * f( aniNormal + vec3( 0.0, .0001, 0.0 ) );',
        'float fz = weight * f( aniNormal + vec3( 0.0, 0.0, .0001 ) );',
        'vec3 modifiedNormal = normalize( evNormal - vec3( (fx - f0) / .0001, (fy - f0) / .0001, (fz - f0) / .0001 ) );',

        'if( weight > 0.0 ) {',
          'ao = f0 / weight;',
        '} else {',
          'ao = 0.0;',
        '}',
        'vNormal = modifiedNormal;',
        'vec3 newPosition = position + f0 * evNormal;',
        'vec3 nWorld = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * modifiedNormal );',
        'vReflect = normalize( reflect( normalize( newPosition.xyz - cameraPosition ), nWorld ) );',
        'gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );',
      '}'  
  ].join('\n'),

  fragmentShader: [ 
    'varying vec3 vNormal;',
    'varying vec3 vReflect;',
    'varying float ao;',
    'uniform vec3 color;',

    'float PI = 3.14159265358979323846264;',

    'void main() {',

      'float yaw = .5 - atan( vReflect.z, - vReflect.x ) / ( 2.0 * PI );',
      'float pitch = .5 - asin( vReflect.y ) / PI;',
      'vec2 pos = vec2( yaw, pitch );',
      'float diffuse_value1 = .0015 * max(dot(vNormal, vec3( -490.0, 29.8, -85.8 ) ), 0.0); ',
      'float diffuse_value2 = .0005 * max(dot(vNormal, vec3( -460.0, 40.27, 187.4 ) ), 0.0); ',
      'float diffuse_value3 = .0010 * max(dot(vNormal, vec3( 175.5, 30.04, 466.4 ) ), 0.0); ',
      'float diffuse_value4 = .0005 * max(dot(vNormal, vec3( 466.0, 45.3, 172.9 ) ), 0.0); ',

      'gl_FragColor = vec4( color - .15 * ao + .5 * vec3( diffuse_value1 + diffuse_value2 + diffuse_value3 + diffuse_value4 ), 1.0 );',
    '}'
  ].join('\n')
});
