'use client';
import { useState, useEffect } from 'react';
import { useGameStore } from '@/lib/store';
import TempleButton from '../ui/TempleButton';
import AncientModal from '../ui/AncientModal';
import { motion } from 'framer-motion';
import { Users, Copy, Check, Link as LinkIcon } from 'lucide-react';

export default function RoomLobby() {
  const { socket, roomId, setRoomId, players, playerName, setPlayerName, setGameStatus } = useGameStore();
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const roomParam = urlParams.get('room');
      if (roomParam) {
        setJoinCode(roomParam);
      }
    }
  }, []);

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

  const copyInviteLink = () => {
    const inviteLink = `${window.location.origin}/?room=${roomId}`;
    navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (roomId) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl mx-auto bg-white/80 p-8 border-2 border-heritage-gold/40 rounded-xl backdrop-blur-xl shadow-[0_20px_40px_rgba(201,162,39,0.15)] relative overflow-hidden"
      >
        {/* Decorative floral background hint */}
        <div className="absolute inset-0 bg-[url('/images/textures/mandala_parchment.png')] opacity-10 mix-blend-multiply pointer-events-none" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b-2 border-heritage-gold/20 pb-6 mb-6 relative z-10">
          <div>
            <h2 className="text-sm font-accent text-text-secondary uppercase tracking-[0.2em] mb-1 font-bold">Sacred Chamber</h2>
            <div className="flex items-center gap-4">
              <span className="text-4xl font-heading text-royal-gold tracking-widest font-bold">{roomId}</span>
              <button suppressHydrationWarning onClick={copyCode} className="p-2 text-royal-gold hover:bg-heritage-gold/10 rounded-md transition-colors" title="Copy Room Code">
                {copied ? <Check size={20} /> : <Copy size={20} />}
              </button>
            </div>
            <div className="mt-2">
              <button onClick={copyInviteLink} className="flex items-center gap-2 px-3 py-1 text-xs font-accent font-bold uppercase tracking-wider text-royal-gold border border-heritage-gold/40 rounded hover:bg-heritage-gold/10 transition-colors">
                {copiedLink ? <Check size={14} /> : <LinkIcon size={14} />}
                {copiedLink ? 'Link Copied' : 'Copy Invite Link'}
              </button>
            </div>
          </div>
          <div className="text-center md:text-right">
            <div className="flex items-center justify-center md:justify-end gap-2 text-royal-gold mb-2 font-bold">
              <Users size={20} />
              <span className="font-heading text-xl">{players.length} Players</span>
            </div>
            <p className="text-sm text-text-secondary font-accent font-medium">Minimum 3 players required</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8 relative z-10">
          {players.map((p, i) => (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              key={p.id} 
              className="bg-sacred-ivory/90 border border-heritage-gold/30 p-4 rounded-md text-center relative overflow-hidden shadow-sm"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-heritage-gold/50 to-transparent" />
              <span className="font-heading text-text-primary text-lg font-bold">{p.name}</span>
              {i === 0 && <span className="block text-xs text-royal-gold mt-1 uppercase tracking-wider font-accent font-bold">Host</span>}
            </motion.div>
          ))}
          {players.length < 3 && Array.from({ length: 3 - players.length }).map((_, i) => (
            <div key={`empty-${i}`} className="border-2 border-dashed border-heritage-gold/20 p-4 rounded-md text-center flex items-center justify-center opacity-70 bg-white/40">
              <span className="font-accent text-sm text-text-secondary font-medium">Waiting...</span>
            </div>
          ))}
        </div>

        <div className="text-center relative z-10">
          {players[0]?.id === socket?.id ? (
             <TempleButton 
              onClick={() => socket.emit('start_game', roomId)}
              disabled={players.length < 3}
              className="w-full md:w-auto shadow-md"
            >
              Begin the Epic
            </TempleButton>
          ) : (
            <p className="font-accent text-royal-gold italic animate-pulse font-bold">Waiting for host to begin...</p>
          )}
          
          <div className="mt-8">
            <button onClick={() => {
              socket.emit('leave_chamber', roomId);
              setRoomId(null);
              setPlayers([]);
              setGameStatus('lobby');
            }} className="px-4 py-2 text-sm text-red-700 hover:text-red-900 transition-colors uppercase tracking-widest font-accent border-b border-red-800/30 hover:border-red-800/60 font-bold">
              Leave Chamber
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-8 relative z-10 bg-white/70 p-8 rounded-xl border border-heritage-gold/20 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
      <div className="space-y-4">
        <label className="block text-text-secondary font-heading tracking-[0.2em] uppercase text-sm font-bold">Your Identity</label>
        <input 
          suppressHydrationWarning
          type="text" 
          placeholder="Enter your name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          className="w-full bg-sacred-ivory/80 border-b-2 border-heritage-gold/40 text-text-primary p-3 outline-none focus:border-royal-gold focus:bg-white transition-all font-accent rounded-t-md font-bold"
        />
      </div>

      {error && (
        <p className="text-red-800 font-accent text-sm text-center bg-red-100/80 py-2 border border-red-300 rounded-md shadow-sm font-medium">
          {error}
        </p>
      )}

      <div className="pt-4 space-y-4">
        <TempleButton onClick={handleCreateRoom} className="w-full shadow-md">
          Enter the Sacred Chamber
        </TempleButton>
        
        <div className="flex items-center gap-4 text-heritage-gold/60 font-heading text-sm my-6">
          <div className="h-px bg-heritage-gold/30 flex-1" />
          <span className="font-bold">OR</span>
          <div className="h-px bg-heritage-gold/30 flex-1" />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <input 
            suppressHydrationWarning
            type="text" 
            placeholder="Room Code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            className="flex-1 bg-sacred-ivory/80 border-b-2 border-heritage-gold/40 text-text-primary p-3 outline-none focus:border-royal-gold focus:bg-white uppercase transition-all font-accent tracking-widest text-center rounded-t-md font-bold"
          />
          <TempleButton onClick={handleJoinRoom} className="!px-6 w-full sm:w-auto shadow-md">
            Join
          </TempleButton>
        </div>
      </div>
    </div>
  );
}
