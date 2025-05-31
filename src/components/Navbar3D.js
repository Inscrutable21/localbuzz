
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
      // Only show model on desktop
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
      return <Bee3D size={700} />; // Adjusted for smaller bee
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
          <div className="w-full md:w-[35%] p-6 md:p-12 flex flex-col relative overflow-y-auto custom-scrollbar z-45">
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
                transform: 'translate(-17%, -40%)', 
                width: '3000px',
                height: '2500px',
                zIndex: 45,
                overflow: 'visible !important',
                transformStyle: 'preserve-3d',
                pointerEvents: 'none'
              }}
              className="hidden md:block model-container"
            >
              {render3DModel()}
            </div>
          </div>
          
          {/* Bottom banner with social icons and marquee */}
          <div className="fixed bottom-0 left-0 right-0 bg-[#7000ff] overflow-hidden z-47" style={{ borderRadius: "30px 30px 0 0" }}>
            {/* Social icons inside the banner */}
            <div className="flex justify-center items-center py-3 md:hidden">
              <div className="flex space-x-8">
                {/* Instagram */}
                <a href="#" className="text-black hover:text-white">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
                    <path d="M12 6.865c-3.396 0-6.135 2.739-6.135 6.135s2.739 6.135 6.135 6.135 6.135-2.739 6.135-6.135-2.739-6.135-6.135-6.135zm0 10.125c-2.205 0-3.99-1.785-3.99-3.99s1.785-3.99 3.99-3.99 3.99 1.785 3.99 3.99-1.785 3.99-3.99 3.99z"/>
                    <circle cx="18.406" cy="5.594" r="1.44"/>
                  </svg>
                </a>
                {/* X (Twitter) */}
                <a href="#" className="text-black hover:text-white">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                {/* Facebook */}
                <a href="#" className="text-black hover:text-white">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            {/* Marquee text */}
            <div className="marquee-wrapper py-4 md:py-6 lg:py-8">
              <div className="marquee-content">
                <span className="mx-4 md:mx-6 text-black text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-wider">LET'S START A COLLAB</span>
                <span className="mx-4 md:mx-6 text-black text-2xl md:text-3xl lg:text-4xl">★</span>
                <span className="mx-4 md:mx-6 text-black text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-wider">LET'S START A COLLAB</span>
                <span className="mx-4 md:mx-6 text-black text-2xl md:text-3xl lg:text-4xl">★</span>
                <span className="mx-4 md:mx-6 text-black text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-wider">LET'S START A COLLAB</span>
                <span className="mx-4 md:mx-6 text-black text-2xl md:text-3xl lg:text-4xl">★</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}








