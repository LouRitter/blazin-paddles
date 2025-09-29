'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const router = useRouter();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      router.push('/');
    }
  };

  return (
    <header className="bg-black/80 backdrop-blur-sm fixed top-0 left-0 right-0 z-10 border-b border-gray-800">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-black tracking-tighter text-white">
          BLAZING <span className="text-lime-400">PADDLES</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/" className="text-gray-300 hover:text-lime-400 transition-colors duration-300">
            Home
          </Link>
          <Link href="/booking" className="text-gray-300 hover:text-lime-400 transition-colors duration-300">
            Book a Court
          </Link>
          <Link href="/sessions" className="text-gray-300 hover:text-lime-400 transition-colors duration-300">
            My Sessions
          </Link>
        </nav>
        
        {user ? (
          <button
            onClick={handleSignOut}
            className="hidden md:block bg-lime-500 text-black font-bold py-2 px-5 rounded-lg hover:bg-lime-400 transition-all duration-300 transform hover:scale-105"
          >
            Log Out
          </button>
        ) : (
          <Link 
            href="/signup" 
            className="hidden md:block bg-lime-500 text-black font-bold py-2 px-5 rounded-lg hover:bg-lime-400 transition-all duration-300 transform hover:scale-105"
          >
            Sign Up
          </Link>
        )}
        
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-white"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}
            />
          </svg>
        </button>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-sm border-t border-gray-800">
          <nav className="container mx-auto px-6 py-4 flex flex-col space-y-4">
            <Link 
              href="/" 
              className="text-gray-300 hover:text-lime-400 transition-colors duration-300"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              href="/booking" 
              className="text-gray-300 hover:text-lime-400 transition-colors duration-300"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Book a Court
            </Link>
            <Link 
              href="/sessions" 
              className="text-gray-300 hover:text-lime-400 transition-colors duration-300"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              My Sessions
            </Link>
            {user ? (
              <button
                onClick={() => {
                  handleSignOut();
                  setIsMobileMenuOpen(false);
                }}
                className="bg-lime-500 text-black font-bold py-2 px-5 rounded-lg hover:bg-lime-400 transition-all duration-300 text-center"
              >
                Log Out
              </button>
            ) : (
              <Link 
                href="/signup" 
                className="bg-lime-500 text-black font-bold py-2 px-5 rounded-lg hover:bg-lime-400 transition-all duration-300 text-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign Up
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
