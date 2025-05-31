'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

// Only import the 3D navbar
const Navbar3D = dynamic(() => import("@/components/Navbar3D"), { 
  ssr: false,
  loading: () => <div className="w-full h-16 bg-black fixed top-0 left-0 z-50"></div>
});

export default function NavbarWrapper() {
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    // Check device capabilities
    const checkDevice = () => {
      // Check if mobile
      const mobile = window.innerWidth < 768 || 
                    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      setIsMobile(mobile);
    }
    
    checkDevice();
    setMounted(true);
  }, []);
  
  // Only render when mounted
  if (!mounted) return <div className="w-full h-16 bg-black fixed top-0 left-0 z-50"></div>;
  
  // Use the 3D navbar directly
  return <Navbar3D initialMobile={isMobile} />;
}

