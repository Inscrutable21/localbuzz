'use client'

import React, { useRef, useState, useEffect } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

export default function Bee3D({ size = 300 }) {
  const containerRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  
  useEffect(() => {
    // Debug info
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Window location:', typeof window !== 'undefined' ? window.location.href : 'SSR');
    console.log('Base URL:', typeof window !== 'undefined' ? window.location.origin : 'SSR');
    
    // Check if the file exists by trying to fetch it
    if (typeof window !== 'undefined') {
      const checkFile = async (url) => {
        try {
          const response = await fetch(url, { method: 'HEAD' });
          console.log(`File check ${url}: ${response.status === 200 ? 'EXISTS' : 'NOT FOUND'}`);
        } catch (err) {
          console.error(`File check error for ${url}:`, err);
        }
      };
      
      checkFile(`${window.location.origin}/3dmodel/bumblebee.glb`);
      checkFile('/3dmodel/bumblebee.glb');
    }
  }, []);
  
  useEffect(() => {
    if (!containerRef.current) return
    
    // Capture the container reference to use in cleanup
    const container = containerRef.current;
    
    let model;
    let mixer;
    let renderer;
    let animationId;
    
    // Scene setup
    const scene = new THREE.Scene()
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.set(0, 0, 5);

    // Adjust scene position
    scene.position.y = 0; // Reset any vertical offset
    
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
    
    container.appendChild(renderer.domElement)
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
    scene.add(ambientLight)
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2)
    directionalLight.position.set(5, 10, 5)
    scene.add(directionalLight)
    
    // Try multiple paths to find the model
    const possiblePaths = [
      '/3dmodel/bumblebee.glb',
      '/3dmodel/bumblebee.optimized.glb', // Try optimized version too
    ];

    if (typeof window !== 'undefined') {
      const baseUrl = window.location.origin;
      possiblePaths.forEach(path => {
        // Add absolute URLs to the beginning of the array
        possiblePaths.unshift(`${baseUrl}${path}`);
      });
    }

    let loadAttempt = 0;

    const tryNextPath = () => {
      if (loadAttempt >= possiblePaths.length) {
        console.error('Failed to load model from all possible paths');
        // Try these direct URLs as a last resort
        const directUrls = [
          `${window.location.origin}/3dmodel/bumblebee.glb`,
          'https://localbuzz.vercel.app/3dmodel/bumblebee.glb',
          '/3dmodel/bumblebee.glb'
        ];
        
        console.log('Attempting emergency fallback URLs:', directUrls);
        
        // Try each URL in sequence
        const tryDirectUrl = (index) => {
          if (index >= directUrls.length) {
            setError(true);
            setLoading(false);
            return;
          }
          
          const loader = new GLTFLoader();
          loader.load(
            directUrls[index],
            handleSuccessfulLoad,
            handleProgress,
            () => {
              console.error(`Failed to load from ${directUrls[index]}`);
              tryDirectUrl(index + 1);
            }
          );
        };
        
        tryDirectUrl(0);
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
      
      // Scale and position - adjusted for production
      model.scale.set(1.5, 1.5, 1.5);
      // Set rotation for right side view
      model.rotation.y = Math.PI * 1.65; // 90 degrees to show right side
      model.rotation.x = Math.PI * 0.2; // Keep level
      
      // Center properly
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      
      // Adjust position to be more centered
      model.position.x = -center.x;
      model.position.y = -center.y - 0.5; // Move down slightly
      model.position.z = -center.z;
      
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
      // Log more details about the error
      console.error('Error details:', {
        path: possiblePaths[loadAttempt],
        errorMessage: error.message,
        errorType: error.type,
        errorStack: error.stack
      });
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
      
      // Removed rotation - model stays in fixed right side view position
      
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
        if (container && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
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


