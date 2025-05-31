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
    
    // Scene setup
    const scene = new THREE.Scene()
    
    // Camera setup - adjust to match the image exactly
    const camera = new THREE.PerspectiveCamera(25, 1, 0.1, 2000) // Narrower FOV for less distortion
    camera.position.set(18, 2, -2) // Position camera to match the reference image
    camera.lookAt(0, 0, 0)
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
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
    renderer.localClippingEnabled = false // Disable local clipping
    
    containerRef.current.appendChild(renderer.domElement)
    
    // Lighting setup - match Sketchfab lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
    scene.add(ambientLight)
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
    directionalLight.position.set(5, 5, 5)
    directionalLight.castShadow = true
    scene.add(directionalLight)
    
    const directionalLight2 = new THREE.DirectionalLight(0xffd700, 0.4)
    directionalLight2.position.set(-5, 3, -5)
    scene.add(directionalLight2)
    
    // Model loading
    let model = null
    let mixer = null
    const loader = new GLTFLoader()
    
    loader.load(
      '/3dmodel/bumblebee.glb',
      (gltf) => {
        model = gltf.scene
        
        // Scale and position the model - make it smaller
        model.scale.set(3.0, 3.0, 3.0) // Reduced from 3.6 to make bee smaller
        
        // Set rotation to match the reference image
        model.rotation.y = Math.PI * 0.15
        model.rotation.x = Math.PI * 0.05
        
        // Center the model properly with adjusted positioning
        const box = new THREE.Box3().setFromObject(model)
        const center = box.getCenter(new THREE.Vector3())
        model.position.x = -center.x + 1.2 // Adjusted for smaller size
        model.position.y = -center.y - 0.4 // Adjusted for smaller size
        model.position.z = -center.z - 0.8 // Adjusted for smaller size
        
        // Setup materials
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true
            child.receiveShadow = true
          }
        })
        
        // IMPORTANT: Setup animations from the GLB file
        if (gltf.animations && gltf.animations.length > 0) {
          console.log(`Found ${gltf.animations.length} animations in the model`)
          mixer = new THREE.AnimationMixer(model)
          
          // Play all animations
          gltf.animations.forEach((clip, index) => {
            console.log(`Playing animation ${index}: ${clip.name}`)
            const action = mixer.clipAction(clip)
            action.play()
          })
        } else {
          console.warn('No animations found in the GLB file!')
        }
        
        scene.add(model)
        setLoading(false)
      },
      (progress) => {
        const percentComplete = (progress.loaded / progress.total * 100).toFixed(0)
        console.log(`Loading: ${percentComplete}%`)
      },
      (error) => {
        console.error('Error loading model:', error)
        setLoading(false)
        setError(true)
      }
    )
    
    // Animation loop
    const clock = new THREE.Clock()
    let animationId
    
    function animate() {
      animationId = requestAnimationFrame(animate)
      const deltaTime = clock.getDelta()
      const elapsedTime = clock.getElapsedTime()
      
      // Update the animation mixer - this plays the wing animations
      if (mixer) {
        mixer.update(deltaTime)
      }
      
      // Only add hovering motion, NO ROTATION
      if (model) {
        // Gentle hovering motion only
        model.position.y = Math.sin(elapsedTime * 2) * 0.05
        
        // DO NOT ADD ANY ROTATION HERE
        // model.rotation.y = ... // REMOVED
      }
      
      // Render the scene
      renderer.render(scene, camera)
    }
    
    animate()
    
    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return
      
      camera.aspect = 1
      camera.updateProjectionMatrix()
      renderer.setSize(size, size)
    }
    
    window.addEventListener('resize', handleResize)
    
    // Cleanup
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
      
      if (containerRef.current && containerRef.current.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement)
      }
      
      window.removeEventListener('resize', handleResize)
      
      if (mixer) {
        mixer.stopAllAction()
      }
      
      scene.traverse((child) => {
        if (child.geometry) {
          child.geometry.dispose()
        }
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(material => material.dispose())
          } else {
            child.material.dispose()
          }
        }
      })
      
      renderer.dispose()
    }
  }, [size])
  
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


























