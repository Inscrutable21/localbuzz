// Add these imports if they don't exist
import { useEffect, useState, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Preload } from '@react-three/drei';
import { Suspense } from 'react';

// Separate Model component for better performance
function Model({ scale, position, rotation, detail }) {
  const { scene, animations } = useGLTF('/3dmodel/bumblebee.glb');
  const modelRef = useRef();
  
  // Optimize materials
  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child.isMesh) {
          // Use standard material instead of physical for better performance
          if (child.material) {
            if (child.material.map) {
              child.material.map.anisotropy = 4; // Lower anisotropy
            }
            // Disable unnecessary material features
            child.material.envMapIntensity = 0.5;
            child.material.needsUpdate = true;
          }
        }
      });
    }
  }, [scene]);
  
  // Simple hover animation
  useFrame(({ clock }) => {
    if (modelRef.current) {
      modelRef.current.position.y = Math.sin(clock.getElapsedTime() * 2) * 0.05;
    }
  });
  
  return (
    <primitive 
      ref={modelRef}
      object={scene} 
      scale={scale} 
      position={position} 
      rotation={rotation}
    />
  );
}

// Preload the model to avoid jank when it first appears
useGLTF.preload('/3dmodel/bumblebee.glb');

export default function Bee3D({ size, isMobile, isBackground }) {
  const { gl } = useThree();
  
  // Optimize renderer
  useEffect(() => {
    // Set renderer parameters for better performance
    gl.setPixelRatio(Math.min(2, window.devicePixelRatio));
    gl.physicallyCorrectLights = false;
    
    // Optimize shadow maps
    gl.shadowMap.enabled = !isBackground;
    gl.shadowMap.type = THREE.PCFShadowMap;
    gl.shadowMap.autoUpdate = false;
    gl.shadowMap.needsUpdate = true;
    
    // One-time shadow map update
    return () => {
      gl.dispose();
    };
  }, [gl, isBackground]);
  
  return (
    <Canvas
      shadows={!isBackground}
      camera={{ position: [0, 0, 10], fov: 25 }}
      gl={{ 
        antialias: true, 
        powerPreference: 'high-performance',
        stencil: false,
        depth: true
      }}
      dpr={[1, 2]}
      performance={{ min: 0.5 }}
      style={{ width: '100%', height: '100%' }}
      frameloop="demand" // Only render when needed
    >
      {/* Simplified lighting */}
      <ambientLight intensity={0.7} />
      <spotLight
        position={[10, 10, 10]}
        angle={0.15}
        penumbra={1}
        intensity={1.5}
        castShadow={!isBackground}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.001}
      />
      
      {/* Your 3D model with optimized settings */}
      <Suspense fallback={null}>
        <Model 
          scale={[1, 1, 1]} 
          position={[0, 0, 0]} 
          rotation={[0, 0, 0]}
          detail="high"
        />
      </Suspense>
      
      <OrbitControls 
        enableZoom={false} 
        enablePan={false}
        autoRotate 
        autoRotateSpeed={1.5}
        enableDamping={false}
      />
      
      <Preload all />
    </Canvas>
  );
}
