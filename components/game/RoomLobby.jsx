'use client';
import { useState, useEffect } from 'react';
import { useGameStore } from '@/lib/store';
import TempleButton from '../ui/TempleButton';
import AncientModal from '../ui/AncientModal';
import { motion } from 'framer-motion';
import { Users, Copy, Check } from 'lucide-react';

export default function RoomLobby() {
  const { socket, roomId, setRoomId, players, playerName, setPlayerName, setGameStatus } = useGameStore();
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!socket) return;
    socket.on('error', (msg) => setError(msg));
    return () => socket.off('error');
  }, [socket]);

  const handleCreateRoom = () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    socket.emit('create_room', { name: playerName });
  };

  const handleJoinRoom = () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!joinCode.trim()) {
      setError('Please enter a room code');
      return;
    }
    socket.emit('join_room', { roomId: joinCode.toUpperCase(), name: playerName });
  };

  const copyCode = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (roomId) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl mx-auto bg-myth-navy/50 p-8 border border-accent-gold/20 rounded-xl backdrop-blur-md"
      >
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-accent-gold/20 pb-6 mb-6">
          <div>
            <h2 className="text-sm font-accent text-accent-gold/80 uppercase tracking-widest mb-1">Sacred Chamber</h2>
            <div className="flex items-center gap-4">
              <span className="text-4xl font-heading text-ancient-parchment tracking-widest">{roomId}</span>
              <button suppressHydrationWarning onClick={copyCode} className="p-2 text-accent-gold hover:bg-accent-gold/10 rounded transition-colors">
                {copied ? <Check size={20} /> : <Copy size={20} />}
              </button>
            </div>
          </div>
          <div className="text-center md:text-right">
            <div className="flex items-center justify-center md:justify-end gap-2 text-accent-gold mb-2">
              <Users size={20} />
              <span className="font-heading text-xl">{players.length} Players</span>
            </div>
            <p className="text-sm text-ancient-parchment/60 font-accent">Minimum 3 players required</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {players.map((p, i) => (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              key={p.id} 
              className="bg-shadow-black/50 border border-sacred-blue/30 p-4 rounded text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent-gold/50 to-transparent" />
              <span className="font-heading text-ancient-parchment text-lg">{p.name}</span>
              {i === 0 && <span className="block text-xs text-accent-gold/60 mt-1 uppercase tracking-wider font-accent">Host</span>}
            </motion.div>
          ))}
          {players.length < 3 && Array.from({ length: 3 - players.length }).map((_, i) => (
            <div key={`empty-${i}`} className="border border-dashed border-accent-gold/20 p-4 rounded text-center flex items-center justify-center opacity-50">
              <span className="font-accent text-sm text-ancient-parchment/40">Waiting...</span>
            </div>
          ))}
        </div>

        <div className="text-center">
          {players[0]?.id === socket?.id ? (
             <TempleButton 
              onClick={() => socket.emit('start_game', roomId)}
              disabled={players.length < 3}
              className="w-full md:w-auto"
            >
              Begin the Epic
            </TempleButton>
          ) : (
            <p className="font-accent text-accent-gold/80 italic animate-pulse">Waiting for host to begin...</p>
          )}
          
          <div className="mt-8">
            <button onClick={() => {
              socket.emit('leave_chamber', roomId);
              setRoomId(null);
              setPlayers([]);
              setGameStatus('lobby');
            }} className="px-4 py-2 text-sm text-red-400 hover:text-red-300 transition-colors uppercase tracking-widest font-accent border-b border-red-900/50 hover:border-red-500/50">
              Leave Chamber
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-8 relative z-10">
      <div className="space-y-4">
        <label className="block text-accent-gold font-heading tracking-widest uppercase text-sm">Your Identity</label>
        <input 
          suppressHydrationWarning
          type="text" 
          placeholder="Enter your name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          className="w-full bg-myth-navy/80 border-b-2 border-accent-gold/40 text-ancient-parchment p-3 outline-none focus:border-accent-gold transition-colors font-accent"
        />
      </div>

      {error && (
        <p className="text-red-400 font-accent text-sm text-center bg-red-900/20 py-2 border border-red-500/30">
          {error}
        </p>
      )}

      <div className="pt-4 space-y-4">
        <TempleButton onClick={handleCreateRoom} className="w-full">
          Create Chamber
        </TempleButton>
        
        <div className="flex items-center gap-4 text-accent-gold/40 font-heading text-sm my-6">
          <div className="h-px bg-accent-gold/20 flex-1" />
          OR
          <div className="h-px bg-accent-gold/20 flex-1" />
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <input 
            suppressHydrationWarning
            type="text" 
            placeholder="Room Code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            className="flex-1 bg-myth-navy/80 border-b-2 border-sacred-blue/40 text-ancient-parchment p-3 outline-none focus:border-sacred-blue uppercase transition-colors font-accent tracking-widest text-center"
          />
          <TempleButton onClick={handleJoinRoom} className="!px-6 w-full sm:w-auto">
            Join
          </TempleButton>
        </div>
      </div>
    </div>
  );
}
