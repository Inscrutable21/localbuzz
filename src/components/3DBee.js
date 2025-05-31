'use client'

import React, { useRef, useState, useEffect } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

export default function Bee3D({ size = 300, isMobile = false, isBackground = false }) {
  const containerRef = useRef(null)
  const [loading, setLoading] = useState(false) // Start with loading false
  const [error, setError] = useState(false)
  
  useEffect(() => {
    // Skip rendering on mobile devices
    if (isMobile) return;
    
    if (!containerRef.current) return
    
    // Store ref value in a variable to use in cleanup
    const currentContainer = containerRef.current
    
    // For menu background, use a much larger size
    const isMenuBackground = isBackground
    const isFullScreen = isMenuBackground
    const actualSize = isFullScreen ? Math.max(window.innerWidth, window.innerHeight) * 1.5 : size
    
    // Scene setup
    const scene = new THREE.Scene()
    
    // Camera setup - adjusted for background view
    const camera = new THREE.PerspectiveCamera(
      isFullScreen ? 25 : 40, // Wider FOV for full-screen
      1,
      0.1,
      1000
    )
    camera.position.set(isFullScreen ? 10 : 5, isFullScreen ? 2 : 0.5, isFullScreen ? 8 : 4)
    camera.lookAt(0, 0, 0)
    
    // Renderer setup - optimize for performance
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: false,
      powerPreference: 'high-performance'
    })
    
    renderer.setSize(actualSize, actualSize)
    renderer.setClearColor(0x000000, 0)
    // Limit pixel ratio for better performance
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    // Use more efficient shadow map
    renderer.shadowMap.enabled = !isBackground
    renderer.shadowMap.type = THREE.PCFShadowMap
    renderer.outputEncoding = THREE.sRGBEncoding
    
    currentContainer.appendChild(renderer.domElement)
    
    // Simplified lighting setup for better performance
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
    scene.add(ambientLight)
    
    // Use only one directional light with optimized settings
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
    directionalLight.position.set(5, 5, 5)
    directionalLight.castShadow = !isBackground
    
    // Optimize shadow map size
    if (directionalLight.shadow) {
      directionalLight.shadow.mapSize.width = 1024
      directionalLight.shadow.mapSize.height = 1024
      directionalLight.shadow.camera.near = 0.5
      directionalLight.shadow.camera.far = 50
      directionalLight.shadow.bias = -0.001
    }
    
    scene.add(directionalLight)
    
    // Model loading
    let model = null
    let mixer = null
    const loader = new GLTFLoader()
    
    loader.load(
      '/3dmodel/bumblebee.glb',
      (gltf) => {
        model = gltf.scene
        
        // Scale and position the model - bigger for background
        model.scale.set(
          isBackground ? 4 : (isFullScreen ? 3 : 1.5),
          isBackground ? 4 : (isFullScreen ? 3 : 1.5),
          isBackground ? 4 : (isFullScreen ? 3 : 1.5)
        )
        
        // Set initial rotation to match reference image
        model.rotation.y = Math.PI * -0.1 // Adjusted to show more of the left side of face
        model.rotation.x = Math.PI * 0.05 // Slight upward tilt to show face better
        model.rotation.z = Math.PI * 0.05 // Slight tilt
        
        // Center the model
        const box = new THREE.Box3().setFromObject(model)
        const center = box.getCenter(new THREE.Vector3())
        model.position.sub(center)
        
        // Optimize materials
        model.traverse((child) => {
          if (child.isMesh) {
            // Use standard material instead of physical for better performance
            if (child.material) {
              if (child.material.map) {
                child.material.map.anisotropy = 4 // Lower anisotropy
              }
              // Disable unnecessary material features
              child.material.envMapIntensity = 0.5
              child.material.needsUpdate = true
              
              // Optimize shadows
              child.castShadow = !isBackground
              child.receiveShadow = !isBackground
            }
          }
        })
        
        // Setup animations from the GLB file
        if (gltf.animations && gltf.animations.length > 0) {
          console.log(`Found ${gltf.animations.length} animations in the model`)
          mixer = new THREE.AnimationMixer(model)
          
          // Only play essential animations
          const wingAnimation = gltf.animations.find(clip => 
            clip.name.toLowerCase().includes('wing') || 
            clip.name.toLowerCase().includes('fly')
          )
          
          if (wingAnimation) {
            const action = mixer.clipAction(wingAnimation)
            action.play()
          } else if (gltf.animations.length > 0) {
            // Fallback to first animation if no wing animation found
            const action = mixer.clipAction(gltf.animations[0])
            action.play()
          }
        }
        
        scene.add(model)
        setLoading(false)
      },
      undefined,
      (error) => {
        console.error('Error loading model:', error)
        setLoading(false)
        setError(true)
      }
    )
    
    // Animation loop with frame rate limiting
    const clock = new THREE.Clock()
    let animationId
    let lastTime = 0
    const targetFPS = 30 // Limit to 30 FPS for smoother performance
    const interval = 1 / targetFPS
    
    function animate() {
      animationId = requestAnimationFrame(animate)
      
      const currentTime = clock.getElapsedTime()
      const deltaTime = currentTime - lastTime
      
      // Only render if enough time has passed (frame rate limiting)
      if (deltaTime > interval) {
        // Update the animation mixer
        if (mixer) {
          mixer.update(deltaTime)
        }
        
        // Gentle hovering motion only
        if (model) {
          model.position.y = Math.sin(currentTime * 2) * 0.05
        }
        
        // Render the scene
        renderer.render(scene, camera)
        
        lastTime = currentTime - (deltaTime % interval)
      }
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
      
      // Dispose of all resources
      scene.traverse((child) => {
        if (child.geometry) {
          child.geometry.dispose()
        }
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(material => {
              if (material.map) material.map.dispose()
              material.dispose()
            })
          } else {
            if (child.material.map) child.material.map.dispose()
            child.material.dispose()
          }
        }
      })
      
      renderer.dispose()
    }
  }, [size, isMobile, isBackground])
  
  // If mobile, don't render anything
  if (isMobile) return null;
  
  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: size, 
        height: size,
        position: 'relative',
        overflow: 'visible'
      }}
    />
  )
}



















