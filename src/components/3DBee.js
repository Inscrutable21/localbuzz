'use client'

import React, { useRef, useState, useEffect } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

export default function Bee3D({ size = 300, flyingPattern = 'hover' }) {
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
    let center = new THREE.Vector3(); // Store the center position
    let trailParticles = []; // Store trail particles
    
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
      center = box.getCenter(new THREE.Vector3());
      
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
    let time = 0;
    
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      const delta = clock.getDelta();
      time += delta;
      
      if (mixer) {
        mixer.update(delta);
      }
      
      // Flying animations for the bee
      if (model) {
        if (flyingPattern === 'figure8') {
          // Figure-8 flying pattern
          const radius = 1.5;
          const speed = 0.8;
          model.position.x = -center.x + Math.sin(time * speed) * radius;
          model.position.y = -center.y - 0.5 + Math.sin(time * speed * 2) * 0.5;
          model.position.z = -center.z + Math.cos(time * speed) * radius * 0.5;
          
          // Rotate to face movement direction
          model.rotation.y = Math.PI * 1.65 + Math.atan2(Math.cos(time * speed), Math.sin(time * speed));
          model.rotation.x = Math.PI * 0.2 + Math.sin(time * speed * 2) * 0.2;
          model.rotation.z = Math.sin(time * speed) * 0.3;
        } else if (flyingPattern === 'circle') {
          // Circular flying pattern
          const radius = 1.2;
          const speed = 1.2;
          model.position.x = -center.x + Math.sin(time * speed) * radius;
          model.position.y = -center.y - 0.5 + Math.sin(time * speed * 3) * 0.3;
          model.position.z = -center.z + Math.cos(time * speed) * radius;
          
          // Face the direction of movement
          model.rotation.y = Math.PI * 1.65 + time * speed;
          model.rotation.x = Math.PI * 0.2 + Math.sin(time * speed * 2) * 0.15;
          model.rotation.z = Math.sin(time * speed) * 0.2;
        } else {
          // Default hovering pattern
          // Gentle hovering motion (up and down)
          const hoverAmplitude = 0.3;
          const hoverSpeed = 2;
          model.position.y = -center.y - 0.5 + Math.sin(time * hoverSpeed) * hoverAmplitude;
          
          // Gentle swaying motion (left and right)
          const swayAmplitude = 0.2;
          const swaySpeed = 1.5;
          model.position.x = -center.x + Math.sin(time * swaySpeed) * swayAmplitude;
          
          // Subtle forward and backward motion
          const depthAmplitude = 0.15;
          const depthSpeed = 1.8;
          model.position.z = -center.z + Math.sin(time * depthSpeed) * depthAmplitude;
          
          // Gentle rotation variations to simulate natural flight
          const rotationAmplitude = 0.1;
          const rotationSpeed = 2.2;
          model.rotation.y = Math.PI * 1.65 + Math.sin(time * rotationSpeed) * rotationAmplitude;
          model.rotation.x = Math.PI * 0.2 + Math.sin(time * rotationSpeed * 0.7) * (rotationAmplitude * 0.5);
          model.rotation.z = Math.sin(time * rotationSpeed * 1.3) * (rotationAmplitude * 0.3);
        }
        
        // Wing flapping effect (if the model has wing parts)
        // This will work if the model has separate wing objects
        model.traverse((child) => {
          if (child.isMesh && child.name && child.name.toLowerCase().includes('wing')) {
            const wingFlapSpeed = 15; // Fast wing flapping
            const wingFlapAmplitude = 0.3;
            child.rotation.z = Math.sin(time * wingFlapSpeed) * wingFlapAmplitude;
          }
        });
        
        // Add subtle scale pulsing to simulate breathing/life
        const breatheAmplitude = 0.02;
        const breatheSpeed = 3;
        const breatheScale = 1 + Math.sin(time * breatheSpeed) * breatheAmplitude;
        model.scale.set(1.5 * breatheScale, 1.5 * breatheScale, 1.5 * breatheScale);
        
        // Create trail effect
        if (Math.random() < 0.3) { // 30% chance each frame
          const trailGeometry = new THREE.SphereGeometry(0.02, 8, 8);
          const trailMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffff00, 
            transparent: true, 
            opacity: 0.6 
          });
          const trailParticle = new THREE.Mesh(trailGeometry, trailMaterial);
          
          // Position at bee's current location with slight offset
          trailParticle.position.copy(model.position);
          trailParticle.position.x += (Math.random() - 0.5) * 0.1;
          trailParticle.position.y += (Math.random() - 0.5) * 0.1;
          trailParticle.position.z += (Math.random() - 0.5) * 0.1;
          
          trailParticle.userData = { 
            life: 1.0, 
            decay: 0.02 + Math.random() * 0.02 
          };
          
          scene.add(trailParticle);
          trailParticles.push(trailParticle);
        }
        
        // Update and remove trail particles
        for (let i = trailParticles.length - 1; i >= 0; i--) {
          const particle = trailParticles[i];
          particle.userData.life -= particle.userData.decay;
          particle.material.opacity = particle.userData.life * 0.6;
          particle.scale.setScalar(particle.userData.life);
          
          if (particle.userData.life <= 0) {
            scene.remove(particle);
            particle.geometry.dispose();
            particle.material.dispose();
            trailParticles.splice(i, 1);
          }
        }
      }
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Cleanup
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      
      // Clean up trail particles
      trailParticles.forEach(particle => {
        scene.remove(particle);
        particle.geometry.dispose();
        particle.material.dispose();
      });
      trailParticles = [];
      
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
      {/* Loading indicator removed as per request */}
      
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


