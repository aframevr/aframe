var THREE = require('../lib/three');

var VRNode = require('./core/vr-node');

module.exports = document.registerElement(
  'vr-controls',
  {
    prototype: Object.create(
      VRNode.prototype,
      {
        createdCallback: {
          value: function() {
            this.prevTime = Date.now();
            // The canvas where the scene is painted
            this.canvasEl = document.querySelector('vr-scene').canvas;
            this.cameraEl = document.querySelector('vr-camera');
            // To keep track of the pressed keys
            this.keys = {};
            this.mouseDown = false;

            this.acceleration = 65;
            this.velocity = new THREE.Vector3();

            this.pitchObject = new THREE.Object3D();
            this.yawObject = new THREE.Object3D();
            this.yawObject.position.y = 10;
            this.yawObject.add( this.pitchObject );

            this.setAttribute('locomotion', true);
            this.setAttribute('mouse-look', true);

            this.attachMouseKeyboardListeners();
            this.load();
          }
        },

        attributeChangedCallback: {
          value: function() {
            var locomotion = this.getAttribute('locomotion');
            var mouseLook = this.getAttribute('mouse-look');
            this.locomotion = locomotion === "true"? true : false;
            this.mouseLook = mouseLook === "true"? true : false;
          }
        },

        update: {
          value: function() {
            var velocity = this.velocity;
            var cameraEl = this.cameraEl;
            var pitchObject = this.pitchObject;
            var yawObject = this.yawObject;
            var time = performance.now();
            var delta = ( time - this.prevTime ) / 1000;
            var keys = this.keys;
            var acceleration = this.acceleration;
            this.prevTime = time;

            velocity.x -= velocity.x * 10.0 * delta;
            velocity.z -= velocity.z * 10.0 * delta;

            var position = cameraEl.getAttribute('position');
            var x = position.x || 0;
            var y = position.y || 0;
            var z = position.z || 0;

            var rotation = cameraEl.getAttribute('rotation');
            var rotX = rotation.x || 0;
            var rotY = rotation.y || 0;
            var rotZ = rotation.z || 0;

            if (this.locomotion) {
              if (keys[65]) { // Left
                velocity.x -= acceleration * delta;
              }
              if (keys[87]) { // Up
                velocity.z -= acceleration * delta;
              }
              if (keys[68]) { // Right
                velocity.x += acceleration * delta;
              }
              if (keys[83]) { // Down
                velocity.z += acceleration * delta;
              }
            }

            if (keys[90]) { // Z
              x = 0;
              y = 0;
              z = 0;
              rotX = 0;
              rotY = 0;

              cameraEl.reset();
              // scene.resetSensor();

              position = cameraEl.getAttribute('position');
              x = position.x || 0;
              y = position.y || 0;
              z = position.z || 0;

              rotation = cameraEl.getAttribute('rotation');
              rotX = rotation.x || 0;
              rotY = rotation.y || 0;
              rotZ = rotation.z || 0;

            }

            el.setAttribute('rotation', {
              x: THREE.Math.radToDeg(pitchObject.rotation.x),
              y: THREE.Math.radToDeg(yawObject.rotation.y),
              z: rotZ
            });

            var movementVector = this.getMovementVector(delta);
            cameraEl.setAttribute('position', {
              x: x + movementVector.x,
              y: y,
              z: z + movementVector.z
            });
          }
        },

        attachMouseKeyboardListeners: {
          value: function() {
            var canvasEl = this.canvasEl;

            // Keyboard events
            window.addEventListener('keydown', this.onKeyDown.bind(this), false);
            window.addEventListener('keyup', this.onKeyUp.bind(this), false);

            // Mouse Events
            canvasEl.addEventListener('mousedown', this.onMouseDown.bind(this), true);
            canvasEl.addEventListener('mouseup', this.onMouseUp.bind(this), true);
            canvasEl.addEventListener('mousemove', this.onMouseMove.bind(this), true);
          }
        },

        PI_2: {
          value: Math.PI / 2
        },

        onMouseMove: {
          value: function(event) {
            var pitchObject = this.pitchObject;
            var yawObject = this.yawObject;
            var mouseDown = this.mouseDown;
            var PI_2 = this.PI_2;

            if (!mouseDown || !this.mouseLook) { return; }

            var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
            var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

            yawObject.rotation.y -= movementX * 0.002;
            pitchObject.rotation.x -= movementY * 0.002;
            pitchObject.rotation.x = Math.max(-PI_2, Math.min( PI_2, pitchObject.rotation.x ) );
          }
        },

        onMouseDown: {
          value: function(event) {
            this.mouseDown = true;
            this.lastMouseX = event.clientX;
            this.lastMouseY = event.clientY;
          }
        },

        onMouseUp: {
          value: function() {
            this.mouseDown = false;
          }
        },

        onKeyDown: {
          value: function(event) {
            this.keys[event.keyCode] = true;
          }
        },

        onKeyUp: {
          value: function(event) {
            this.keys[event.keyCode] = false;
          }
        },

        getMovementVector: {
          value: function(delta) {
            var velocity = this.velocity;
            var direction = new THREE.Vector3( velocity.x * delta, 0, velocity.z * delta );
            var rotation = new THREE.Euler(0, 0, 0, "YXZ");
            var pitchObject = this.pitchObject;
            var yawObject = this.yawObject;
            rotation.set( pitchObject.rotation.x, yawObject.rotation.y, 0 );
            return direction.applyEuler( rotation );
          }
        }
    })
  }
);
