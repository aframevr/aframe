<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <script src="https://aframe.io/releases/1.5.0/aframe.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-aframe.prod.js"></script>
</head>

<body>

<a-scene
mindar-image="imageTargetSrc: targets.mind;"
color-space="sRGB"
renderer="colorManagement: true"
vr-mode-ui="enabled: false"
device-orientation-permission-ui="enabled: false">

<a-assets>
</a-assets>

<a-camera position="0 0 0" look-controls="enabled: false"></a-camera>

<a-entity mindar-image-target="targetIndex: 0">

    <!-- Kumpulan partikel warna -->
    <a-entity id="particles">

        <a-sphere
            position="0 0 0"
            radius="0.03"
            color="#FF006E"
            animation="
                property: position;
                to: 0 1 -1;
                dur: 4000;
                loop: true;
                easing: linear">
        </a-sphere>

        <a-sphere
            position="0 0 0"
            radius="0.04"
            color="#3A86FF"
            animation="
                property: position;
                to: -0.8 1.2 -0.5;
                dur: 3500;
                loop: true">
        </a-sphere>

        <a-sphere
            position="0 0 0"
            radius="0.02"
            color="#FFBE0B"
            animation="
                property: position;
                to: 1 0.8 -0.8;
                dur: 3000;
                loop: true">
        </a-sphere>

        <a-sphere
            position="0 0 0"
            radius="0.03"
            color="#8338EC"
            animation="
                property: position;
                to: -1 0.5 -1;
                dur: 4500;
                loop: true">
        </a-sphere>

        <a-sphere
            position="0 0 0"
            radius="0.025"
            color="#06D6A0"
            animation="
                property: position;
                to: 0.5 1.5 -0.7;
                dur: 5000;
                loop: true">
        </a-sphere>

    </a-entity>

</a-entity>

</a-scene>

</body>
</html>
