import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default function OilWell3D({ isRunning }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const animationRef = useRef(null);
  const drillingPipeRef = useRef(null);
  const drillBitRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    console.log('OilWell3D mounting...', mountRef.current);

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e1a);
    scene.fog = new THREE.Fog(0x0a0e1a, 30, 100);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      50,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(20, 15, 20);
    camera.lookAt(0, 0, 0);

    console.log('Camera position:', camera.position);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    console.log('Renderer size:', mountRef.current.clientWidth, 'x', mountRef.current.clientHeight);
    console.log('Canvas appended:', renderer.domElement);

    // OrbitControls - camera luôn có thể xoay bằng chuột
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enabled = true; // Always enable mouse control
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 10;
    controls.maxDistance = 60;
    controls.maxPolarAngle = Math.PI / 2.1;
    controls.target.set(0, 5, 0);
    controls.autoRotate = false; // No auto-rotation, only manual control
    controls.enablePan = true; // Right-click to pan
    controls.enableZoom = true; // Scroll to zoom
    controls.update();

    console.log('OrbitControls initialized');

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(15, 25, 15);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.left = -30;
    directionalLight.shadow.camera.right = 30;
    directionalLight.shadow.camera.top = 30;
    directionalLight.shadow.camera.bottom = -30;
    scene.add(directionalLight);

    // Point lights for accent
    const pointLight1 = new THREE.PointLight(0x3b82f6, 1, 30);
    pointLight1.position.set(0, 15, 0);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xef4444, 0.5, 20);
    pointLight2.position.set(-5, 10, -5);
    scene.add(pointLight2);

    // Ground
    const groundGeometry = new THREE.CircleGeometry(30, 64);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a2942,
      roughness: 0.9,
      metalness: 0.1
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid helper
    const gridHelper = new THREE.GridHelper(50, 50, 0x2563eb, 0x1e293b);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // ===== OIL WELL STRUCTURE =====

    // Platform base
    const platformGeometry = new THREE.CylinderGeometry(4, 4.5, 0.8, 8);
    const platformMaterial = new THREE.MeshStandardMaterial({
      color: 0x374151,
      roughness: 0.6,
      metalness: 0.3
    });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.y = 0.4;
    platform.castShadow = true;
    platform.receiveShadow = true;
    scene.add(platform);

    // Derrick Tower (Drilling Rig Structure)
    const derrickGroup = new THREE.Group();
    
    // Tower legs (4 corners)
    const legGeometry = new THREE.BoxGeometry(0.4, 14, 0.4);
    const legMaterial = new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      roughness: 0.7,
      metalness: 0.4
    });

    const legPositions = [
      [-2.5, 7, -2.5],
      [2.5, 7, -2.5],
      [-2.5, 7, 2.5],
      [2.5, 7, 2.5]
    ];

    legPositions.forEach(pos => {
      const leg = new THREE.Mesh(legGeometry, legMaterial);
      leg.position.set(...pos);
      leg.castShadow = true;
      derrickGroup.add(leg);
    });

    // Horizontal cross beams
    const beamGeometry = new THREE.BoxGeometry(5.4, 0.3, 0.3);
    const beamMaterial = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      roughness: 0.7,
      metalness: 0.4
    });

    for (let i = 0; i < 6; i++) {
      const height = 2 + i * 2.2;
      
      // Front and back beams
      const beamFront = new THREE.Mesh(beamGeometry, beamMaterial);
      beamFront.position.set(0, height, -2.5);
      beamFront.castShadow = true;
      derrickGroup.add(beamFront);

      const beamBack = new THREE.Mesh(beamGeometry, beamMaterial);
      beamBack.position.set(0, height, 2.5);
      beamBack.castShadow = true;
      derrickGroup.add(beamBack);

      // Left and right beams
      const beamLeft = new THREE.Mesh(beamGeometry, beamMaterial);
      beamLeft.rotation.y = Math.PI / 2;
      beamLeft.position.set(-2.5, height, 0);
      beamLeft.castShadow = true;
      derrickGroup.add(beamLeft);

      const beamRight = new THREE.Mesh(beamGeometry, beamMaterial);
      beamRight.rotation.y = Math.PI / 2;
      beamRight.position.set(2.5, height, 0);
      beamRight.castShadow = true;
      derrickGroup.add(beamRight);
    }

    // Derrick top platform
    const topPlatformGeometry = new THREE.BoxGeometry(6, 0.3, 6);
    const topPlatform = new THREE.Mesh(topPlatformGeometry, platformMaterial);
    topPlatform.position.y = 14;
    topPlatform.castShadow = true;
    derrickGroup.add(topPlatform);

    scene.add(derrickGroup);

    // Drilling pipe (rotating when active)
    const pipeGeometry = new THREE.CylinderGeometry(0.2, 0.2, 12, 16);
    const pipeMaterial = new THREE.MeshStandardMaterial({
      color: 0x6b7280,
      roughness: 0.4,
      metalness: 0.8
    });
    const drillingPipe = new THREE.Mesh(pipeGeometry, pipeMaterial);
    drillingPipe.position.y = 5;
    drillingPipe.castShadow = true;
    scene.add(drillingPipe);
    drillingPipeRef.current = drillingPipe;

    // Drill bit
    const drillBitGeometry = new THREE.ConeGeometry(0.4, 1, 8);
    const drillBitMaterial = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      roughness: 0.3,
      metalness: 0.9,
      emissive: 0x1e40af,
      emissiveIntensity: 0.3
    });
    const drillBit = new THREE.Mesh(drillBitGeometry, drillBitMaterial);
    drillBit.position.y = -0.5;
    drillBit.castShadow = true;
    scene.add(drillBit);
    drillBitRef.current = drillBit;

    // Control cabin
    const cabinGeometry = new THREE.BoxGeometry(2.5, 2, 2);
    const cabinMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e40af,
      roughness: 0.5,
      metalness: 0.3
    });
    const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
    cabin.position.set(-5, 1.8, 0);
    cabin.castShadow = true;
    scene.add(cabin);

    // Cabin windows (emissive)
    const windowGeometry = new THREE.BoxGeometry(0.6, 0.5, 0.1);
    const windowMaterial = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xfbbf24,
      emissiveIntensity: 0.8,
      roughness: 0.2
    });

    [-0.7, 0, 0.7].forEach(x => {
      const window1 = new THREE.Mesh(windowGeometry, windowMaterial);
      window1.position.set(-5 + x, 2.2, 1.01);
      scene.add(window1);
    });

    // Storage tanks
    const tankGeometry = new THREE.CylinderGeometry(1, 1, 2.5, 16);
    const tankMaterial = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      roughness: 0.4,
      metalness: 0.6
    });

    const tank1 = new THREE.Mesh(tankGeometry, tankMaterial);
    tank1.position.set(6, 1.25, -3);
    tank1.castShadow = true;
    scene.add(tank1);

    const tank2 = new THREE.Mesh(tankGeometry, tankMaterial);
    tank2.position.set(6, 1.25, 3);
    tank2.castShadow = true;
    scene.add(tank2);

    // Pumping jack (nodding donkey)
    const pumpGroup = new THREE.Group();
    
    const baseGeometry = new THREE.BoxGeometry(1.5, 0.8, 1.5);
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0x6b7280,
      roughness: 0.7,
      metalness: 0.5
    });
    const pumpBase = new THREE.Mesh(baseGeometry, baseMaterial);
    pumpBase.position.y = 0.4;
    pumpBase.castShadow = true;
    pumpGroup.add(pumpBase);

    const beamPumpGeometry = new THREE.BoxGeometry(3, 0.3, 0.3);
    const beamPump = new THREE.Mesh(beamPumpGeometry, new THREE.MeshStandardMaterial({
      color: 0xef4444,
      roughness: 0.6,
      metalness: 0.5
    }));
    beamPump.position.set(0, 2.5, 0);
    beamPump.castShadow = true;
    pumpGroup.add(beamPump);

    const supportGeometry = new THREE.BoxGeometry(0.3, 2, 0.3);
    const support = new THREE.Mesh(supportGeometry, baseMaterial);
    support.position.set(-1, 1.5, 0);
    support.castShadow = true;
    pumpGroup.add(support);

    pumpGroup.position.set(-8, 0, 6);
    scene.add(pumpGroup);

    // Pipes connecting equipment
    const pipeConnectGeometry = new THREE.CylinderGeometry(0.1, 0.1, 8, 8);
    const pipeConnectMaterial = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.6,
      metalness: 0.7
    });

    const pipe1 = new THREE.Mesh(pipeConnectGeometry, pipeConnectMaterial);
    pipe1.rotation.z = Math.PI / 2;
    pipe1.position.set(1, 0.5, -3);
    pipe1.castShadow = true;
    scene.add(pipe1);

    const pipe2 = new THREE.Mesh(pipeConnectGeometry, pipeConnectMaterial);
    pipe2.rotation.z = Math.PI / 2;
    pipe2.position.set(1, 0.5, 3);
    pipe2.castShadow = true;
    scene.add(pipe2);

    // Animation loop
    let rotationSpeed = 0;
    let pumpAngle = 0;

    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);

      if (isRunning && drillingPipeRef.current && drillBitRef.current) {
        // Drilling rotation
        rotationSpeed += 0.001;
        const maxSpeed = 0.1;
        if (rotationSpeed > maxSpeed) rotationSpeed = maxSpeed;

        drillingPipeRef.current.rotation.y += rotationSpeed;
        drillBitRef.current.rotation.y += rotationSpeed;

        // Pumping jack animation
        pumpAngle += 0.02;
        beamPump.rotation.z = Math.sin(pumpAngle) * 0.3;
      } else {
        rotationSpeed *= 0.95;
        if (rotationSpeed > 0.001) {
          drillingPipeRef.current.rotation.y += rotationSpeed;
          drillBitRef.current.rotation.y += rotationSpeed;
        }
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      controls.dispose();
      if (mountRef.current && renderer.domElement && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      
      // Dispose geometries and materials
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    };
  }, [isRunning]);

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />;
}
