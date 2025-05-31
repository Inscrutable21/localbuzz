'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'

// Import Navbar with dynamic loading and no SSR
const Navbar3D = dynamic(() => import("@/components/Navbar3D"), { 
  ssr: false,
  loading: () => <div className="w-full h-16 bg-black fixed top-0 left-0 z-50"></div>
});

export default function NavbarWrapper() {
  return (
    <Suspense fallback={<div className="w-full h-16 bg-black fixed top-0 left-0 z-50"></div>}>
      <Navbar3D />
    </Suspense>
  );
}