"use client";
import React, { useState } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full z-50 bg-[#FBF8F6]/80 backdrop-blur-md border-b border-[#F2E8E0] flex justify-between items-center px-6 py-4 md:px-12 md:py-6">
      <div className="text-xl md:text-2xl font-light tracking-[0.2em] text-primary-container uppercase">
        kala.surf
      </div>
      
      {/* Mobile Menu Toggle */}
      <button 
        className="md:hidden text-primary"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <span className="material-symbols-outlined">
          {isMenuOpen ? 'close' : 'menu'}
        </span>
      </button>

      {/* Desktop Nav */}
      <nav className="hidden md:flex gap-12 items-center">
        <a className="font-noto-serif uppercase tracking-widest text-sm text-slate-500 hover:text-primary-container transition-colors duration-300" href="#">Destinations</a>
        <a className="font-noto-serif uppercase tracking-widest text-sm text-slate-500 hover:text-primary-container transition-colors duration-300" href="#">Experiences</a>
        <a className="font-noto-serif uppercase tracking-widest text-sm text-slate-500 hover:text-primary-container transition-colors duration-300" href="#">Journal</a>
      </nav>

      {/* Mobile Drawer */}
      {isMenuOpen && (
        <div className="fixed inset-0 top-[73px] bg-background z-40 flex flex-col p-8 md:hidden animate-in fade-in slide-in-from-top-4">
          <nav className="flex flex-col gap-8 mb-12">
            <a className="text-2xl font-display text-primary" href="#">Destinations</a>
            <a className="text-2xl font-display text-primary" href="#">Experiences</a>
            <a className="text-2xl font-display text-primary" href="#">Journal</a>
          </nav>
          <button className="bg-primary text-on-primary w-full py-4 font-noto-serif text-sm uppercase tracking-widest">
            Book Now
          </button>
        </div>
      )}

      <button className="hidden md:block bg-primary text-on-primary px-8 py-3 font-noto-serif text-sm uppercase tracking-widest cursor-pointer transition-opacity active:opacity-70">
        Book Now
      </button>
    </header>
  );
}
