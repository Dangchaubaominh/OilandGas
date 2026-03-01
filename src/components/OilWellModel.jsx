import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const OilWellModel = forwardRef(({ isRunning }, ref) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e1a);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      60,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(15, 12, 15);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // OrbitControls for camera interaction
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 5;
    controls.maxDistance = 50;
    controls.maxPolarAngle = Math.PI / 2;
    controls.target.set(0, 5, 0);
    controls.update();

    // Expose camera control methods
    useImperativeHandle(ref, () => ({
      rotateView: () => {
        controls.autoRotate = !controls.autoRotate;
        controls.autoRotateSpeed = 2.0;
      },
      panView: () => {
        camera.position.x += 2;
        controls.update();
      },
      zoomIn: () => {
        camera.position.multiplyScalar(0.9);
        controls.update();
      },
      resetView: () => {
        camera.position.set(15, 12, 15);
        controls.target.set(0, 5, 0);
        controls.autoRotate = false;
        controls.update();
      }
    }));

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x2563eb, 1, 50);
    pointLight.position.set(0, 15, 0);
    scene.add(pointLight);

    // Ground
    const groundGeometry = new THREE.CircleGeometry(20, 32);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x1a2942,
      roughness: 0.8,
      metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Platform base
    const platformGeometry = new THREE.CylinderGeometry(3, 3.5, 0.5, 8);
    const platformMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x374151,
      roughness: 0.6,
      metalness: 0.4
    });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.y = 0.25;
    platform.castShadow = true;
    scene.add(platform);

    // Derrick structure (oil rig tower)
    const derrickGroup = new THREE.Group();
    
    // Main vertical supports (4 legs)
    const legGeometry = new THREE.BoxGeometry(0.3, 12, 0.3);
    const legMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xef4444,
      roughness: 0.5,
      metalness: 0.6
    });
    
    const positions = [
      [-1.5, 6.5, -1.5],
      [1.5, 6.5, -1.5],
      [-1.5, 6.5, 1.5],
      [1.5, 6.5, 1.5]
    ];

    positions.forEach(pos => {
      const leg = new THREE.Mesh(legGeometry, legMaterial);
      leg.position.set(...pos);
      leg.castShadow = true;
      derrickGroup.add(leg);
    });

    // Horizontal cross beams
    const beamGeometry = new THREE.BoxGeometry(3.3, 0.2, 0.2);
    const beamMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xf97316,
      roughness: 0.5,
      metalness: 0.6
    });

    for (let i = 0; i < 5; i++) {
      const y = 3 + i * 2;
      
      // Front and back beams
      const beam1 = new THREE.Mesh(beamGeometry, beamMaterial);
      beam1.position.set(0, y, -1.5);
      beam1.castShadow = true;
      derrickGroup.add(beam1);

      const beam2 = new THREE.Mesh(beamGeometry, beamMaterial);
      beam2.position.set(0, y, 1.5);
      beam2.castShadow = true;
      derrickGroup.add(beam2);

      // Side beams
      const sideBeamGeometry = new THREE.BoxGeometry(0.2, 0.2, 3.3);
      const beam3 = new THREE.Mesh(sideBeamGeometry, beamMaterial);
      beam3.position.set(-1.5, y, 0);
      beam3.castShadow = true;
      derrickGroup.add(beam3);

      const beam4 = new THREE.Mesh(sideBeamGeometry, beamMaterial);
      beam4.position.set(1.5, y, 0);
      beam4.castShadow = true;
      derrickGroup.add(beam4);
    }

    // Top platform
    const topPlatformGeometry = new THREE.BoxGeometry(3.5, 0.3, 3.5);
    const topPlatformMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x6b7280,
      roughness: 0.4,
      metalness: 0.7
    });
    const topPlatform = new THREE.Mesh(topPlatformGeometry, topPlatformMaterial);
    topPlatform.position.y = 13;
    topPlatform.castShadow = true;
    derrickGroup.add(topPlatform);

    scene.add(derrickGroup);

    // Drilling pipe (rotating part)
    const pipeGeometry = new THREE.CylinderGeometry(0.15, 0.15, 10, 16);
    const pipeMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x94a3b8,
      roughness: 0.3,
      metalness: 0.8
    });
    const drillingPipe = new THREE.Mesh(pipeGeometry, pipeMaterial);
    drillingPipe.position.y = 5;
    drillingPipe.castShadow = true;
    scene.add(drillingPipe);

    // Drill bit at bottom
    const drillBitGeometry = new THREE.ConeGeometry(0.3, 0.8, 8);
    const drillBitMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x1e293b,
      roughness: 0.2,
      metalness: 0.9
    });
    const drillBit = new THREE.Mesh(drillBitGeometry, drillBitMaterial);
    drillBit.position.y = 0.1;
    drillBit.castShadow = true;
    scene.add(drillBit);

    // Control cabin
    const cabinGeometry = new THREE.BoxGeometry(2, 1.5, 1.5);
    const cabinMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x2563eb,
      roughness: 0.5,
      metalness: 0.5
    });
    const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
    cabin.position.set(-4, 1.5, 0);
    cabin.castShadow = true;
    scene.add(cabin);

    // Cabin windows
    const windowGeometry = new THREE.BoxGeometry(0.6, 0.4, 0.05);
    const windowMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x60a5fa,
      emissive: 0x3b82f6,
      emissiveIntensity: 0.5,
      roughness: 0.1,
      metalness: 0.1
    });
    const window1 = new THREE.Mesh(windowGeometry, windowMaterial);
    window1.position.set(-3, 1.8, 0.76);
    scene.add(window1);

    // Storage tanks
    const tankGeometry = new THREE.CylinderGeometry(0.8, 0.8, 2, 16);
    const tankMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x10b981,
      roughness: 0.4,
      metalness: 0.7
    });
    
    const tank1 = new THREE.Mesh(tankGeometry, tankMaterial);
    tank1.position.set(4, 1.5, -2);
    tank1.castShadow = true;
    scene.add(tank1);

    const tank2 = new THREE.Mesh(tankGeometry, tankMaterial);
    tank2.position.set(4, 1.5, 2);
    tank2.castShadow = true;
    scene.add(tank2);

    // Pumping jack (nodding donkey) - simplified
    const pumpJackGroup = new THREE.Group();
    
    // Base
    const pumpBaseGeometry = new THREE.BoxGeometry(1, 0.3, 2);
    const pumpBaseMaterial = new THREE.MeshStandardMaterial({ color: 0x6b7280 });
    const pumpBase = new THREE.Mesh(pumpBaseGeometry, pumpBaseMaterial);
    pumpBase.position.y = 0.65;
    pumpJackGroup.add(pumpBase);

    // Beam
    const beamPumpGeometry = new THREE.BoxGeometry(3, 0.2, 0.3);
    const beamPumpMaterial = new THREE.MeshStandardMaterial({ color: 0xef4444 });
    const beamPump = new THREE.Mesh(beamPumpGeometry, beamPumpMaterial);
    beamPump.position.y = 2;
    pumpJackGroup.add(beamPump);

    // Support
    const supportGeometry = new THREE.BoxGeometry(0.2, 2, 0.2);
    const supportMaterial = new THREE.MeshStandardMaterial({ color: 0xf97316 });
    const support = new THREE.Mesh(supportGeometry, supportMaterial);
    support.position.y = 1.5;
    pumpJackGroup.add(support);

    pumpJackGroup.position.set(-6, 0, -4);
    scene.add(pumpJackGroup);

    // Grid floor
    const gridHelper = new THREE.GridHelper(20, 20, 0x1a2942, 0x0f1624);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // Animation
    let rotationSpeed = 0;
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);

      if (isRunning) {
        rotationSpeed = Math.min(rotationSpeed + 0.001, 0.02);
        drillingPipe.rotation.y += rotationSpeed;
        drillBit.rotation.y += rotationSpeed;
        derrickGroup.rotation.y += 0.005;
        
        // Pump jack animation
        beamPump.rotation.z = Math.sin(Date.now() * 0.001) * 0.3;
      } else {
        rotationSpeed = Math.max(rotationSpeed - 0.001, 0);
        drillingPipe.rotation.y += rotationSpeed;
        drillBit.rotation.y += rotationSpeed;
      }

      // Update controls for camera interaction
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
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isRunning]);

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />;
});

OilWellModel.displayName = 'OilWellModel';

export default OilWellModel;
