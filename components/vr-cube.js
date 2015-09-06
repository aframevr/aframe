document.registerElement(
  'vr-cube',
  {
    prototype: Object.create(
      VRObject.prototype, {
        onElementCreated: {
          value: function() {
            var material = this.getMaterial();
            var geometry = this.getGeometry();
            this.object3D = new THREE.Mesh( geometry, material );
            this.load();
          }
        },

        onAttributeChanged: {
          value: function() {
            var material = this.getMaterial();
            var geometry = this.getGeometry();
            this.object3D.geometry = geometry;
            this.object3D.material = material;
          }
        },

        getGeometry: {
          value: function() {
            var width = parseFloat(this.getAttribute('width')) || 5;
            var height = parseFloat(this.getAttribute('height')) || 5;
            var depth = parseFloat(this.getAttribute('depth')) || 5;
            return new THREE.BoxGeometry( width, height, depth );
          }
        },

        getMaterial: {
          value: function() {
            var color = this.getAttribute('color');
            var materialId = this.getAttribute('material');
            var materialEl;
            var material;

            if(materialId) {
              materialEl = materialId? document.querySelector('#' + materialId) : undefined;
              material = materialEl.material;
              if(color){
                material.color = new THREE.Color(color);
              }
            } else if (color) {
              material = new THREE.MeshPhongMaterial({color:color})
            } else {
              material = new THREE.MeshNormalMaterial()
            }

            return material;
          }
        }
      })
  }
);

