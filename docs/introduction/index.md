head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PetGuardian Collar 3D Model</title>
    <style>
        body { margin: 0; }
        canvas { display: block; }
    </style>
</head>
<body>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script>
        // Scene
        const scene = new THREE.Scene();

        // Camera
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 5;

        // Renderer
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        // Collar Geometry
        const collarGeometry = new THREE.TorusGeometry(1, 0.2, 16, 100);
        const collarMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: false });
        const collar = new THREE.Mesh(collarGeometry, collarMaterial);
        scene.add(collar);

        // Screen Geometry
        const screenGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.05);
        const screenMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
        const screen = new THREE.Mesh(screenGeometry, screenMaterial);
        screen.position.set(0, 1.2, 0);
        scene.add(screen);

        // Animation Loop
        function animate() {
            requestAnimationFrame(animate);
            collar.rotation.x += 0.01;
            collar.rotation.y += 0.01;
            renderer.render(scene, camera);
        }
        animate();

        // Handle Window Resize
        window.addEventListener('resize', () => {
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
        });
    </script>
</body>
</html>
