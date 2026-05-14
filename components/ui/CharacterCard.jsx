'use client';
import { motion } from 'framer-motion';

export default function CharacterCard({ name, role, image, isHidden, onClick, isSelected }) {
  return (
    <motion.div
      whileHover={{ y: -10, rotateY: isHidden ? 5 : 0 }}
      onClick={onClick}
      className={`relative w-32 h-48 sm:w-48 sm:h-72 md:w-64 md:h-96 rounded-xl cursor-pointer perspective-1000 ${isSelected ? 'ring-4 ring-sacred-blue shadow-[0_0_30px_rgba(30,58,138,0.8)]' : ''}`}
    >
      <motion.div
        className="w-full h-full preserve-3d transition-transform duration-700 relative"
        animate={{ rotateY: isHidden ? 180 : 0 }}
      >
        {/* Front (Visible Character) */}
        <div className="absolute inset-0 backface-hidden rounded-xl border border-accent-gold/30 overflow-hidden bg-myth-navy">
          {image && (
            <img src={image} alt={name} className="w-full h-full object-cover opacity-80" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-shadow-black via-transparent to-transparent" />
          <div className="absolute bottom-4 left-0 w-full text-center">
            <h3 className="text-base sm:text-lg md:text-xl font-heading text-accent-gold tracking-widest">{name}</h3>
            {role && <p className="text-xs md:text-sm font-accent text-ancient-parchment/80 mt-1">{role}</p>}
          </div>
          {/* Glowing Aura Overlay */}
          <div className="absolute inset-0 border-2 border-accent-gold/20 mix-blend-overlay pointer-events-none rounded-xl shadow-[inset_0_0_50px_rgba(212,175,55,0.1)]" />
        </div>

        {/* Back (Hidden Card) */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-xl border border-sacred-blue/50 overflow-hidden bg-[url('/images/textures/parchment.png')] bg-cover bg-center">
          <div className="absolute inset-0 bg-myth-navy/90 flex items-center justify-center">
             <div className="text-2xl md:text-4xl text-sacred-blue font-heading select-none opacity-50">?</div>
          </div>
          <div className="absolute inset-0 border-2 border-sacred-blue/20 rounded-xl shadow-[inset_0_0_30px_rgba(30,58,138,0.2)]" />
        </div>
      </motion.div>
    </motion.div>
  );
}
