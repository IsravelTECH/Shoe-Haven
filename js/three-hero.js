/**
 * Shoe Haven (HAVEN-X) - 3D Kinetic Sneaker Stage
 * Powered by Three.js
 */

(function () {
  const container = document.getElementById('three-canvas-container');
  if (!container) return;

  // Verify Three.js availability
  if (typeof THREE === 'undefined') {
    container.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-muted);font-size:0.9rem;">
        <i class="bi bi-box me-2"></i> 3D Kinetic Stage Initializing...
      </div>`;
    return;
  }

  // Scene, Camera, Renderer
  const scene = new THREE.Scene();
  const width = container.clientWidth || 500;
  const height = container.clientHeight || 500;

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(0, 0.5, 5.2);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // Group for the 3D sneaker assembly
  const sneakerGroup = new THREE.Group();
  scene.add(sneakerGroup);

  // Lighting System
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0x00f0ff, 2.5);
  keyLight.position.set(5, 5, 4);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x8b5cf6, 2.0);
  fillLight.position.set(-5, -2, -3);
  scene.add(fillLight);

  const rimLight = new THREE.PointLight(0xffffff, 2.0, 10);
  rimLight.position.set(0, 4, -4);
  scene.add(rimLight);

  // Interactive Cursor Light
  const cursorLight = new THREE.PointLight(0x00f0ff, 3, 6);
  cursorLight.position.set(0, 1, 2);
  scene.add(cursorLight);

  // Materials
  const soleMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x111625,
    roughness: 0.2,
    metalness: 0.1,
    clearcoat: 0.8,
    clearcoatRoughness: 0.1
  });

  const upperMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x00f0ff,
    roughness: 0.35,
    metalness: 0.25,
    clearcoat: 0.5
  });

  const accentMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.2,
    metalness: 0.8,
    emissive: 0x00f0ff,
    emissiveIntensity: 0.25
  });

  const laceMaterial = new THREE.MeshStandardMaterial({
    color: 0x0a0d14,
    roughness: 0.9,
    metalness: 0.05
  });

  // Construct Procedural High-Detail Sneaker Model
  function buildSneakerModel() {
    // 1. Aerodynamic Outsole
    const soleGeo = new THREE.CylinderGeometry(0.85, 1.15, 0.35, 32);
    soleGeo.scale(1.9, 1, 0.85);
    const soleMesh = new THREE.Mesh(soleGeo, soleMaterial);
    soleMesh.position.set(0, -0.6, 0);
    soleMesh.castShadow = true;
    soleMesh.receiveShadow = true;
    sneakerGroup.add(soleMesh);

    // Outsole Cushion Pods
    for (let i = -1.2; i <= 1.2; i += 0.55) {
      const podGeo = new THREE.SphereGeometry(0.18, 16, 16);
      podGeo.scale(1, 0.6, 1.5);
      const podMesh = new THREE.Mesh(podGeo, accentMaterial);
      podMesh.position.set(i, -0.72, 0);
      sneakerGroup.add(podMesh);
    }

    // 2. Sculpted Upper Body
    const upperGeo = new THREE.CylinderGeometry(0.65, 0.95, 0.9, 32);
    upperGeo.scale(1.7, 1, 0.8);
    const upperMesh = new THREE.Mesh(upperGeo, upperMaterial);
    upperMesh.position.set(0, -0.1, 0);
    upperMesh.rotation.z = -0.06;
    upperMesh.castShadow = true;
    sneakerGroup.add(upperMesh);

    // 3. Ergonomic Toe Box
    const toeGeo = new THREE.SphereGeometry(0.65, 32, 16);
    toeGeo.scale(1.4, 0.6, 0.95);
    const toeMesh = new THREE.Mesh(toeGeo, upperMaterial);
    toeMesh.position.set(0.85, -0.32, 0);
    sneakerGroup.add(toeMesh);

    // 4. Heel Counter & Collar
    const heelGeo = new THREE.CylinderGeometry(0.55, 0.75, 1.0, 32);
    heelGeo.scale(0.9, 1, 0.75);
    const heelMesh = new THREE.Mesh(heelGeo, soleMaterial);
    heelMesh.position.set(-0.85, 0.15, 0);
    heelMesh.rotation.z = 0.25;
    sneakerGroup.add(heelMesh);

    // 5. Kinetic Holographic Swoosh / Stripe
    const stripeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.9, 0.1, 0.65),
      new THREE.Vector3(-0.1, -0.1, 0.75),
      new THREE.Vector3(0.9, -0.15, 0.6)
    ]);
    const stripeGeo = new THREE.TubeGeometry(stripeCurve, 30, 0.06, 8, false);
    const stripeMesh = new THREE.Mesh(stripeGeo, accentMaterial);
    sneakerGroup.add(stripeMesh);

    const stripeMeshBack = stripeMesh.clone();
    stripeMeshBack.position.z = -1.2;
    sneakerGroup.add(stripeMeshBack);

    // 6. Modern Cross Laces
    for (let j = -0.3; j <= 0.5; j += 0.22) {
      const laceGeo = new THREE.TorusGeometry(0.28, 0.03, 8, 24, Math.PI);
      const laceMesh = new THREE.Mesh(laceGeo, laceMaterial);
      laceMesh.rotation.x = Math.PI / 2;
      laceMesh.rotation.y = 0.2;
      laceMesh.position.set(j, 0.25 - j * 0.15, 0);
      sneakerGroup.add(laceMesh);
    }

    // Default tilt & presentation angle
    sneakerGroup.rotation.y = -0.6;
    sneakerGroup.rotation.x = 0.25;
    sneakerGroup.rotation.z = -0.1;
  }

  buildSneakerModel();

  // Floating Anti-Gravity Particles
  const particleCount = 40;
  const particlesGeo = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);

  for (let p = 0; p < particleCount * 3; p += 3) {
    particlePositions[p] = (Math.random() - 0.5) * 6;
    particlePositions[p + 1] = (Math.random() - 0.5) * 4;
    particlePositions[p + 2] = (Math.random() - 0.5) * 4;
  }
  particlesGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0x00f0ff,
    size: 0.04,
    transparent: true,
    opacity: 0.6
  });
  const particleSystem = new THREE.Points(particlesGeo, particleMat);
  scene.add(particleSystem);

  // Interaction State
  let isDragging = false;
  let prevMousePos = { x: 0, y: 0 };
  let targetRotation = { x: 0.25, y: -0.6 };
  let currentRotation = { x: 0.25, y: -0.6 };

  // Mouse & Touch Drag Controls
  function onPointerDown(e) {
    isDragging = true;
    prevMousePos = {
      x: e.clientX || (e.touches && e.touches[0].clientX) || 0,
      y: e.clientY || (e.touches && e.touches[0].clientY) || 0
    };
  }

  function onPointerMove(e) {
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;

    // Update cursor light
    const rect = container.getBoundingClientRect();
    const nx = ((clientX - rect.left) / rect.width) * 2 - 1;
    const ny = -((clientY - rect.top) / rect.height) * 2 + 1;
    cursorLight.position.x = nx * 2.5;
    cursorLight.position.y = ny * 2.5;

    if (!isDragging) return;

    const deltaX = clientX - prevMousePos.x;
    const deltaY = clientY - prevMousePos.y;

    targetRotation.y += deltaX * 0.008;
    targetRotation.x += deltaY * 0.006;
    targetRotation.x = Math.max(-0.6, Math.min(0.8, targetRotation.x));

    prevMousePos = { x: clientX, y: clientY };
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

  // Colorway Swatches
  const swatches = document.querySelectorAll('.color-swatch-dot');
  swatches.forEach(swatch => {
    swatch.addEventListener('click', function () {
      swatches.forEach(s => s.classList.remove('active'));
      this.classList.add('active');

      const hex = this.getAttribute('data-color') || '#00F0FF';
      const threeColor = new THREE.Color(hex);
      upperMaterial.color.set(threeColor);
      accentMaterial.emissive.set(threeColor);
      cursorLight.color.set(threeColor);
      keyLight.color.set(threeColor);
    });
  });

  // Render Loop with Anti-Gravity Float
  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const elapsed = clock.getElapsedTime();

    // Gentle floating bob
    sneakerGroup.position.y = Math.sin(elapsed * 1.5) * 0.12;

    // Smooth rotation interpolation
    if (!isDragging) {
      targetRotation.y += 0.003; // Slow ambient orbit
    }
    currentRotation.x += (targetRotation.x - currentRotation.x) * 0.08;
    currentRotation.y += (targetRotation.y - currentRotation.y) * 0.08;

    sneakerGroup.rotation.x = currentRotation.x;
    sneakerGroup.rotation.y = currentRotation.y;

    // Particle subtle drift
    particleSystem.rotation.y = elapsed * 0.05;

    renderer.render(scene, camera);
  }

  animate();

  // Responsive Resize
  window.addEventListener('resize', () => {
    if (!container) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
})();
