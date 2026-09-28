<!DOCTYPE html>
<html>
  <head>
    <title>Escenario VR</title>
    <script src="https://aframe.io/releases/1.2.0/aframe.min.js"></script>
  </head>
  <body>
    <a-scene>
      <!-- Piso -->
      <a-plane position="0 0 0" rotation="-90 0 0" width="10" height="10" color="#7BC8A4"></a-plane>
      
      <!-- Mesa -->
      <a-box position="0 1 -3" width="2" height="0.1" depth="2" color="brown"></a-box>
      <a-box position="-0.9 0.5 -2.9" width="0.1" height="1" depth="0.1" color="black"></a-box>
      <a-box position="0.9 0.5 -2.9" width="0.1" height="1" depth="0.1" color="black"></a-box>
      <a-box position="-0.9 0.5 -3.1" width="0.1" height="1" depth="0.1" color="black"></a-box>
      <a-box position="0.9 0.5 -3.1" width="0.1" height="1" depth="0.1" color="black"></a-box>
      
      <!-- Silla -->
      <a-box position="0 0.5 -5" width="1" height="1" depth="1" color="blue"></a-box>
      
      <!-- Cámara -->
      <a-camera position="0 1.6 0"></a-camera>
    </a-scene>
  </body>
</html>

