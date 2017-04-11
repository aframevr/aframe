var registerGeometry = require('../core/geometry').registerGeometry;
var THREE = require('../lib/three');

registerGeometry('triangle', {
  schema: {
    vertexA: {type: 'vec3', default: {x: 0, y: 0.5, z: 0}},
    vertexB: {type: 'vec3', default: {x: -0.5, y: -0.5, z: 0}},
    vertexC: {type: 'vec3', default: {x: 0.5, y: -0.5, z: 0}}
  },

  init: function (data) {
    var triangle = new THREE.Triangle();
    triangle.a.set(data.vertexA.x, data.vertexA.y, data.vertexA.z);
    triangle.b.set(data.vertexB.x, data.vertexB.y, data.vertexB.z);
    triangle.c.set(data.vertexC.x, data.vertexC.y, data.vertexC.z);
    this.geometry = new THREE.Geometry();
    this.geometry.vertices.push(triangle.a);
    this.geometry.vertices.push(triangle.b);
    this.geometry.vertices.push(triangle.c);
    this.geometry.faces.push(new THREE.Face3(0, 1, 2, triangle.normal()));
  }
});
