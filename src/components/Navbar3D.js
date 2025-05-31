
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import SocialButtons from './SocialButtons'

// Import the 3D bee component with dynamic loading and lazy loading
// Use a more robust dynamic import with error handling
const Bee3D = dynamic(() => 
  import('./3DBee')
    .then(mod => mod.default)
    .catch(err => {
      console.error("Failed to load 3DBee:", err);
      return () => null; // Return empty component on error
    }), 
  { 
    ssr: false,
    loading: () => null
  }
);

export default function Navbar3D({ initialMobile = false }) {
  const [mounted, setMounted] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showModel, setShowModel] = useState(false)
  const [isMobile, setIsMobile] = useState(initialMobile)

  useEffect(() => {
    setMounted(true)
    
    // Cleanup function for the entire component
    return () => {
      setMounted(false)
      setMenuOpen(false)
      setShowModel(false)
    }
  }, [])

  useEffect(() => {
    // Prevent scrolling when menu is open
    if (menuOpen) {
      document.body.classList.add('menu-open')
      // Delay showing the 3D model to ensure DOM is ready
      const timer = setTimeout(() => {
        setShowModel(!isMobile) // Only show model if not mobile
      }, 300)
      
      return () => {
        clearTimeout(timer)
        setShowModel(false)
      }
    } else {
      document.body.classList.remove('menu-open')
      setShowModel(false)
    }

    // Cleanup function
    return () => {
      document.body.classList.remove('menu-open')
    }
  }, [menuOpen, isMobile])

  useEffect(() => {
    // Simple mobile detection
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Handle menu toggle with proper cleanup
  const toggleMenu = () => {
    if (menuOpen) {
      // First hide the model, then close the menu
      setShowModel(false)
      setTimeout(() => {
        setMenuOpen(false)
      }, 100)
    } else {
      setMenuOpen(true)
    }
  }

  // Render 3D model with error boundary
  const render3DModel = () => {
    if (!mounted || !showModel) return null;
    
    try {
      return <Bee3D size={isMobile ? 400 : 700} />; // Adjust size based on device
    } catch (error) {
      console.error("Error rendering 3D model:", error);
      return null;
    }
  };

  return (
    <div className="w-full h-16 bg-black text-white fixed top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-6">
        {/* Logo */}
        <div 
          className="font-bold text-2xl tracking-wider"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(-10px)',
            transition: 'all 0.5s ease',
          }}
        >
          <Link href="/">
            CREAM
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Contact Button */}
          <div
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(-10px)',
              transition: 'all 0.5s ease 0.2s',
            }}
          >
            <Link 
              href="/contact"
              className="bg-[#c0ff00] text-black px-5 py-2 rounded-full flex items-center font-medium text-sm transition-transform hover:scale-105"
            >
              CONTACT US
              <svg 
                className="ml-2 w-4 h-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 5l7 7-7 7" 
                />
              </svg>
            </Link>
          </div>
          
          {/* Hamburger Menu Button */}
          <button 
            className="w-10 h-10 flex items-center justify-center rounded-full border border-white/20 transition-colors hover:bg-white/10"
            onClick={toggleMenu}
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(-10px)',
              transition: 'all 0.5s ease 0.3s',
            }}
          >
            <div className="w-5 h-5 flex flex-col justify-center space-y-1.5 relative">
              <span 
                className={`hamburger-line block h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'absolute rotate-45 top-1/2 -translate-y-1/2' : ''}`}
                style={{ width: '100%' }}
              ></span>
              <span 
                className={`hamburger-line block h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'opacity-0' : 'opacity-100'}`}
                style={{ width: '100%' }}
              ></span>
              <span 
                className={`hamburger-line block h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'absolute -rotate-45 top-1/2 -translate-y-1/2' : ''}`}
                style={{ width: '100%' }}
              ></span>
            </div>
          </button>
        </div>
      </div>
      
      {/* Mobile Menu (fullscreen) */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black z-40 flex flex-col md:flex-row overflow-hidden">
          {/* Left side menu content */}
          <div className="w-full md:w-[35%] p-4 md:p-12 flex flex-col relative overflow-y-auto overflow-x-hidden custom-scrollbar z-45">
            {/* Close button - positioned on extreme left edge */}
            <div className="absolute top-4 md:top-6 left-4 md:left-6 z-50">
              <button 
                onClick={toggleMenu}
                className="text-white/70 hover:text-white"
                style={{ zIndex: 100 }}
              >
                <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <nav className="flex flex-col space-y-4 md:space-y-8 uppercase mt-8 md:mt-12 relative z-46">
              {/* Menu items with enhanced visibility */}
              <Link 
                href="/" 
                className="wide-menu-font hover:text-[#c0ff00] transition-colors text-[20px] sm:text-[24px] md:text-[27px] menu-item"
                style={{ transform: 'scaleX(1.5)', transformOrigin: 'left' }}
                onClick={toggleMenu}
              >
                HOME
              </Link>
              <Link 
                href="/about" 
                className="wide-menu-font hover:text-[#c0ff00] transition-colors text-[20px] sm:text-[24px] md:text-[27px] menu-item"
                style={{ transform: 'scaleX(1.5)', transformOrigin: 'left' }}
                onClick={toggleMenu}
              >
                ABOUT US
              </Link>
              <Link 
                href="/portfolio" 
                className="wide-menu-font hover:text-[#c0ff00] transition-colors text-[20px] sm:text-[24px] md:text-[27px] menu-item"
                style={{ transform: 'scaleX(1.5)', transformOrigin: 'left' }}
                onClick={toggleMenu}
              >
                PORTFOLIO
              </Link>
              <Link 
                href="/brand-quiz" 
                className="wide-menu-font hover:text-[#c0ff00] transition-colors text-[20px] sm:text-[24px] md:text-[27px] menu-item"
                style={{ transform: 'scaleX(1.5)', transformOrigin: 'left' }}
                onClick={toggleMenu}
              >
                BRAND QUIZ
              </Link>
              <Link 
                href="/blog" 
                className="wide-menu-font hover:text-[#c0ff00] transition-colors text-[20px] sm:text-[24px] md:text-[27px] menu-item"
                style={{ transform: 'scaleX(1.5)', transformOrigin: 'left' }}
                onClick={toggleMenu}
              >
                BLOG
              </Link>
              
              <div className="border-t border-white/20 pt-4 md:pt-8"></div>
              
              <div className="flex items-center justify-between group">
                <Link 
                  href="/services" 
                  className="wide-menu-font hover:text-[#c0ff00] transition-colors text-[20px] sm:text-[24px] md:text-[27px] menu-item"
                  style={{ transform: 'scaleX(1.5)', transformOrigin: 'left' }}
                  onClick={toggleMenu}
                >
                  SERVICES
                </Link>
                <svg className="w-6 h-6 md:w-10 md:h-10 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              
              <div className="flex items-center justify-between group">
                <Link 
                  href="/industries" 
                  className="wide-menu-font hover:text-[#c0ff00] transition-colors text-[18px] sm:text-[20px] md:text-[24px] menu-item"
                  style={{ transform: 'scaleX(1.5)', transformOrigin: 'left' }}
                  onClick={toggleMenu}
                >
                  INDUSTRIES
                </Link>
                <svg className="w-6 h-6 md:w-10 md:h-10 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              
              {/* Contact information at bottom */}
              <div className="mt-auto pt-8 md:pt-16 relative z-46">
                <div className="flex items-center mb-2 md:mb-4">
                  <span className="mr-2">🇮🇳</span>
                  <span className="text-white/80 text-xs md:text-sm">MADE IN INDIA</span>
                </div>
                <a 
                  href="mailto:localbuzzagency@gmail.com" 
                  className="text-white/80 text-xs md:text-sm hover:text-white transition-colors flex items-center uppercase mb-6"
                >
                  <svg className="w-3 h-3 md:w-4 md:h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  LOCALBUZZAGENCY@GMAIL.COM
                </a>
                
                {/* Removed duplicate social icons from here */}
              </div>
            </nav>
          </div>
          
          {/* Right side content - hidden on mobile, 65% on larger screens */}
          <div className="hidden md:block md:w-[65%] relative">
            {/* Use SocialButtons component - ONLY ON DESKTOP */}
            {mounted && <SocialButtons isMobile={false} />}
            
            {/* 3D Bee Model - desktop position */}
            <div 
              style={{ 
                position: 'absolute',
                left: '50%', 
                top: '50%',
                transform: 'translate(-45%, -50%)', // Center properly
                width: '100%',
                height: '100%',
                zIndex: 45,
                overflow: 'visible',
                transformStyle: 'preserve-3d',
                pointerEvents: 'none'
              }}
              className="hidden md:block model-container"
            >
              {render3DModel()}
            </div>
          </div>
          
          {/* Social icons bar - mobile only */}
          <div className="fixed bottom-[80px] left-0 right-0 flex justify-center items-center py-3 z-47 md:hidden">
            {/* Use the SocialButtons component instead of reimplementing */}
            {mounted && <SocialButtons isMobile={true} />}
          </div>
          
          {/* Bottom banner with marquee text */}
          <div className="fixed bottom-0 left-0 right-0 bg-[#7000ff] overflow-hidden z-47" style={{ height: "80px", borderRadius: "30px 30px 0 0" }}>
            <div className="marquee-wrapper py-3 md:py-4 lg:py-5">
              <div className="marquee-content">
                <span className="mx-4 md:mx-6 text-black text-xl md:text-2xl lg:text-3xl font-extrabold tracking-wider">LET'S START A COLLAB</span>
                <span className="mx-4 md:mx-6 text-black text-xl md:text-2xl lg:text-3xl">★</span>
                <span className="mx-4 md:mx-6 text-black text-xl md:text-2xl lg:text-3xl font-extrabold tracking-wider">LET'S START A COLLAB</span>
                <span className="mx-4 md:mx-6 text-black text-xl md:text-2xl lg:text-3xl">★</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}














