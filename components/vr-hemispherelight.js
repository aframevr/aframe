document.registerElement(
  'vr-hemispherelight',
  {
    prototype: Object.create(
      VRObject.prototype, {
        onElementCreated: {
          value: function() {
            var skyColor = this.getAttribute('skyColor') || "#FFFFFF";
            var groundColor = this.getAttribute('groundColor') || "#FFFFFF";
            var intensity = parseFloat(this.getAttribute('intensity')) || 1;
            this.object3D = new THREE.HemisphereLight( skyColor, groundColor, intensity );
            console.log(this.object3D)
            this.load();
          }
        }
      })
  }
);

