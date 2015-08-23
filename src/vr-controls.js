/* globals define */
(function(define){'use strict';define(function(require,exports,module){

		var cameraEl;
		// The canvas where the scene is painted
		var canvasEl;
		// To keep track of the pressed keys
		var keys = {};
		var mouseDown = false;

		var deltaX = 0;
		var deltaY = 0;

 		document.addEventListener("DOMContentLoaded", function() {
 			canvasEl = document.querySelector('vr-scene').canvas;
 			cameraEl = document.querySelector('vr-camera');
 			attachMouseKeyboardListeners();
  	});

    function attachMouseKeyboardListeners() {
  		var x = parseFloat(cameraEl.getAttribute('x')) || 0;
  		var y = parseFloat(cameraEl.getAttribute('y')) || 0;
  		var z = parseFloat(cameraEl.getAttribute('z')) || 0;

  		var rotX = parseFloat(cameraEl.getAttribute('rotY')) || 0;
      var rotY = parseFloat(cameraEl.getAttribute('rotX')) || 0;
      var rotZ = parseFloat(cameraEl.getAttribute('rotZ')) || 0;

      var lastMouseX;
      var lastMouseY;
      var rotationEnabled;
      var lastPress = Date.now();

      // key events
      window.addEventListener('keydown', function(event) {
        keys[event.keyCode] = true;
      }, false);

      window.addEventListener('keyup', function(event) {
        keys[event.keyCode] = false;
      }, false);

      window.requestAnimationFrame(updateCamera);

      canvasEl.addEventListener('mousedown', function(event) {
        mouseDown = true;
        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
      }, true);

      canvasEl.addEventListener('mouseup', function(event) {
        mouseDown = false;
      }, true);

      canvasEl.addEventListener('mousemove', function(event) {
        if (!mouseDown) {
          return;
        }
        deltaX -= (event.clientY - lastMouseY) * 0.25;
        deltaY -= (event.clientX - lastMouseX) * 0.25;
        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
      }, true);

    };

    var prevTime = Date.now();
    function updateCamera() {
    	var time = Date.now();
      var delta = ( time - prevTime );
      prevTime = time;
      var x = parseFloat(cameraEl.getAttribute('x')) || 0;
  		var y = parseFloat(cameraEl.getAttribute('y')) || 0;
  		var z = parseFloat(cameraEl.getAttribute('z')) || 0;

  		var rotX = parseFloat(cameraEl.getAttribute('rotx')) || 0;
      var rotY = parseFloat(cameraEl.getAttribute('roty')) || 0;
      var rotZ = parseFloat(cameraEl.getAttribute('rotz')) || 0;

      if (keys[65]) { // Left
        x -= delta;
        cameraEl.setAttribute('x', x);
      }
      if (keys[87]) { // Up
        z -= delta;
        cameraEl.setAttribute('z', z);
      }
      if (keys[68]) { // Right
        x += delta;
        cameraEl.setAttribute('x', x);
      }
      if (keys[83]) { // Down
        z += delta;
        cameraEl.setAttribute('z', z);
      }

      if (keys[90]) { // Z
        x = 0;
        y = 0;
        z = 0;
        rotX = 0;
        rotY = 0;
        cameraEl.setAttribute('x', x);
        cameraEl.setAttribute('y', y);
        cameraEl.setAttribute('z', z);

        cameraEl.setAttribute('rotx', rotX);
        cameraEl.setAttribute('roty', rotY);
        cameraEl.setAttribute('rotz', rotZ);
        // scene.resetSensor();
      }

      if (deltaX !== 0) {
      	cameraEl.setAttribute('rotx', rotX + deltaX);
      	deltaX = 0;
    	}
    	if (deltaY !== 0) {
      	cameraEl.setAttribute('roty', rotY + deltaY);
      	deltaY = 0;
    	}
			window.requestAnimationFrame(updateCamera);
    }

});})(typeof define=='function'&&define.amd?define
:(function(n,w){'use strict';return typeof module=='object'?function(c){
c(require,exports,module);}:function(c){var m={exports:{}};c(function(n){
return w[n];},m.exports,m);w[n]=m.exports;};})('VRControls',this));