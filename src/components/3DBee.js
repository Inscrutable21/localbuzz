'use client'

import React, { useRef, useState, useEffect } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

export default function Bee3D({ size = 300 }) {
  const containerRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  
  useEffect(() => {
    if (!containerRef.current) return
    
    let model;
    let mixer;
    let renderer;
    let animationId;
    
    // Scene setup
    const scene = new THREE.Scene()
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(25, 1, 0.1, 2000)
    camera.position.set(18, 2, -2)
    camera.lookAt(0, 0, 0)
    
    // Renderer setup
    renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true
    })

    renderer.setSize(size, size)
    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    // Fix deprecated property
    renderer.outputColorSpace = THREE.SRGBColorSpace
    
    containerRef.current.appendChild(renderer.domElement)
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
    scene.add(ambientLight)
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2)
    directionalLight.position.set(5, 10, 5)
    scene.add(directionalLight)
    
    // Try multiple paths to find the model
    const possiblePaths = [
      '/3dmodel/bumblebee.glb',
      './3dmodel/bumblebee.glb',
      '../3dmodel/bumblebee.glb',
      '/public/3dmodel/bumblebee.glb',
      '/_next/static/media/bumblebee.glb'
    ];

    // Add the current domain path as well
    if (typeof window !== 'undefined') {
      const baseUrl = window.location.origin;
      possiblePaths.unshift(`${baseUrl}/3dmodel/bumblebee.glb`);
    }

    let loadAttempt = 0;

    const tryNextPath = () => {
      if (loadAttempt >= possiblePaths.length) {
        console.error('Failed to load model from all possible paths');
        // As a last resort, try to load a direct URL to the model
        const directUrl = 'https://localbuzz.vercel.app/3dmodel/bumblebee.glb';
        console.log(`Attempting to load model from direct URL: ${directUrl}`);
        
        const loader = new GLTFLoader();
        loader.load(
          directUrl,
          handleSuccessfulLoad,
          handleProgress,
          () => {
            console.error('Failed to load model from direct URL');
            setError(true);
            setLoading(false);
          }
        );
        return;
      }
      
      const currentPath = possiblePaths[loadAttempt];
      console.log(`Attempting to load model from: ${currentPath}`);
      
      const loader = new GLTFLoader();
      
      loader.load(
        currentPath,
        handleSuccessfulLoad,
        handleProgress,
        handleError
      );
    };

    const handleSuccessfulLoad = (gltf) => {
      console.log('Model loaded successfully!');
      model = gltf.scene;
      
      // Scale and position
      model.scale.set(3.0, 3.0, 3.0);
      model.rotation.y = Math.PI * 0.15;
      model.rotation.x = Math.PI * 0.05;
      
      // Center properly
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.x = -center.x + 1.2;
      model.position.y = -center.y - 0.4;
      model.position.z = -center.z - 0.8;
      
      scene.add(model);
      
      // Handle animations if present
      if (gltf.animations && gltf.animations.length) {
        mixer = new THREE.AnimationMixer(model);
        const action = mixer.clipAction(gltf.animations[0]);
        action.play();
      }
      
      setLoading(false);
    };

    const handleProgress = (progress) => {
      // Track loading progress
      if (progress.total > 0) {
        const percent = (progress.loaded / progress.total) * 100;
        console.log(`Loading progress (${possiblePaths[loadAttempt]}):`, percent.toFixed(2), '%');
      }
    };

    const handleError = (error) => {
      console.warn(`Failed to load from ${possiblePaths[loadAttempt]}:`, error);
      loadAttempt++;
      tryNextPath();
    };

    // Start trying paths
    tryNextPath();
    
    // Animation loop
    const clock = new THREE.Clock();
    
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      if (mixer) {
        mixer.update(clock.getDelta());
      }
      
      if (model) {
        model.rotation.y += 0.002; // Slow rotation
      }
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Cleanup
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      
      if (renderer) {
        renderer.dispose();
        if (containerRef.current && containerRef.current.contains(renderer.domElement)) {
          containerRef.current.removeChild(renderer.domElement);
        }
      }
    };
  }, [size]);
  
  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: size, 
        height: size,
        position: 'relative',
        overflow: 'visible !important'
      }}
      className="model-container"
    >
      {loading && (
        <div style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#c0ff00',
          fontSize: '16px',
          fontWeight: 'bold'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c0ff00] mb-4 mx-auto"></div>
            Loading 3D Model...
          </div>
        </div>
      )}
      
      {error && (
        <div style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ff0000',
          fontSize: '14px',
          padding: '20px',
          textAlign: 'center'
        }}>
          Failed to load 3D model. Please check console for details.
        </div>
      )}
    </div>
  );
}



