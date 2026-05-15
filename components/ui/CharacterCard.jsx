'use client';
import { motion } from 'framer-motion';

export default function CharacterCard({ name, role, image, isHidden, onClick, isSelected }) {
  return (
    <motion.div
      whileHover={{ y: -10, rotateY: isHidden ? 5 : 0 }}
      onClick={onClick}
      className={`relative w-32 h-48 sm:w-48 sm:h-72 md:w-64 md:h-96 rounded-xl cursor-pointer perspective-1000 ${isSelected ? 'ring-4 ring-heritage-gold shadow-[0_0_30px_rgba(201,162,39,0.5)]' : ''}`}
    >
      <motion.div
        className="w-full h-full preserve-3d transition-transform duration-700 relative"
        animate={{ rotateY: isHidden ? 180 : 0 }}
      >
        {/* Front (Visible Character) */}
        <div className="absolute inset-0 backface-hidden rounded-xl border-2 border-heritage-gold/40 overflow-hidden bg-sacred-ivory shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
          {image && (
            <img src={image} alt={name} className="w-full h-full object-cover opacity-90 mix-blend-multiply" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-sacred-ivory via-sacred-ivory/40 to-transparent" />
          <div className="absolute bottom-6 left-0 w-full text-center px-2">
            <h3 className="text-lg sm:text-xl md:text-2xl font-heading text-royal-gold tracking-widest font-bold">{name}</h3>
            {role && <p className="text-xs md:text-sm font-accent text-text-secondary mt-1 font-semibold">{role}</p>}
          </div>
          {/* Subtle overlay border for depth */}
          <div className="absolute inset-0 border-4 border-heritage-gold/20 mix-blend-overlay pointer-events-none rounded-xl" />
        </div>

        {/* Back (Hidden Card) */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-xl border-2 border-heritage-gold/50 overflow-hidden bg-[url('/images/textures/mandala_parchment.png')] bg-cover bg-center shadow-[0_10px_30px_rgba(0,0,0,0.15)]">
          <div className="absolute inset-0 bg-sacred-ivory/40 flex items-center justify-center backdrop-blur-[2px]">
             {/* Center ornament instead of question mark */}
             <div className="w-16 h-16 md:w-24 md:h-24 rounded-full border-2 border-heritage-gold/50 flex items-center justify-center">
               <div className="w-12 h-12 md:w-20 md:h-20 rounded-full border border-heritage-gold/30 flex items-center justify-center">
                 <div className="w-8 h-8 md:w-16 md:h-16 rounded-full border border-heritage-gold flex items-center justify-center shadow-[0_0_15px_rgba(201,162,39,0.3)]">
                   <span className="text-2xl md:text-4xl text-royal-gold font-heading opacity-80">?</span>
                 </div>
               </div>
             </div>
          </div>
          <div className="absolute inset-0 border-4 border-heritage-gold/20 rounded-xl pointer-events-none mix-blend-overlay" />
        </div>
      </motion.div>
    </motion.div>
  );
}
