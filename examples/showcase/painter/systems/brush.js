/* globals AFRAME THREE StrokeGeometry */
AFRAME.registerSystem('brush', {
  init: function () {
    this.strokes = [];
    this.initDrawingEl();
  },

  initDrawingEl: function () {
    this.drawingEl = document.querySelector('.a-drawing');
    if (this.drawingEl) { return; }
    this.drawingEl = document.createElement('a-entity');
    this.drawingEl.className = 'a-drawing';
    document.querySelector('a-scene').appendChild(this.drawingEl);
  },

  addNewStroke: function (color, size) {
    var stroke = new NewBrush(this.drawingEl);
    stroke.brush = NewBrush;
    stroke.init(color, size);
    this.strokes.push(stroke);
    return stroke;
  },

  generateTestLines: function () {
    var z = -2;
    var size = 0.5;
    var width = 3;
    var numPoints = 4;

    var steps = width / numPoints;
    var self = this;

    var x = -(size + 0.1) / 2;
    x = 0;
    var y = 0;
    var color = new THREE.Color(Math.random(), Math.random(), Math.random());

    var stroke = self.addNewStroke(color, size);
    var entity = document.querySelector('[brush]');

    var position = new THREE.Vector3(x, y, z);
    var aux = new THREE.Vector3();

    for (var i = 0; i < numPoints; i++) {
      var orientation = new THREE.Quaternion();
      aux.set(0, steps, 0.1);
      var euler = new THREE.Euler(0, Math.PI, 0);
      orientation.setFromEuler(euler);
      position = position.add(aux);
      var pointerPosition = entity.components.brush.getPointerPosition(position, orientation, 'right');
      stroke.addPoint(position, orientation, pointerPosition);
    }

    x += size + 0.1;
  },

  generateRandomStrokes: function (numStrokes) {
    function randNeg () { return 2 * Math.random() - 1; }

    var entity = document.querySelector('[brush]');

    for (var l = 0; l < numStrokes; l++) {
      var color = new THREE.Color(Math.random(), Math.random(), Math.random());
      var size = Math.random() * 0.3;
      var numPoints = parseInt(Math.random() * 500);
      var stroke = this.addNewStroke(color, size);
      var position = new THREE.Vector3(randNeg(), randNeg(), randNeg());
      var aux = new THREE.Vector3();
      var orientation = new THREE.Quaternion();

      for (var i = 0; i < numPoints; i++) {
        aux.set(randNeg(), randNeg(), randNeg());
        aux.multiplyScalar(randNeg() / 20);
        orientation.setFromUnitVectors(position.clone().normalize(), aux.clone().normalize());
        position = position.add(aux);
        if (position.y < 0) { position.y = -position.y; }
        var pointerPosition = entity.components.brush.getPointerPosition(position, orientation, 'right');
        stroke.addPoint(position, orientation, pointerPosition);
      }
    }
  }
});

var NewBrush = function (entityEl) {
  this.entityEl = entityEl;
};

NewBrush.prototype = {
  init: function (color, brushSize) {
    this.size = brushSize;
    this.numPoints = 0;
    this.spacing = 0.0025;
    this.maxPoints = 3000;

    var brushMaterial = new THREE.MeshBasicMaterial({
      vertexColors: THREE.VertexColors,
      side: THREE.DoubleSide,
      color: color
    });

    this.strokeGeometry = new StrokeGeometry(brushMaterial, this.entityEl);
  },

  addPoint: (function () {
    var previousPosition;
    return function (position, orientation, pointerPosition) {
      if ((previousPosition && previousPosition.distanceTo(position) <= this.spacing) ||
          this.maxPoints !== 0 && this.numPoints >= this.maxPoints) {
        return;
      }

      this.strokeGeometry.addPoint(pointerPosition, orientation, this.size);
      this.numPoints++;
      previousPosition = previousPosition ? previousPosition.copy(position) : new THREE.Vector3().copy(position);
    };
  })()
};
