import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default function TestPage() {
  const mountRef = useRef(null);

  useEffect(() => {
    console.log('🚀 TestPage mounting...');
    
    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222);

    // Camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Renderer - full screen
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    
    console.log('✅ Canvas added to body');

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    console.log('✅ OrbitControls created');

    // Cube
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshNormalMaterial();
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    
    console.log('✅ Cube added');

    // Mouse events
    renderer.domElement.addEventListener('mousedown', () => {
      console.log('🖱️ MOUSEDOWN!');
    });
    
    renderer.domElement.addEventListener('mousemove', (e) => {
      if (e.buttons > 0) {
        console.log('🖱️ DRAGGING!');
      }
    });

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    console.log('✅ Animation started - Try dragging with mouse!');

    // Cleanup
    return () => {
      console.log('🧹 Cleaning up');
      document.body.removeChild(renderer.domElement);
      controls.dispose();
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: '#111',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px'
    }}>
      <div>Open Console (F12) and try dragging the cube!</div>
    </div>
  );
}
