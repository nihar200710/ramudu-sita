'use client';
import { useGameStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';

export default function ScoreBoard() {
  const { players } = useGameStore();

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="bg-myth-navy/60 border border-accent-gold/20 rounded-xl p-4 md:p-6 backdrop-blur-sm w-full max-w-sm md:max-w-md mx-auto">
      <h3 className="font-heading text-accent-gold tracking-widest uppercase text-sm md:text-lg text-center mb-4 md:mb-6 border-b border-accent-gold/20 pb-2 md:pb-4">
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
              className={`flex items-center justify-between p-3 rounded ${index === 0 ? 'bg-accent-gold/10 border border-accent-gold/30' : 'bg-shadow-black/40'}`}
            >
              <div className="flex items-center gap-3">
                <span className={`font-heading ${index === 0 ? 'text-accent-gold text-lg' : 'text-ancient-parchment/60'}`}>
                  #{index + 1}
                </span>
                <div>
                  <div className="font-heading text-ancient-parchment">{player.name}</div>
                  {player.role && <div className="text-xs font-accent text-accent-gold/70">{player.role}</div>}
                </div>
              </div>
              <motion.div 
                key={player.score}
                initial={{ scale: 1.5, color: '#D4AF37' }}
                animate={{ scale: 1, color: '#E7D7B1' }}
                className="font-heading font-bold text-xl"
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
