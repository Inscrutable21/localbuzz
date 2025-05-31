'use client'

import { Suspense, useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

// Import Navbar with dynamic loading and no SSR
const Navbar3D = dynamic(() => import("@/components/Navbar3D"), { 
  ssr: false,
  loading: () => <div className="w-full h-16 bg-black fixed top-0 left-0 z-50"></div>
});

export default function NavbarWrapper() {
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    // Detect mobile devices early
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 
                 /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  return (
    <Suspense fallback={<div className="w-full h-16 bg-black fixed top-0 left-0 z-50"></div>}>
      <Navbar3D initialMobile={isMobile} />
    </Suspense>
  );
}
