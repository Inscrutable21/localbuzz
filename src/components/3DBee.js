'use client'

import React, { useRef, useState, useEffect } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

export default function Bee3D({ size = 300 }) {
  const containerRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  
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
    renderer.outputEncoding = THREE.sRGBEncoding
    
    containerRef.current.appendChild(renderer.domElement)
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
    scene.add(ambientLight)
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2)
    directionalLight.position.set(5, 10, 5)
    scene.add(directionalLight)
    
    // Model loading with retry logic
    const loadModel = () => {
      const loader = new GLTFLoader()
      
      // Use absolute URL to ensure it works in all environments
      const modelUrl = window.location.origin + '/3dmodel/bumblebee.glb';
      
      console.log('Loading model from:', modelUrl);
      
      loader.load(
        modelUrl,
        (gltf) => {
          model = gltf.scene
          
          // Scale and position
          model.scale.set(3.0, 3.0, 3.0)
          model.rotation.y = Math.PI * 0.15
          model.rotation.x = Math.PI * 0.05
          
          // Center properly
          const box = new THREE.Box3().setFromObject(model)
          const center = box.getCenter(new THREE.Vector3())
          model.position.x = -center.x + 1.2
          model.position.y = -center.y - 0.4
          model.position.z = -center.z - 0.8
          
          scene.add(model)
          
          // Handle animations if present
          if (gltf.animations && gltf.animations.length) {
            mixer = new THREE.AnimationMixer(model)
            const action = mixer.clipAction(gltf.animations[0])
            action.play()
          }
          
          setLoading(false)
        },
        (progress) => {
          // Optional: Track loading progress
          console.log('Loading progress:', (progress.loaded / progress.total) * 100, '%');
        },
        (error) => {
          console.error('Error loading model:', error)
          
          // Retry logic (up to 3 times)
          if (retryCount < 3) {
            console.log(`Retrying model load (${retryCount + 1}/3)...`);
            setRetryCount(prev => prev + 1);
            setTimeout(loadModel, 1000); // Wait 1 second before retry
          } else {
            setError(true)
            setLoading(false)
          }
        }
      )
    }
    
    loadModel()
    
    // Animation loop
    const clock = new THREE.Clock()
    
    const animate = () => {
      animationId = requestAnimationFrame(animate)
      
      if (mixer) {
        mixer.update(clock.getDelta())
      }
      
      if (model) {
        model.rotation.y += 0.002 // Slow rotation
      }
      
      renderer.render(scene, camera)
    }
    
    animate()
    
    // Cleanup
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
      
      if (renderer) {
        renderer.dispose()
        if (containerRef.current && containerRef.current.contains(renderer.domElement)) {
          containerRef.current.removeChild(renderer.domElement)
        }
      }
      
      // Clean up Three.js resources
      if (model) {
        scene.remove(model)
        model.traverse((object) => {
          if (object.geometry) object.geometry.dispose()
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose())
            } else {
              object.material.dispose()
            }
          }
        })
      }
    }
  }, [size, retryCount])
  
  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: size, 
        height: size,
        position: 'relative',
        overflow: 'visible !important',
        transformStyle: 'preserve-3d',
        backfaceVisibility: 'visible',
        willChange: 'transform'
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
          Failed to load 3D model. Please check if the file exists at /3dmodel/bumblebee.glb
        </div>
      )}
    </div>
  )
}




























