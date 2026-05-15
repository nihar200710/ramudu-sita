'use client';
import { useGameStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';

export default function ScoreBoard() {
  const { players } = useGameStore();

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="bg-white/80 border-2 border-heritage-gold/30 rounded-xl p-4 md:p-6 backdrop-blur-md w-full max-w-sm md:max-w-md mx-auto shadow-[0_10px_30px_rgba(201,162,39,0.1)]">
      <h3 className="font-heading text-royal-gold tracking-[0.2em] uppercase text-sm md:text-lg text-center mb-4 md:mb-6 border-b-2 border-heritage-gold/20 pb-2 md:pb-4 font-bold">
        Chronicles of Glory
      </h3>
      <div className="space-y-3">
        <AnimatePresence>
          {sortedPlayers.map((player, index) => (
            <motion.div
              key={player.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex items-center justify-between p-3 rounded-md ${index === 0 ? 'bg-heritage-gold/10 border border-heritage-gold/40 shadow-sm' : 'bg-sacred-ivory/60 border border-transparent'}`}
            >
              <div className="flex items-center gap-3">
                <span className={`font-heading font-bold ${index === 0 ? 'text-royal-gold text-xl' : 'text-text-secondary text-lg'}`}>
                  #{index + 1}
                </span>
                <div>
                  <div className="font-heading text-text-primary font-bold">{player.name}</div>
                  {player.role && <div className="text-xs font-accent text-royal-gold/80 font-semibold">{player.role}</div>}
                </div>
              </div>
              <motion.div 
                key={player.score}
                initial={{ scale: 1.5, color: '#C9A227' }}
                animate={{ scale: 1, color: '#A67C00' }}
                className="font-heading font-bold text-2xl text-royal-gold"
              >
                {player.score}
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
