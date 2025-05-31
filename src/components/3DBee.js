'use client'

import React, { useRef, useState, useEffect } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

export default function Bee3D({ size = 300, isMobile = false }) {
  const containerRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  
  useEffect(() => {
    if (!containerRef.current) return
    
    // Store ref value in a variable to use in cleanup
    const currentContainer = containerRef.current
    
    // For mobile menu background, use a much larger size
    const isMenuBackground = isMobile && size > 1000
    const isFullScreen = isMenuBackground // Rename for clarity
    const actualSize = isFullScreen ? window.innerWidth : size
    
    console.log('3DBee mounted:', { size, isMobile, isMenuBackground, isFullScreen, actualSize })
    
    // Scene setup
    const scene = new THREE.Scene()
    
    // Camera setup - adjusted for full-screen view
    const camera = new THREE.PerspectiveCamera(
      isFullScreen ? 30 : 40, // Wider FOV for full-screen
      1,
      0.1,
      1000
    )
    camera.position.set(isFullScreen ? 8 : 5, isFullScreen ? 1 : 0.5, isFullScreen ? 6 : 4)
    camera.lookAt(0, 0, 0)
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: !isMobile,
      alpha: true,
      preserveDrawingBuffer: false,
      powerPreference: 'low-power'
    })
    
    renderer.setSize(actualSize, actualSize)
    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = !isMobile
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.outputEncoding = THREE.sRGBEncoding
    
    currentContainer.appendChild(renderer.domElement)
    
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
        
        // Scale and position the model - bigger for full-screen
        model.scale.set(
          isFullScreen ? 3 : 1.5,
          isFullScreen ? 3 : 1.5,
          isFullScreen ? 3 : 1.5
        )
        
        // Set initial rotation to match reference image
        model.rotation.y = Math.PI * -0.1 // Adjusted to show more of the left side of face
        model.rotation.x = Math.PI * 0.05 // Slight upward tilt to show face better
        model.rotation.z = Math.PI * 0.05 // Slight tilt
        
        // Center the model
        const box = new THREE.Box3().setFromObject(model)
        const center = box.getCenter(new THREE.Vector3())
        model.position.sub(center)
        
        // Setup materials
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true
            child.receiveShadow = true
          }
        })
        
        // Setup animations from the GLB file
        if (gltf.animations && gltf.animations.length > 0) {
          console.log(`Found ${gltf.animations.length} animations in the model`)
          mixer = new THREE.AnimationMixer(model)
          
          // Play all animations
          gltf.animations.forEach((clip, index) => {
            console.log(`Playing animation ${index}: ${clip.name}`)
            const action = mixer.clipAction(clip)
            action.play()
          })
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
      }
      
      // Render the scene
      renderer.render(scene, camera)
    }
    
    animate()
    
    // Cleanup
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
      
      if (currentContainer && currentContainer.contains(renderer.domElement)) {
        currentContainer.removeChild(renderer.domElement)
      }
      
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
  }, [size, isMobile])
  
  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: size, 
        height: size,
        position: 'relative',
        overflow: 'visible'
      }}
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














