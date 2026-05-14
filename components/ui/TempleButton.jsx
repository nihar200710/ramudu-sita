'use client';
import { motion } from 'framer-motion';

export default function TempleButton({ children, onClick, className = '', disabled = false }) {
  return (
    <motion.button
      suppressHydrationWarning
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      disabled={disabled}
      onClick={onClick}
      className={`relative group overflow-hidden border-2 border-accent-gold/40 hover:border-accent-gold bg-myth-navy/80 px-8 py-3 text-accent-gold uppercase tracking-[0.2em] font-heading font-bold shadow-[0_0_15px_rgba(212,175,55,0.1)] hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      <div className="absolute inset-0 bg-gradient-to-r from-accent-gold/0 via-accent-gold/10 to-accent-gold/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
      {/* Corner Ornaments */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-accent-gold" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-accent-gold" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-accent-gold" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-accent-gold" />
    </motion.button>
  );
}
