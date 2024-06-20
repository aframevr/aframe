/* global AFRAME */
/**
 * Start video
 */
AFRAME.registerComponent('video-init-component', {

  schema: {
    videoDOM: {type: 'selector'}
  },

  init: function () {
    var promise = navigator.mediaDevices.getUserMedia({video: true});
    promise.then(SuccessCallback);

    var myvideo = this.data.videoDOM;

    // we can not call this inside the function below
    function SuccessCallback (stream) {
      myvideo.srcObject = stream;
      myvideo.play();
    }
  }
});
