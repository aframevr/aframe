/* global AFRAME */

/**
 * Draw dynamic colorful rectangles.
 */
AFRAME.registerComponent('draw-canvas-video-green-screen', {

  schema: {
    canvas: {type: 'selector'},
    myvideo: {type: 'selector'}
  },

  init: function () {
    // --------- here I capture my own stream in order to transmit it as I want ----
    var constraints = {
      video: true
    };

    // Get my camera stream (to do some processing before capturing to canvas
    var myvideo = this.myvideo = document.createElement('video');
    var promise = navigator.mediaDevices.getUserMedia(constraints);

    promise.then(SuccessCallback);

    function SuccessCallback (stream) {
      myvideo.srcObject = stream;
      myvideo.play();
    }

    this.canvas = this.data.canvas;
    this.ctx = this.canvas.getContext('2d');
    this.w = this.canvas.width;
    this.h = this.canvas.height;
  },

  tick: function (t) {
    var ctx = this.ctx;
    var myvideo = this.myvideo;
    var r, g; //, b;  // r,g,b level of a pixel
    var w = this.w;
    var h = this.h;
    ctx.drawImage(myvideo, 0, 0, w, h);

    var imageData = ctx.getImageData(0, 0, w, h);

    for (var i = 0; i < imageData.data.length; i += 4) {
      r = imageData.data[i]; // red level of pixel
      g = imageData.data[i + 1]; // green level of pixel
      // b = imageData.data[i + 2]; // blue level of pixel
      if (g - r > 0.08) { // if green is 2% more than red then we set this pixel as transparent by setting the alpha=0
        // imageData.data[i] = 0;      // red: you can use various colors, e.g. for video effects
        // imageData.data[i + 1] = 0; // green
        // imageData.data[i + 2] = 0; // blue
        imageData.data[i + 3] = 0; // alpha is zero
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }
});
