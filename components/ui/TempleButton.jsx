'use client';
import { motion } from 'framer-motion';

export default function TempleButton({ children, onClick, className = '', disabled = false }) {
  return (
    <motion.button
      suppressHydrationWarning
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      disabled={disabled}
      onClick={onClick}
      className={`relative group overflow-hidden border-2 border-heritage-gold/50 hover:border-heritage-gold bg-white/90 backdrop-blur-md px-10 py-4 text-heritage-gold uppercase tracking-[0.2em] font-heading font-bold shadow-[0_4px_20px_rgba(201,162,39,0.15)] hover:shadow-[0_8px_30px_rgba(201,162,39,0.3)] transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-sm ${className}`}
    >
      <span className="relative z-10 flex items-center gap-2 drop-shadow-sm group-hover:text-royal-gold transition-colors">{children}</span>
      
      {/* Gold Shimmer Sweep */}
      <div className="absolute inset-0 bg-gradient-to-r from-heritage-gold/0 via-heritage-gold/20 to-heritage-gold/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
      
      {/* Floral Glow Bloom on Hover */}
      <div className="absolute inset-0 bg-floral-accent/0 group-hover:bg-floral-accent/10 transition-colors duration-500" />
      
      {/* Engraved Corner Ornaments */}
      <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-heritage-gold/60 opacity-70" />
      <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-heritage-gold/60 opacity-70" />
      <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-heritage-gold/60 opacity-70" />
      <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-heritage-gold/60 opacity-70" />
    </motion.button>
  );
}
