import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default function SimpleTest3D() {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    console.log('SimpleTest3D mounting...');

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e1a);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.pointerEvents = 'auto';
    renderer.domElement.style.touchAction = 'none';
    mountRef.current.appendChild(renderer.domElement);

    console.log('Canvas size:', mountRef.current.clientWidth, mountRef.current.clientHeight);
    console.log('Canvas element:', renderer.domElement);
    console.log('Canvas style:', renderer.domElement.style.cssText);
    console.log('Canvas dimensions:', renderer.domElement.width, 'x', renderer.domElement.height);

    // Add visible marker to verify canvas is rendered
    renderer.domElement.id = 'three-canvas';
    renderer.domElement.dataset.test = 'interactive';

    // Controls - explicitly enable everything
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enabled = true;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.enableRotate = true;
    controls.enablePan = true;
    
    console.log('OrbitControls created:', {
      enabled: controls.enabled,
      domElement: controls.domElement,
      enableRotate: controls.enableRotate
    });

    // Test mouse events
    renderer.domElement.addEventListener('mousedown', (e) => {
      console.log('🖱️ Canvas mousedown!', e.button, 'at', e.clientX, e.clientY);
    });
    
    let dragCount = 0;
    renderer.domElement.addEventListener('mousemove', (e) => {
      if (e.buttons > 0) {
        dragCount++;
        if (dragCount % 10 === 0) { // Log every 10 moves to avoid spam
          console.log('🖱️ Canvas dragging!', e.movementX, e.movementY);
        }
      }
    });
    
    renderer.domElement.addEventListener('mouseup', (e) => {
      console.log('🖱️ Canvas mouseup!');
      dragCount = 0;
    });
    
    renderer.domElement.addEventListener('wheel', (e) => {
      console.log('🖱️ Canvas wheel!', e.deltaY);
    });

    // Simple cube
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // Lights
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    scene.add(light);

    console.log('Scene setup complete');

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      controls.update();
      renderer.render(scene, camera);
    };

    animate();
    console.log('Animation started');

    // Cleanup
    return () => {
      console.log('Cleaning up...');
      controls.dispose();
      if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      style={{ 
        width: '100%', 
        height: '100%',
        border: '2px solid red',
        position: 'relative',
        overflow: 'hidden'
      }} 
    />
  );
}
