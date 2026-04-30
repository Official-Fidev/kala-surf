import React from 'react';

export default function Header() {
  return (
    <header className="fixed top-0 w-full z-50 bg-[#FBF8F6]/80 backdrop-blur-md border-b border-[#F2E8E0] flex justify-between items-center px-12 py-6">
      <div className="text-2xl font-light tracking-[0.2em] text-primary-container uppercase">
        kala.surf
      </div>
      <nav className="hidden md:flex gap-12 items-center">
        <a
          className="font-noto-serif uppercase tracking-widest text-sm text-slate-500 hover:text-primary-container transition-colors duration-300"
          href="#"
        >
          Destinations
        </a>
        <a
          className="font-noto-serif uppercase tracking-widest text-sm text-slate-500 hover:text-primary-container transition-colors duration-300"
          href="#"
        >
          Experiences
        </a>
        <a
          className="font-noto-serif uppercase tracking-widest text-sm text-slate-500 hover:text-primary-container transition-colors duration-300"
          href="#"
        >
          Journal
        </a>
      </nav>
      <button className="bg-primary text-on-primary px-8 py-3 font-noto-serif text-sm uppercase tracking-widest cursor-pointer transition-opacity active:opacity-70">
        Book Now
      </button>
    </header>
  );
}
