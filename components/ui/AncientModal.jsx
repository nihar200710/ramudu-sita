'use client';
import { motion, AnimatePresence } from 'framer-motion';

export default function AncientModal({ isOpen, onClose, title, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-shadow-black/80 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg"
          >
            <div className="relative bg-[#0b1524] border border-accent-gold/30 p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] before:absolute before:inset-0 before:bg-[url('/images/textures/parchment.png')] before:opacity-5 before:pointer-events-none">
              {/* Corner Ornaments */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-accent-gold -translate-x-1 -translate-y-1" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-accent-gold translate-x-1 -translate-y-1" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-accent-gold -translate-x-1 translate-y-1" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-accent-gold translate-x-1 translate-y-1" />
              
              {title && (
                <h2 className="text-2xl text-center font-heading text-accent-gold tracking-widest mb-6 uppercase">
                  {title}
                </h2>
              )}
              <div className="relative z-10 text-ancient-parchment">
                {children}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
