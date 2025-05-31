// Add these imports if they don't exist
import { useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';

export default function Bee3D({ size, isMobile, isBackground }) {
  const { gl } = useThree();
  
  // Optimize for mobile
  useEffect(() => {
    if (isMobile) {
      // Lower pixel ratio for mobile devices
      gl.setPixelRatio(Math.min(1.5, window.devicePixelRatio));
      
      // Reduce shadow map size for mobile
      gl.shadowMap.mapSize.width = 1024;
      gl.shadowMap.mapSize.height = 1024;
      
      // If it's a background, use even lower settings
      if (isBackground) {
        gl.setPixelRatio(1);
        gl.shadowMap.enabled = false; // Disable shadows for background
      }
    }
  }, [gl, isMobile, isBackground]);
  
  // Rest of your component...
  
  return (
    <Canvas
      shadows
      camera={{ position: [0, 0, 10], fov: 25 }}
      gl={{ antialias: !isMobile, powerPreference: 'high-performance' }}
      dpr={isMobile ? [1, 1.5] : [1, 2]} // Lower DPR for mobile
      performance={{ min: 0.5 }} // Allow performance scaling
      style={{ width: '100%', height: '100%' }}
    >
      {/* Reduce light complexity for mobile */}
      <ambientLight intensity={isMobile ? 0.5 : 0.7} />
      <spotLight
        position={[10, 10, 10]}
        angle={0.15}
        penumbra={1}
        intensity={isMobile ? 1 : 2}
        castShadow={!isMobile || !isBackground}
      />
      <pointLight position={[-10, -10, -10]} intensity={isMobile ? 0.5 : 1} />
      
      {/* Conditionally render effects based on device */}
      {!isMobile && (
        <EffectsComposer>
          <Bloom luminanceThreshold={0.8} intensity={0.8} />
        </EffectsComposer>
      )}
      
      {/* Your 3D model with optimized settings */}
      <Suspense fallback={null}>
        <Model 
          scale={isMobile ? [0.8, 0.8, 0.8] : [1, 1, 1]} 
          position={[0, 0, 0]} 
          rotation={[0, 0, 0]}
          // Reduce polygon count for mobile
          detail={isMobile ? "low" : "high"}
        />
      </Suspense>
      
      <OrbitControls 
        enableZoom={false} 
        enablePan={false}
        autoRotate 
        autoRotateSpeed={isMobile ? 1 : 2}
      />
    </Canvas>
  );
}