/**
 * SHOE HAVEN (3D EDITION) - High-Fidelity Three.js 3D Showcase
 * Renders the floating futuristic sneaker with glowing neon piping, 
 * reflective metallic materials, and a dual-ring neon glowing pedestal.
 */

(function () {
  const container = document.getElementById('three-canvas-container');
  if (!container) return;

  // Verify Three.js
  if (typeof THREE === 'undefined') {
    container.innerHTML = `
      <div class="flex items-center justify-center h-full text-slate-500 text-sm">
        <i class="bi bi-box me-2"></i> Initializing 3D Stage...
      </div>`;
    return;
  }

  // 1. Scene, Camera, Renderer
  const scene = new THREE.Scene();
  const width = container.clientWidth || 600;
  const height = container.clientHeight || 550;

  const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
  camera.position.set(0, 0.8, 5.5);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // Group structure
  const worldGroup = new THREE.Group();
  scene.add(worldGroup);

  const pedestalGroup = new THREE.Group();
  const sneakerGroup = new THREE.Group();
  worldGroup.add(pedestalGroup);
  worldGroup.add(sneakerGroup);

  // Initial colors
  let currentThemeColor = new THREE.Color('#00E5FF'); // Cyan default
  let currentHex = '#00E5FF';

  // 2. Lighting Rig
  const ambientLight = new THREE.AmbientLight(0x0a101f, 1.8);
  scene.add(ambientLight);

  // Key Rim Light
  const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
  keyLight.position.set(4, 6, 4);
  scene.add(keyLight);

  // Fill Light with thematic tint
  const fillLight = new THREE.DirectionalLight(0x1e293b, 1.5);
  fillLight.position.set(-4, -1, 3);
  scene.add(fillLight);

  // Backlight for edge silhouette
  const backLight = new THREE.DirectionalLight(currentThemeColor, 3.5);
  backLight.position.set(0, 4, -4);
  scene.add(backLight);

  // Pedestal Uplight shining onto the shoe
  const pedestalLight = new THREE.PointLight(currentThemeColor, 4.0, 5);
  pedestalLight.position.set(0, -0.6, 0);
  scene.add(pedestalLight);

  // Interactive Cursor Light
  const cursorLight = new THREE.PointLight(currentThemeColor, 2.5, 6);
  cursorLight.position.set(0, 1.5, 3);
  scene.add(cursorLight);

  // 3. Materials
  // Dark metallic pedestal
  const pedestalMaterial = new THREE.MeshStandardMaterial({
    color: 0x070b14,
    metalness: 0.85,
    roughness: 0.25,
  });

  const pedestalTopMaterial = new THREE.MeshStandardMaterial({
    color: 0x05070d,
    metalness: 0.95,
    roughness: 0.15,
  });

  // Neon glowing ring material
  const neonRingMaterial = new THREE.MeshBasicMaterial({
    color: currentThemeColor,
  });

  // Sneaker body materials
  const shoeSoleMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x05070e,
    metalness: 0.3,
    roughness: 0.25,
    clearcoat: 0.8,
    clearcoatRoughness: 0.2,
  });

  const shoeUpperMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x0d121f,
    metalness: 0.5,
    roughness: 0.35,
    clearcoat: 0.5,
  });

  const shoeNeonTrimMaterial = new THREE.MeshBasicMaterial({
    color: currentThemeColor,
  });

  const shoeAccentTrimMaterial = new THREE.MeshStandardMaterial({
    color: currentThemeColor,
    emissive: currentThemeColor,
    emissiveIntensity: 0.8,
    roughness: 0.2,
    metalness: 0.8
  });

  const laceMaterial = new THREE.MeshStandardMaterial({
    color: 0x111625,
    roughness: 0.7,
    metalness: 0.2
  });

  // 4. Build Pedestal (matching the reference image)
  function buildPedestal() {
    // Pedestal Base Cylinder
    const baseGeo = new THREE.CylinderGeometry(1.65, 1.75, 0.28, 64);
    const baseMesh = new THREE.Mesh(baseGeo, pedestalMaterial);
    baseMesh.position.y = -1.25;
    baseMesh.receiveShadow = true;
    pedestalGroup.add(baseMesh);

    // Pedestal Top Tier (Stepped)
    const topGeo = new THREE.CylinderGeometry(1.45, 1.55, 0.16, 64);
    const topMesh = new THREE.Mesh(topGeo, pedestalTopMaterial);
    topMesh.position.y = -1.05;
    topMesh.receiveShadow = true;
    pedestalGroup.add(topMesh);

    // Outer Neon Ring (Torus)
    const outerRingGeo = new THREE.TorusGeometry(1.66, 0.035, 16, 64);
    const outerRingMesh = new THREE.Mesh(outerRingGeo, neonRingMaterial);
    outerRingMesh.rotation.x = Math.PI / 2;
    outerRingMesh.position.y = -1.15;
    pedestalGroup.add(outerRingMesh);

    // Inner Glowing Halo Ring (Embedded on top surface)
    const innerRingGeo = new THREE.TorusGeometry(1.28, 0.045, 16, 64);
    const innerRingMesh = new THREE.Mesh(innerRingGeo, neonRingMaterial);
    innerRingMesh.rotation.x = Math.PI / 2;
    innerRingMesh.position.y = -0.96;
    pedestalGroup.add(innerRingMesh);

    // Pedestal Floor Shadow Plane
    const shadowGeo = new THREE.PlaneGeometry(6, 6);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.6 });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -1.4;
    shadowMesh.receiveShadow = true;
    pedestalGroup.add(shadowMesh);
  }

  // 5. Build Sneaker Model (Futuristic silhouette with glowing neon piping)
  function buildSneaker() {
    // 5.1 Outsole
    const soleGeo = new THREE.CylinderGeometry(0.75, 1.05, 0.38, 36);
    soleGeo.scale(2.1, 1, 0.85);
    const soleMesh = new THREE.Mesh(soleGeo, shoeSoleMaterial);
    soleMesh.position.set(0, -0.15, 0);
    soleMesh.castShadow = true;
    sneakerGroup.add(soleMesh);

    // Midsole Glowing Neon Cushion Line
    const soleTrimGeo = new THREE.TorusGeometry(1.0, 0.04, 16, 48);
    soleTrimGeo.scale(1.95, 0.85, 0.75);
    const soleTrimMesh = new THREE.Mesh(soleTrimGeo, shoeNeonTrimMaterial);
    soleTrimMesh.rotation.x = Math.PI / 2;
    soleTrimMesh.position.set(0, -0.05, 0);
    sneakerGroup.add(soleTrimMesh);

    // 5.2 Sculpted Upper Mesh
    const upperGeo = new THREE.CylinderGeometry(0.6, 0.9, 0.95, 36);
    upperGeo.scale(1.85, 1, 0.8);
    const upperMesh = new THREE.Mesh(upperGeo, shoeUpperMaterial);
    upperMesh.position.set(-0.05, 0.42, 0);
    upperMesh.rotation.z = -0.08;
    upperMesh.castShadow = true;
    sneakerGroup.add(upperMesh);

    // 5.3 Aerodynamic Toe Box
    const toeGeo = new THREE.SphereGeometry(0.68, 32, 24);
    toeGeo.scale(1.5, 0.62, 0.9);
    const toeMesh = new THREE.Mesh(toeGeo, shoeUpperMaterial);
    toeMesh.position.set(0.95, 0.16, 0);
    toeMesh.castShadow = true;
    sneakerGroup.add(toeMesh);

    // Toe Glowing Pipings
    const toeTrimCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.5, 0.25, 0.55),
      new THREE.Vector3(1.1, 0.12, 0.4),
      new THREE.Vector3(1.4, 0.05, 0),
      new THREE.Vector3(1.1, 0.12, -0.4),
      new THREE.Vector3(0.5, 0.25, -0.55)
    ]);
    const toeTrimGeo = new THREE.TubeGeometry(toeTrimCurve, 32, 0.035, 10, false);
    const toeTrimMesh = new THREE.Mesh(toeTrimGeo, shoeNeonTrimMaterial);
    sneakerGroup.add(toeTrimMesh);

    // 5.4 Heel Counter
    const heelGeo = new THREE.CylinderGeometry(0.55, 0.72, 1.1, 32);
    heelGeo.scale(0.9, 1, 0.75);
    const heelMesh = new THREE.Mesh(heelGeo, shoeSoleMaterial);
    heelMesh.position.set(-0.95, 0.68, 0);
    heelMesh.rotation.z = 0.28;
    heelMesh.castShadow = true;
    sneakerGroup.add(heelMesh);

    // Heel Pull Tab with glowing edge
    const tabGeo = new THREE.BoxGeometry(0.12, 0.35, 0.08);
    const tabMesh = new THREE.Mesh(tabGeo, shoeAccentTrimMaterial);
    tabMesh.position.set(-1.25, 1.1, 0);
    tabMesh.rotation.z = -0.3;
    sneakerGroup.add(tabMesh);

    // 5.5 Signature Glowing Neon Wave (Lateral & Medial sides matching mockup)
    const waveCurveLateral = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.9, 0.55, 0.65),
      new THREE.Vector3(-0.4, 0.35, 0.78),
      new THREE.Vector3(0.2, 0.65, 0.72),
      new THREE.Vector3(0.8, 0.25, 0.62)
    ]);
    const waveGeoLateral = new THREE.TubeGeometry(waveCurveLateral, 36, 0.045, 12, false);
    const waveMeshLateral = new THREE.Mesh(waveGeoLateral, shoeNeonTrimMaterial);
    sneakerGroup.add(waveMeshLateral);

    // Medial side wave
    const waveCurveMedial = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.9, 0.55, -0.65),
      new THREE.Vector3(-0.4, 0.35, -0.78),
      new THREE.Vector3(0.2, 0.65, -0.72),
      new THREE.Vector3(0.8, 0.25, -0.62)
    ]);
    const waveGeoMedial = new THREE.TubeGeometry(waveCurveMedial, 36, 0.045, 12, false);
    const waveMeshMedial = new THREE.Mesh(waveGeoMedial, shoeNeonTrimMaterial);
    sneakerGroup.add(waveMeshMedial);

    // Additional contour glow lines
    const contourCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.2, 0.85, 0.5),
      new THREE.Vector3(0.3, 0.8, 0.4),
      new THREE.Vector3(0.6, 0.5, 0.5)
    ]);
    const contourGeo = new THREE.TubeGeometry(contourCurve, 20, 0.03, 8, false);
    const contourMesh = new THREE.Mesh(contourGeo, shoeNeonTrimMaterial);
    sneakerGroup.add(contourMesh);

    // 5.6 Futuristic Cross Laces
    for (let k = -0.2; k <= 0.6; k += 0.2) {
      const laceCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(k - 0.05, 0.8 - (k * 0.2), 0.35),
        new THREE.Vector3(k + 0.05, 0.88 - (k * 0.2), 0),
        new THREE.Vector3(k - 0.05, 0.8 - (k * 0.2), -0.35)
      ]);
      const laceGeo = new THREE.TubeGeometry(laceCurve, 16, 0.025, 8, false);
      const laceMesh = new THREE.Mesh(laceGeo, laceMaterial);
      sneakerGroup.add(laceMesh);
    }

    // Set initial dynamic floating sneaker pose
    sneakerGroup.position.set(0, 0.15, 0);
    sneakerGroup.rotation.y = -0.65;
    sneakerGroup.rotation.x = 0.22;
    sneakerGroup.rotation.z = -0.12;
  }

  buildPedestal();
  buildSneaker();

  // 6. Ambient Particle Dust
  const particleCount = 65;
  const particleGeo = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount * 3; i += 3) {
    particlePositions[i] = (Math.random() - 0.5) * 8;
    particlePositions[i + 1] = (Math.random() - 0.5) * 5 + 0.5;
    particlePositions[i + 2] = (Math.random() - 0.5) * 6;
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: currentThemeColor,
    size: 0.035,
    transparent: true,
    opacity: 0.5
  });
  const particleSystem = new THREE.Points(particleGeo, particleMat);
  scene.add(particleSystem);

  // 7. Interaction: Drag to Rotate 360° with inertia
  let isDragging = false;
  let prevPointer = { x: 0, y: 0 };
  let targetRotation = { x: 0.22, y: -0.65 };
  let currentRotation = { x: 0.22, y: -0.65 };

  function onPointerDown(e) {
    isDragging = true;
    prevPointer.x = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    prevPointer.y = e.clientY || (e.touches && e.touches[0].clientY) || 0;
  }

  function onPointerMove(e) {
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;

    // Update cursor light
    const rect = container.getBoundingClientRect();
    const nx = ((clientX - rect.left) / rect.width) * 2 - 1;
    const ny = -((clientY - rect.top) / rect.height) * 2 + 1;
    cursorLight.position.x = nx * 3;
    cursorLight.position.y = ny * 3;

    if (!isDragging) return;

    const deltaX = clientX - prevPointer.x;
    const deltaY = clientY - prevPointer.y;

    targetRotation.y += deltaX * 0.009;
    targetRotation.x += deltaY * 0.006;
    // Constrain pitch so shoe stays upright
    targetRotation.x = Math.max(-0.4, Math.min(0.65, targetRotation.x));

    prevPointer.x = clientX;
    prevPointer.y = clientY;
  }

  function onPointerUp() {
    isDragging = false;
  }

  container.addEventListener('mousedown', onPointerDown);
  window.addEventListener('mousemove', onPointerMove);
  window.addEventListener('mouseup', onPointerUp);

  container.addEventListener('touchstart', onPointerDown, { passive: true });
  window.addEventListener('touchmove', onPointerMove, { passive: true });
  window.addEventListener('touchend', onPointerUp);

  // Carousel Arrow Controls (< and >)
  window.rotateSneaker = function (direction) {
    const step = direction === 'left' ? -0.8 : 0.8;
    targetRotation.y += step;
  };

  // 8. Dynamic Color Swatch Switcher (Cyan, Orange, Purple, Green)
  window.setShoeThemeColor = function (hexColor) {
    currentHex = hexColor;
    currentThemeColor.set(hexColor);

    neonRingMaterial.color.set(currentThemeColor);
    shoeNeonTrimMaterial.color.set(currentThemeColor);
    shoeAccentTrimMaterial.color.set(currentThemeColor);
    shoeAccentTrimMaterial.emissive.set(currentThemeColor);
    pedestalLight.color.set(currentThemeColor);
    backLight.color.set(currentThemeColor);
    cursorLight.color.set(currentThemeColor);
    particleMat.color.set(currentThemeColor);

    // Sync all swatch buttons (both desktop and mobile)
    document.querySelectorAll('[data-swatch-color]').forEach(dot => {
      const dotColor = dot.getAttribute('data-swatch-color');
      if (dotColor.toLowerCase() === hexColor.toLowerCase()) {
        dot.classList.add('ring-2', 'ring-white', 'scale-125');
        dot.classList.remove('opacity-60');
      } else {
        dot.classList.remove('ring-2', 'ring-white', 'scale-125');
        dot.classList.add('opacity-60');
      }
    });

    // Update global CSS variable for neon glow
    document.documentElement.style.setProperty('--current-neon', hexColor);
  };

  // Set default active swatch
  window.setShoeThemeColor('#00E5FF');

  // 9. Animation Render Loop (Anti-Gravity Levitation & Damping)
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const elapsed = clock.getElapsedTime();

    // Gentle anti-gravity floating bob for the sneaker above pedestal
    sneakerGroup.position.y = 0.15 + Math.sin(elapsed * 1.8) * 0.08;

    // Slow ambient rotation when not dragging
    if (!isDragging) {
      targetRotation.y += 0.0025;
    }

    // Smooth rotational interpolation (inertial damping)
    currentRotation.x += (targetRotation.x - currentRotation.x) * 0.08;
    currentRotation.y += (targetRotation.y - currentRotation.y) * 0.08;

    sneakerGroup.rotation.x = currentRotation.x;
    sneakerGroup.rotation.y = currentRotation.y;

    // Pedestal subtle pulse
    pedestalLight.intensity = 3.6 + Math.sin(elapsed * 3) * 0.6;

    // Particle drift
    particleSystem.rotation.y = elapsed * 0.03;

    renderer.render(scene, camera);
  }

  animate();

  // 10. Responsive Canvas Resize
  function handleResize() {
    if (!container) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  window.addEventListener('resize', handleResize);
  setTimeout(handleResize, 150);
})();
