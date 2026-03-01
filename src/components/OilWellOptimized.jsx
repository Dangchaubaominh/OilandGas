import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default function OilWellOptimized({ isRunning }) {
  const mountRef = useRef(null);
  const drillingPipeRef = useRef(null);
  const drillBitRef = useRef(null);
  const drillCollarRef = useRef(null);
  const pumpBeamRef = useRef(null);
  const counterWeightRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e1a);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      60,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      500
    );
    camera.position.set(15, 10, 15);
    camera.lookAt(0, 5, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.touchAction = 'none';
    mountRef.current.appendChild(renderer.domElement);
    
    console.log('✅ Oil Well Renderer initialized, canvas size:', mountRef.current.clientWidth, 'x', mountRef.current.clientHeight);

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enabled = true;
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.target.set(0, 5, 0);
    controls.enableZoom = true;
    controls.enableRotate = true;
    controls.enablePan = true;
    controls.minDistance = 8;
    controls.maxDistance = 40;
    controls.update();
    
    console.log('✅ OrbitControls enabled. Try dragging with mouse!');

    // Mouse interaction test
    renderer.domElement.addEventListener('mousedown', () => {
      console.log('🖱️ Oil Well canvas clicked!');
    });

    // Enhanced Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(15, 25, 15);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.left = -20;
    dirLight.shadow.camera.right = 20;
    dirLight.shadow.camera.top = 20;
    dirLight.shadow.camera.bottom = -20;
    scene.add(dirLight);
    
    const dirLight2 = new THREE.DirectionalLight(0xffd700, 0.3);
    dirLight2.position.set(-10, 15, -10);
    scene.add(dirLight2);
    
    // Point lights for atmosphere
    const pointLight1 = new THREE.PointLight(0x2563eb, 1.5, 30);
    pointLight1.position.set(0, 18, 0);
    scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0xef4444, 1, 15);
    pointLight2.position.set(-4, 3, 0);
    scene.add(pointLight2);

    // Ground with texture-like appearance
    const groundGeo = new THREE.CircleGeometry(25, 64);
    const groundMat = new THREE.MeshStandardMaterial({ 
      color: 0x1a2942,
      roughness: 0.9,
      metalness: 0.1
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid
    const grid = new THREE.GridHelper(50, 50, 0x2563eb, 0x1e293b);
    grid.position.y = 0.01;
    scene.add(grid);
    
    // Concrete pad around well
    const padGeo = new THREE.CircleGeometry(6, 32);
    const padMat = new THREE.MeshStandardMaterial({ 
      color: 0x4a5568,
      roughness: 0.8,
      metalness: 0.2
    });
    const pad = new THREE.Mesh(padGeo, padMat);
    pad.rotation.x = -Math.PI / 2;
    pad.position.y = 0.02;
    pad.receiveShadow = true;
    scene.add(pad);

    // Platform with better material
    const platformGeo = new THREE.CylinderGeometry(3.5, 4, 0.8, 8);
    const platformMat = new THREE.MeshStandardMaterial({ 
      color: 0x374151,
      roughness: 0.6,
      metalness: 0.4
    });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.y = 0.4;
    platform.castShadow = true;
    platform.receiveShadow = true;
    scene.add(platform);
    
    // Platform railings
    const railingGeo = new THREE.TorusGeometry(3.5, 0.08, 8, 24);
    const railingMat = new THREE.MeshStandardMaterial({ 
      color: 0xfbbf24,
      roughness: 0.3,
      metalness: 0.8
    });
    const railing = new THREE.Mesh(railingGeo, railingMat);
    railing.rotation.x = Math.PI / 2;
    railing.position.y = 1.2;
    railing.castShadow = true;
    scene.add(railing);

    // Derrick Tower - simplified
    const derrickGroup = new THREE.Group();
    
    // 4 tower legs with better material
    const legGeo = new THREE.BoxGeometry(0.4, 14, 0.4);
    const legMat = new THREE.MeshStandardMaterial({ 
      color: 0xdc2626,
      roughness: 0.7,
      metalness: 0.5
    });
    
    const positions = [
      [-2, 6, -2],
      [2, 6, -2],
      [-2, 6, 2],
      [2, 6, 2]
    ];

    positions.forEach(pos => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(...pos);
      leg.castShadow = true;
      leg.receiveShadow = true;
      derrickGroup.add(leg);
    });

    // Horizontal beams - 4 levels for detail
    const beamGeo = new THREE.BoxGeometry(5.4, 0.25, 0.25);
    const beamMat = new THREE.MeshStandardMaterial({ 
      color: 0xef4444,
      roughness: 0.6,
      metalness: 0.5
    });

    [2.5, 5, 8, 11].forEach(height => {
      // Front beam
      const beam1 = new THREE.Mesh(beamGeo, beamMat);
      beam1.position.set(0, height, -2.5);
      beam1.castShadow = true;
      derrickGroup.add(beam1);

      // Back beam
      const beam2 = new THREE.Mesh(beamGeo, beamMat);
      beam2.position.set(0, height, 2.5);
      beam2.castShadow = true;
      derrickGroup.add(beam2);

      // Left beam
      const beam3 = new THREE.Mesh(beamGeo, beamMat);
      beam3.rotation.y = Math.PI / 2;
      beam3.position.set(-2.5, height, 0);
      beam3.castShadow = true;
      derrickGroup.add(beam3);

      // Right beam
      const beam4 = new THREE.Mesh(beamGeo, beamMat);
      beam4.rotation.y = Math.PI / 2;
      beam4.position.set(2.5, height, 0);
      beam4.castShadow = true;
      derrickGroup.add(beam4);
    });

    // Top platform
    const topGeo = new THREE.BoxGeometry(6, 0.3, 6);
    const top = new THREE.Mesh(topGeo, platformMat);
    top.position.y = 14;
    top.castShadow = true;
    derrickGroup.add(top);
    
    // Diagonal braces for structural detail
    const braceGeo = new THREE.BoxGeometry(0.15, 3.5, 0.15);
    const braceMat = new THREE.MeshStandardMaterial({ 
      color: 0xfbbf24,
      roughness: 0.5,
      metalness: 0.6
    });
    
    // Add X-braces on each side
    for (let i = 0; i < 4; i++) {
      const brace1 = new THREE.Mesh(braceGeo, braceMat);
      brace1.rotation.z = Math.PI / 4;
      brace1.position.set(i < 2 ? -2.5 : 2.5, 4, i % 2 === 0 ? -2.5 : 2.5);
      brace1.castShadow = true;
      derrickGroup.add(brace1);
    }

    scene.add(derrickGroup);

    // Drilling pipe (rotating) with better detail
    const pipeGeo = new THREE.CylinderGeometry(0.2, 0.2, 12, 16);
    const pipeMat = new THREE.MeshStandardMaterial({ 
      color: 0x6b7280,
      roughness: 0.4,
      metalness: 0.9
    });
    const pipe = new THREE.Mesh(pipeGeo, pipeMat);
    pipe.position.y = 5;
    pipe.castShadow = true;
    scene.add(pipe);
    drillingPipeRef.current = pipe;
    
    // Drill collar (thicker section)
    const collarGeo = new THREE.CylinderGeometry(0.3, 0.3, 2, 16);
    const collarMat = new THREE.MeshStandardMaterial({ 
      color: 0x475569,
      roughness: 0.3,
      metalness: 0.9
    });
    const collar = new THREE.Mesh(collarGeo, collarMat);
    collar.position.y = 0;
    collar.castShadow = true;
    scene.add(collar);
    drillCollarRef.current = collar;

    // Drill bit with glow
    const bitGeo = new THREE.ConeGeometry(0.4, 1, 8);
    const bitMat = new THREE.MeshStandardMaterial({ 
      color: 0x3b82f6,
      emissive: 0x1e40af,
      emissiveIntensity: 0.5,
      roughness: 0.2,
      metalness: 0.9
    });
    const bit = new THREE.Mesh(bitGeo, bitMat);
    bit.position.y = -1.5;
    bit.castShadow = true;
    scene.add(bit);
    drillBitRef.current = bit;

    // Control cabin with detail
    const cabinGeo = new THREE.BoxGeometry(2.5, 2, 2);
    const cabinMat = new THREE.MeshStandardMaterial({ 
      color: 0x1e40af,
      roughness: 0.5,
      metalness: 0.3
    });
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.set(-5, 1.5, 0);
    cabin.castShadow = true;
    cabin.receiveShadow = true;
    scene.add(cabin);
    
    // Cabin roof
    const roofGeo = new THREE.BoxGeometry(2.7, 0.2, 2.2);
    const roofMat = new THREE.MeshStandardMaterial({ 
      color: 0x1e3a8a,
      roughness: 0.6,
      metalness: 0.4
    });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(-5, 2.6, 0);
    roof.castShadow = true;
    scene.add(roof);
    
    // Cabin door
    const doorGeo = new THREE.BoxGeometry(0.8, 1.5, 0.1);
    const doorMat = new THREE.MeshStandardMaterial({ 
      color: 0x374151,
      roughness: 0.7
    });
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.set(-5, 1.3, 1.01);
    scene.add(door);

    // Windows (glowing)
    const windowGeo = new THREE.BoxGeometry(0.5, 0.6, 0.05);
    const windowMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xfbbf24,
      emissiveIntensity: 1.2,
      transparent: true,
      opacity: 0.9
    });

    [-0.8, 0.8].forEach(x => {
      const window1 = new THREE.Mesh(windowGeo, windowMat);
      window1.position.set(-5 + x, 1.8, 1.01);
      scene.add(window1);
    });

    // Storage tanks with detail
    const tankGeo = new THREE.CylinderGeometry(1, 1, 3, 16);
    const tankMat = new THREE.MeshStandardMaterial({ 
      color: 0x10b981,
      roughness: 0.4,
      metalness: 0.7
    });

    const tank1 = new THREE.Mesh(tankGeo, tankMat);
    tank1.position.set(6, 1.5, -3);
    tank1.castShadow = true;
    tank1.receiveShadow = true;
    scene.add(tank1);

    const tank2 = new THREE.Mesh(tankGeo, tankMat);
    tank2.position.set(6, 1.5, 3);
    tank2.castShadow = true;
    tank2.receiveShadow = true;
    scene.add(tank2);
    
    // Tank tops
    const topCapGeo = new THREE.CylinderGeometry(1, 1, 0.2, 16);
    const topCapMat = new THREE.MeshStandardMaterial({ 
      color: 0x059669,
      roughness: 0.5,
      metalness: 0.6
    });
    
    const cap1 = new THREE.Mesh(topCapGeo, topCapMat);
    cap1.position.set(6, 3.1, -3);
    cap1.castShadow = true;
    scene.add(cap1);
    
    const cap2 = new THREE.Mesh(topCapGeo, topCapMat);
    cap2.position.set(6, 3.1, 3);
    cap2.castShadow = true;
    scene.add(cap2);
    
    // Connecting pipes
    const connectPipeGeo = new THREE.CylinderGeometry(0.1, 0.1, 6, 8);
    const connectPipeMat = new THREE.MeshStandardMaterial({ 
      color: 0x475569,
      roughness: 0.5,
      metalness: 0.8
    });
    
    const connPipe1 = new THREE.Mesh(connectPipeGeo, connectPipeMat);
    connPipe1.rotation.z = Math.PI / 2;
    connPipe1.position.set(2.5, 0.5, -3);
    connPipe1.castShadow = true;
    scene.add(connPipe1);
    
    const connPipe2 = new THREE.Mesh(connectPipeGeo, connectPipeMat);
    connPipe2.rotation.z = Math.PI / 2;
    connPipe2.position.set(2.5, 0.5, 3);
    connPipe2.castShadow = true;
    scene.add(connPipe2);

    // Pumping jack with detail
    const pumpBase = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 1, 1.5),
      new THREE.MeshStandardMaterial({ 
        color: 0x6b7280,
        roughness: 0.7,
        metalness: 0.5
      })
    );
    pumpBase.position.set(-7, 0.5, 6);
    pumpBase.castShadow = true;
    scene.add(pumpBase);

    const pumpBeam = new THREE.Mesh(
      new THREE.BoxGeometry(3, 0.3, 0.3),
      new THREE.MeshStandardMaterial({ 
        color: 0xef4444,
        roughness: 0.6,
        metalness: 0.5
      })
    );
    pumpBeam.position.set(-7, 2, 6);
    pumpBeam.castShadow = true;
    scene.add(pumpBeam);
    pumpBeamRef.current = pumpBeam;
    
    // Pump support post
    const pumpPost = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 2, 0.3),
      new THREE.MeshStandardMaterial({ 
        color: 0x6b7280,
        roughness: 0.7,
        metalness: 0.5
      })
    );
    pumpPost.position.set(-8, 1.5, 6);
    pumpPost.castShadow = true;
    scene.add(pumpPost);
    
    // Counterweight
    const counterWeightGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const counterWeightMat = new THREE.MeshStandardMaterial({ 
      color: 0x374151,
      roughness: 0.8,
      metalness: 0.3
    });
    const counterWeight = new THREE.Mesh(counterWeightGeo, counterWeightMat);
    counterWeight.position.set(-5.5, 2, 6);
    counterWeight.castShadow = true;
    scene.add(counterWeight);
    counterWeightRef.current = counterWeight;

    // Animation
    let rotationSpeed = 0;
    let pumpAngle = 0;

    const animate = () => {
      requestAnimationFrame(animate);

      if (isRunning && drillingPipeRef.current && drillBitRef.current) {
        rotationSpeed += 0.002;
        if (rotationSpeed > 0.08) rotationSpeed = 0.08;
        
        drillingPipeRef.current.rotation.y += rotationSpeed;
        drillBitRef.current.rotation.y += rotationSpeed;
        drillCollarRef.current.rotation.y += rotationSpeed;

        pumpAngle += 0.03;
        pumpBeamRef.current.rotation.z = Math.sin(pumpAngle) * 0.25;
        counterWeightRef.current.rotation.z = Math.sin(pumpAngle) * -0.15;
      } else {
        rotationSpeed *= 0.96;
        if (rotationSpeed > 0.001) {
          drillingPipeRef.current.rotation.y += rotationSpeed;
          drillBitRef.current.rotation.y += rotationSpeed;
          drillCollarRef.current.rotation.y += rotationSpeed;
        }
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
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
      controls.dispose();
      if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
    };
  }, [isRunning]);

  return (
    <div 
      ref={mountRef} 
      style={{ 
        width: '100%', 
        height: '100%',
        position: 'relative',
        overflow: 'hidden'
      }} 
    />
  );
}
