import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full py-12 bg-[#FBF8F6] border-t border-[#F2E8E0] flex flex-col items-center gap-4">
      <div className="flex gap-8">
        <a
          className="font-noto-serif text-[10px] tracking-widest text-slate-400 hover:text-black transition-opacity duration-300 uppercase"
          href="#"
        >
          Privacy
        </a>
        <a
          className="font-noto-serif text-[10px] tracking-widest text-slate-400 hover:text-black transition-opacity duration-300 uppercase"
          href="#"
        >
          Terms
        </a>
        <a
          className="font-noto-serif text-[10px] tracking-widest text-slate-400 hover:text-black transition-opacity duration-300 uppercase"
          href="#"
        >
          Contact
        </a>
      </div>
      <p className="font-noto-serif text-[10px] tracking-widest text-slate-400 uppercase">
        © 2024 KALA.SURF RESORTS. ALL RIGHTS RESERVED.
      </p>
    </footer>
  );
}
