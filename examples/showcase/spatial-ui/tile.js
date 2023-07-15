/* global AFRAME, THREE */

if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

/**
 * Slice9 component for A-Frame.
 */
AFRAME.registerComponent('tile', {
  schema: {
    color: {type: 'color', default: '#e0e0e0'},
    width: {default: 1, min: 0},
    height: {default: 1, min: 0},
    src: {type: 'map', default: 'https://cdn.aframe.io/examples/ui/kazetachinu.jpg'}
  },

  init: function () {
    var data = this.data;
    var geometry = this.geometry = this.generatePlaneGeometryIndexed(data.width, data.height, 0.03, 12);
    var material = this.material = new THREE.MeshBasicMaterial({color: this.data.color});
    var self = this;
    this.el.classList.add('tile');

    var texture = new THREE.TextureLoader().load(data.src, function () {
      // material.needsUpdate = true;
    });
    material.map = texture;
    texture.colorSpace = THREE.SRGBColorSpace;
    this.el.addEventListener('mouseenter', function () { self.el.setAttribute('tile', 'color', '#ffffff'); });
    this.el.addEventListener('mouseleave', function () { self.el.setAttribute('tile', 'color', '#e0e0e0'); });

    this.plane = new THREE.Mesh(geometry, material);
    this.el.setObject3D('mesh', this.plane);
  },

  update: function () {
    this.material.color.set(this.data.color);
  },

  // width, height, radius corner, smoothness
  generatePlaneGeometry: function (w, h, r, s) {
    // helper const's
    const wi = w / 2 - r;   // inner width
    const hi = h / 2 - r;   // inner height
    const w2 = w / 2;     // half width
    const h2 = h / 2;     // half height
    const ul = r / w;     // u left
    const ur = (w - r) / w; // u right
    const vl = r / h;     // v low
    const vh = (h - r) / h; // v high

    let positions = [

      -wi, -h2, 0, wi, -h2, 0, wi, h2, 0,
      -wi, -h2, 0, wi, h2, 0, -wi, h2, 0,
      -w2, -hi, 0, -wi, -hi, 0, -wi, hi, 0,
      -w2, -hi, 0, -wi, hi, 0, -w2, hi, 0,
      wi, -hi, 0, w2, -hi, 0, w2, hi, 0,
      wi, -hi, 0, w2, hi, 0, wi, hi, 0

    ];

    let normals = [

      0, 0, 1, 0, 0, 1, 0, 0, 1,
      0, 0, 1, 0, 0, 1, 0, 0, 1,
      0, 0, 1, 0, 0, 1, 0, 0, 1,
      0, 0, 1, 0, 0, 1, 0, 0, 1,
      0, 0, 1, 0, 0, 1, 0, 0, 1,
      0, 0, 1, 0, 0, 1, 0, 0, 1,

      0, 0, 1, 0, 0, 1, 0, 0, 1,
      0, 0, 1, 0, 0, 1, 0, 0, 1,
      0, 0, 1, 0, 0, 1, 0, 0, 1,
      0, 0, 1, 0, 0, 1, 0, 0, 1,
      0, 0, 1, 0, 0, 1, 0, 0, 1,
      0, 0, 1, 0, 0, 1, 0, 0, 1,

      0, 0, 1, 0, 0, 1, 0, 0, 1,
      0, 0, 1, 0, 0, 1, 0, 0, 1,
      0, 0, 1, 0, 0, 1, 0, 0, 1,
      0, 0, 1, 0, 0, 1, 0, 0, 1,
      0, 0, 1, 0, 0, 1, 0, 0, 1,
      0, 0, 1, 0, 0, 1, 0, 0, 1

    ];

    let uvs = [

      ul, 0, ur, 0, ur, 1,
      ul, 0, ur, 1, ul, 1,
      0, vl, ul, vl, ul, vh,
      0, vl, ul, vh, 0, vh,
      ur, vl, 1, vl, 1, vh,
      ur, vl, 1, vh, ur, vh

    ];

    let phia = 0;
    let phib, xc, yc, uc, vc, cosa, sina, cosb, sinb;

    for (let i = 0; i < s * 4; i++) {
      phib = Math.PI * 2 * (i + 1) / (4 * s);

      cosa = Math.cos(phia);
      sina = Math.sin(phia);
      cosb = Math.cos(phib);
      sinb = Math.sin(phib);

      xc = i < s || i >= 3 * s ? wi : -wi;
      yc = i < 2 * s ? hi : -hi;

      positions.push(xc, yc, 0, xc + r * cosa, yc + r * sina, 0, xc + r * cosb, yc + r * sinb, 0);

      normals.push(0, 0, 1);
      normals.push(0, 0, 1);
      normals.push(0, 0, 1);

      uc = i < s || i >= 3 * s ? ur : ul;
      vc = i < 2 * s ? vh : vl;

      uvs.push(uc, vc, uc + ul * cosa, vc + vl * sina, uc + ul * cosb, vc + vl * sinb);

      phia = phib;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));

    // geometry.computeVertexNormals();
    geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), 3));

    return geometry;
  },

  // width, height, radius corner, smoothness
  generatePlaneGeometryIndexed: function (w, h, r, s) {
    // helper const's
    const wi = w / 2 - r;   // inner width
    const hi = h / 2 - r;   // inner height
    // const w2 = w / 2;     // half width
    // const h2 = h / 2;     // half height
    const ul = r / w;     // u left
    const ur = (w - r) / w; // u right
    const vl = r / h;     // v low
    const vh = (h - r) / h; // v high

    let positions = [

      wi, hi, 0, -wi, hi, 0, -wi, -hi, 0, wi, -hi, 0

    ];

    let uvs = [

      ur, vh, ul, vh, ul, vl, ur, vl

    ];

    let n = [

      3 * (s + 1) + 3, 3 * (s + 1) + 4, s + 4, s + 5,
      2 * (s + 1) + 4, 2, 1, 2 * (s + 1) + 3,
      3, 4 * (s + 1) + 3, 4, 0
    ];

    let indices = [

      n[0], n[1], n[2], n[0], n[2], n[3],
      n[4], n[5], n[6], n[4], n[6], n[7],
      n[8], n[9], n[10], n[8], n[10], n[11]

    ];

    let normals = [

      0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
      0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
      0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,

      0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
      0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
      0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,

      0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
      0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
      0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1

    ];

    let phi, cos, sin, xc, yc, uc, vc, idx;

    for (let i = 0; i < 4; i++) {
      xc = i < 1 || i > 2 ? wi : -wi;
      yc = i < 2 ? hi : -hi;

      uc = i < 1 || i > 2 ? ur : ul;
      vc = i < 2 ? vh : vl;

      for (let j = 0; j <= s; j++) {
        phi = Math.PI / 2 * (i + j / s);
        cos = Math.cos(phi);
        sin = Math.sin(phi);

        positions.push(xc + r * cos, yc + r * sin, 0);

        uvs.push(uc + ul * cos, vc + vl * sin);

        if (j < s) {
          idx = (s + 1) * i + j + 4;
          indices.push(i, idx, idx + 1);

          normals.push(0, 0, 1);
          normals.push(0, 0, 1);
          normals.push(0, 0, 1);
        }
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));
    geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), 3));

    return geometry;
  }
});
