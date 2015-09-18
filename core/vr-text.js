// TODO:
// 1. add support for color.
// 2. prefer third party line/text wrapping module.
// 3. add support for font families (detecting when they load isn't pretty)
// 4. proper SDF for sharp text

var VRMarkup = require('@mozvr/vr-markup');

var THREE = VRMarkup.THREE;
var VRObject = VRMarkup.VRObject;

document.registerElement('vr-text', {
  prototype: Object.create(VRObject.prototype, {
    createdCallback: {
      value: function () {
        // to hide the child textNode
        this.style.display = 'none';

        this.width = 256;
        this.height = 256;
        this.lineHeight = 30;
        var ctx = document.createElement('canvas').getContext('2d');
        ctx.canvas.width = this.width;
        ctx.canvas.height = this.height;
        this.ctx = ctx;

        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.strokeStyle = '#FF0000';
        this.wrapText(this.textContent);

        var texture = new THREE.Texture(this.ctx.canvas);
        texture.needsUpdate = true;
        var material = new THREE.MeshBasicMaterial({
          transparent: true,
          doublesided: true,
          side: THREE.DoubleSide,
          map: texture,
          // for debugging
          //color: '#00B000',
          //wireframe: true,
        });
        // The size conversion here is weird
        var geometry = new THREE.PlaneGeometry(5, 5);
        this.object3D = new THREE.Mesh(geometry, material);

        this.load();
      },
    },
    // TODO: replace this with maybe a node module that is better tested.
    wrapText: {
      value: function (input) {
        var words = input.split(' ');
        var currentLine = '';
        var y = this.lineHeight;
        words.forEach(function (word, i) {
          var wordPlusCurrentLineLength = this.ctx.measureText(currentLine + word).width;

          // If the length of the current line with the next word can fit
          // on the canvas ...
          if (wordPlusCurrentLineLength < this.width) {
            // add the next word to the current line
            currentLine += word + ' ';
            // if this is the last word in our word list, then print it.
            if (i === words.length - 1) {
              this.ctx.strokeText(currentLine, 0 , y);
            }
          } else {
            // otherwise print the current line
            this.ctx.strokeText(currentLine, 0 , y);
            y += this.lineHeight;
            currentLine = word + ' ';
          }
        }.bind(this));
      },
    },
    attributeChangedCallback: {
      value: function () {},
    },
  })
});
