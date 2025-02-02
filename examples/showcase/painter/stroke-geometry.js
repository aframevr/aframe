/* globals THREE */
function StrokeGeometry (material, entityEl) {
  this.material = material;
  this.maxBufferSize = 5000;
  this.geometries = [];
  this.currentGeometry = null;
  this.entityEl = entityEl;
  this.addBuffer(false);
  this.first = true;
}

StrokeGeometry.prototype = {
  addBuffer: function (copyLast) {
    var geometry = new THREE.BufferGeometry();

    var vertices = new Float32Array(this.maxBufferSize * 3);
    var indices = new Uint32Array(this.maxBufferSize * 4.5);
    var normals = new Float32Array(this.maxBufferSize * 3);
    var uvs = new Float32Array(this.maxBufferSize * 2);
    var colors = new Float32Array(this.maxBufferSize * 3);

    var mesh = new THREE.Mesh(geometry, this.material);

    mesh.frustumCulled = false;
    mesh.vertices = vertices;

    this.object3D = new THREE.Object3D();
    this.object3D.add(mesh);

    this.entityEl.object3D.add(this.object3D);

    geometry.setDrawRange(0, 0);
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3).setUsage(THREE.DynamicDrawUsage));
    geometry.attributes.position.updateRanges.count = 0;

    geometry.setIndex(new THREE.BufferAttribute(indices, 3).setUsage(THREE.DynamicDrawUsage));
    geometry.index.updateRanges.count = 0;

    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2).setUsage(THREE.DynamicDrawUsage));
    geometry.attributes.uv.updateRanges.count = 0;

    geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3).setUsage(THREE.DynamicDrawUsage));
    geometry.attributes.normal.updateRanges.count = 0;

    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3).setUsage(THREE.DynamicDrawUsage));
    geometry.attributes.color.updateRanges.count = 0;

    this.previousGeometry = null;
    if (this.geometries.length > 0) {
      this.previousGeometry = this.currentGeometry;
    }

    this.indices = {
      position: 0,
      index: 0,
      uv: 0,
      normal: 0,
      color: 0
    };

    this.prevIndices = Object.assign({}, this.indices);

    this.geometries.push(geometry);
    this.currentGeometry = geometry;

    // Copies first position from previous buffer so they are continous with no gaps.
    // Necessary for example for drawing strokes.
    if (this.previousGeometry && copyLast) {
      var prev = (this.maxBufferSize - 2) * 3;
      var col = (this.maxBufferSize - 2) * 3;
      var norm = (this.maxBufferSize - 2) * 3;

      var position = this.previousGeometry.attributes.position.array;
      this.addVertex(position[prev++], position[prev++], position[prev++]);
      this.addVertex(position[prev++], position[prev++], position[prev++]);

      var normal = this.previousGeometry.attributes.normal.array;
      this.addNormal(normal[norm++], normal[norm++], normal[norm++]);
      this.addNormal(normal[norm++], normal[norm++], normal[norm++]);

      var color = this.previousGeometry.attributes.color.array;
      this.addColor(color[col++], color[col++], color[col++]);
      this.addColor(color[col++], color[col++], color[col++]);

      uvs = this.previousGeometry.attributes.uv.array;
    }
  },

  addColor: function (r, g, b) {
    this.currentGeometry.attributes.color.setXYZ(this.indices.color++, r, g, b);
  },

  addNormal: function (x, y, z) {
    this.currentGeometry.attributes.normal.setXYZ(this.indices.normal++, x, y, z);
  },

  addPoint: (function () {
    var direction = new THREE.Vector3();
    var vertexA = new THREE.Vector3();
    var vertexAOffset = new THREE.Vector3();

    var vertexB = new THREE.Vector3();
    var vertexBOffset = new THREE.Vector3();

    return function (position, orientation, width) {
      direction.set(1, 0, 0);
      direction.applyQuaternion(orientation);
      direction.normalize();

      // Add two vertices to the triangle strip separated by the brush size.
      vertexA.copy(position);
      vertexB.copy(position);

      vertexA.add(vertexAOffset.copy(direction).multiplyScalar(width / 2));
      vertexB.add(vertexBOffset.copy(direction).multiplyScalar(-width / 2));

      // if (this.first && this.indices.position > 0) {
      //   debugger;
      //   // Degenerated triangle
      //   this.first = false;
      //   this.addVertex(vertexA.x, vertexA.y, vertexA.z);
      //   this.indices.normal++;
      //   this.indices.color++;
      //   this.indices.uv++;
      // }

      /*
        2---3
        | \ |
        0---1
      */
      this.addVertex(vertexA.x, vertexA.y, vertexA.z);
      this.addVertex(vertexB.x, vertexB.y, vertexB.z);
      this.indices.normal += 2;

      this.addColor(this.material.color.r, this.material.color.g, this.material.color.b);
      this.addColor(this.material.color.r, this.material.color.g, this.material.color.b);

      this.update();
      this.computeVertexNormals();
    };
  })(),

  computeVertexNormals: (function () {
    var pA = new THREE.Vector3();
    var pB = new THREE.Vector3();
    var pC = new THREE.Vector3();
    var cb = new THREE.Vector3();
    var ab = new THREE.Vector3();

    return function () {
      var start = this.prevIndices.position === 0 ? 0 : (this.prevIndices.position + 1) * 3;
      var end = (this.indices.position) * 3;
      var vertices = this.currentGeometry.attributes.position.array;
      var normals = this.currentGeometry.attributes.normal.array;

      for (var i = start; i <= end; i++) {
        normals[i] = 0;
      }

      var pair = true;
      for (i = start; i < end - 6; i += 3) {
        if (pair) {
          pA.fromArray(vertices, i);
          pB.fromArray(vertices, i + 3);
          pC.fromArray(vertices, i + 6);
        } else {
          pB.fromArray(vertices, i);
          pC.fromArray(vertices, i + 6);
          pA.fromArray(vertices, i + 3);
        }
        pair = !pair;

        cb.subVectors(pC, pB);
        ab.subVectors(pA, pB);
        cb.cross(ab);
        cb.normalize();

        normals[i] += cb.x;
        normals[i + 1] += cb.y;
        normals[i + 2] += cb.z;

        normals[i + 3] += cb.x;
        normals[i + 4] += cb.y;
        normals[i + 5] += cb.z;

        normals[i + 6] += cb.x;
        normals[i + 7] += cb.y;
        normals[i + 8] += cb.z;
      }

      /*
      first and last vertices (0 and 8) belongs just to one triangle
      second and penultimate (1 and 7) belongs to two triangles
      the rest of the vertices belongs to three triangles

        1_____3_____5_____7
        /\    /\    /\    /\
       /  \  /  \  /  \  /  \
      /____\/____\/____\/____\
      0    2     4     6     8
      */

      // Vertices that are shared across three triangles
      for (i = start + 2 * 3; i < end - 2 * 3; i++) {
        normals[i] = normals[i] / 3;
      }

      // Second and penultimate triangle, that shares just two triangles
      normals[start + 3] = normals[start + 3] / 2;
      normals[start + 3 + 1] = normals[start + 3 + 1] / 2;
      normals[start + 3 + 2] = normals[start + 3 * 1 + 2] / 2;

      normals[end - 2 * 3] = normals[end - 2 * 3] / 2;
      normals[end - 2 * 3 + 1] = normals[end - 2 * 3 + 1] / 2;
      normals[end - 2 * 3 + 2] = normals[end - 2 * 3 + 2] / 2;
    };
  })(),

  addVertex: function (x, y, z) {
    var buffer = this.currentGeometry.attributes.position;
    // Initialize a new buffer if full;
    if (this.indices.position === buffer.count) {
      this.addBuffer(true);
      buffer = this.currentGeometry.attributes.position;
    }
    buffer.setXYZ(this.indices.position++, x, y, z);
    // Every two new vertices we add two new triangles.
    if ((this.indices.position + 1) % 2 === 0 && this.indices.position > 1) {
      /* Line brushes
        2---3
        | \ |
        0---1
        {0, 1, 2}, {2, 1, 3}
      */
      this.currentGeometry.index.setXYZ(this.indices.index++, this.indices.position - 3, this.indices.position - 2, this.indices.position - 1);
      this.currentGeometry.index.setXYZ(this.indices.index++, this.indices.position - 1, this.indices.position - 2, this.indices.position);
    }
  },

  update: function () {
    // Draw one less triangle to prevent indexing into blank positions
    // on an even-number-positioned undo
    this.currentGeometry.setDrawRange(0, (this.indices.position * 3) - 4);

    this.currentGeometry.attributes.color.updateRanges.count = this.indices.position * 3;
    this.currentGeometry.attributes.color.needsUpdate = true;
    this.currentGeometry.attributes.normal.updateRanges.count = this.indices.position * 3;
    this.currentGeometry.attributes.normal.needsUpdate = true;
    this.currentGeometry.attributes.position.updateRanges.count = this.indices.position * 3;
    this.currentGeometry.attributes.position.needsUpdate = true;
    this.currentGeometry.attributes.uv.updateRanges.count = this.indices.position * 2;
    this.currentGeometry.attributes.uv.needsUpdate = true;
    this.currentGeometry.index.updateRanges.count = this.indices.position * 3;
    this.currentGeometry.index.needsUpdate = true;
  }
};
