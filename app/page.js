'use client';
import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useGameStore } from '@/lib/store';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { motion } from 'framer-motion';

import RoomLobby from '@/components/game/RoomLobby';
import ScoreBoard from '@/components/game/ScoreBoard';
import CharacterCard from '@/components/ui/CharacterCard';
import TempleButton from '@/components/ui/TempleButton';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const { 
    setSocket, socket, gameStatus, setGameStatus, 
    setRoomId, setPlayers, role, setRole, players,
    gameOverData, setGameOverData
  } = useGameStore();

  const heroRef = useRef(null);
  const storyRef = useRef(null);
  const [selectedCharacterId, setSelectedCharacterId] = useState(null);
  const [countdown, setCountdown] = useState(0);

  // Setup Socket & Lenis
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Initialize Socket for Production
    const socketUrl = 'https://ramudu-sita.onrender.com';
    const newSocket = io(socketUrl);
    setSocket(newSocket);

    newSocket.on('room_created', ({ roomId }) => {
      setRoomId(roomId);
    });
    newSocket.on('room_joined', ({ roomId }) => {
      setRoomId(roomId);
    });
    newSocket.on('update_players', (playersList) => {
      setPlayers(playersList);
    });
    newSocket.on('game_started', () => {
      setGameStatus('playing');
      lenis.scrollTo(0, { immediate: true }); // Scroll to top for game view
    });
    newSocket.on('role_assigned', ({ role }) => {
      setRole(role);
    });
    newSocket.on('game_over', (data) => {
      setGameOverData(data);
      setGameStatus('finished');
    });
    newSocket.on('chamber_returned', () => {
      resetGame();
    });

    return () => {
      newSocket.disconnect();
      lenis.destroy();
    };
  }, []);

  // GSAP Animations
  useEffect(() => {
    if (gameStatus !== 'lobby') return;

    const ctx = gsap.context(() => {
      // Chapter 1: Hero Intro
      gsap.from('.hero-title', {
        opacity: 0,
        y: 30,
        duration: 1.8,
        ease: 'power3.out',
        delay: 0.2
      });

      gsap.to('.hero-bg', {
        y: '20%',
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      });

      // Chapter 2: Story Reveal
      gsap.from('.story-text', {
        opacity: 0,
        y: 40,
        duration: 1.2,
        stagger: 0.3,
        scrollTrigger: {
          trigger: storyRef.current,
          start: 'top 80%',
        }
      });
    });

    return () => ctx.revert();
  }, [gameStatus]);

  useEffect(() => {
    if (gameStatus === 'finished') {
      setCountdown(8);
      const interval = setInterval(() => {
        setCountdown((c) => Math.max(0, c - 1));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameStatus]);

  const handleGuess = () => {
    if (role === 'Ramudu' && selectedCharacterId) {
      socket.emit('guess_sita', { roomId: useGameStore.getState().roomId, guessedPlayerId: selectedCharacterId });
    }
  };

  const resetGame = () => {
    setGameStatus('lobby');
    setGameOverData(null);
    setSelectedCharacterId(null);
    setRole(null);
  };

  const handleLeaveChamber = () => {
    socket.emit('leave_chamber', useGameStore.getState().roomId);
    setRoomId(null);
    setPlayers([]);
    resetGame();
  };

  if (gameStatus === 'playing') {
    return (
      <main className="min-h-screen relative flex flex-col items-center justify-center py-20 px-4 overflow-x-hidden bg-sacred-ivory">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-sacred-ivory/80 z-10 backdrop-blur-[2px]" />
          <img src="/images/hero/ivory_palace.png" alt="Background" className="w-full h-full object-cover opacity-40 mix-blend-multiply" />
        </div>

        <div className="z-10 w-full max-w-6xl mx-auto flex flex-col items-center">
          <motion.div 
            initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl font-accent text-heritage-gold uppercase tracking-widest mb-2 font-bold">Your Identity</h2>
            <div className="flex justify-center mb-4">
              {role && <CharacterCard name={role} isHidden={false} image={`/images/characters/${role.toLowerCase()}.png`} />}
            </div>
            {role === 'Ramudu' && (
              <p className="mt-4 text-royal-gold text-xl font-accent animate-pulse font-semibold">
                Find your Sita among the hidden ones.
              </p>
            )}
            {role === 'Sita' && (
              <p className="mt-4 text-heritage-gold text-xl font-accent font-semibold">
                Wait for Ramudu to find you.
              </p>
            )}
          </motion.div>

          <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-16">
            {players.filter(p => p.id !== socket.id).map(p => (
              <div key={p.id} className="flex flex-col items-center gap-4">
                <CharacterCard
                  name={p.name}
                  isHidden={true}
                  isSelected={selectedCharacterId === p.id}
                  onClick={() => role === 'Ramudu' ? setSelectedCharacterId(p.id) : null}
                />
                <span className="font-heading text-text-primary text-xl font-semibold">{p.name}</span>
              </div>
            ))}
          </div>

          {role === 'Ramudu' && (
            <TempleButton onClick={handleGuess} disabled={!selectedCharacterId}>
              Reveal Identity
            </TempleButton>
          )}
        </div>
        
        <div className="relative w-full mt-12 md:mt-0 md:fixed md:w-auto md:bottom-8 md:left-8 z-20 pointer-events-none">
           <div className="pointer-events-auto flex justify-center md:block">
             <ScoreBoard />
           </div>
        </div>
      </main>
    );
  }

  if (gameStatus === 'finished') {
    return (
      <main className="min-h-screen relative flex flex-col items-center justify-center p-4 bg-sacred-ivory">
        <div className="absolute inset-0 z-0">
          <img src="/images/hero/ivory_palace.png" alt="Background" className="w-full h-full object-cover opacity-20 mix-blend-multiply" />
        </div>
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="z-10 text-center bg-white/80 p-12 rounded-2xl border-2 border-heritage-gold/30 backdrop-blur-xl shadow-[0_20px_50px_rgba(201,162,39,0.1)]"
        >
          <h1 className="text-4xl md:text-6xl font-heading mb-6 drop-shadow-sm font-bold">
            {gameOverData.correct ? (
              <span className="text-gold-embossed">Ramudu Found Sita!</span>
            ) : (
              <span className="text-red-800">A Tragic Mistake</span>
            )}
          </h1>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 my-8 md:my-12">
             {gameOverData.players.map(p => (
               <div key={p.id} className="flex flex-col items-center gap-2">
                 <CharacterCard 
                    name={p.role} 
                    isHidden={false} 
                    image={`/images/characters/${p.role?.toLowerCase() || 'villager'}.png`} 
                 />
                 <h3 className="font-heading text-2xl text-text-primary mt-2 font-semibold">{p.name}</h3>
                 <p className="text-md text-text-secondary font-medium">Score: {p.score}</p>
               </div>
             ))}
          </div>
          <div className="flex justify-center gap-4 items-center flex-col mt-8">
            <p className="text-heritage-gold font-accent tracking-widest uppercase font-bold">Next round starting in {countdown}...</p>
            <button onClick={handleLeaveChamber} className="px-8 py-3 border-2 border-red-800/20 text-red-800 font-accent uppercase tracking-widest hover:bg-red-50 hover:border-red-800/40 transition-all rounded-md font-bold mt-4">
              Leave Chamber
            </button>
          </div>
        </motion.div>
      </main>
    );
  }

  // Lobby Status (Storytelling Page)
  return (
    <main className="relative bg-sacred-ivory">
      {/* Chapter 1: Hero */}
      <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Floating Floral Particles could be added here in the future */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/hero/ivory_palace.png" 
            alt="Palace Interior" 
            className="hero-bg w-full h-[120%] object-cover object-center opacity-80 mix-blend-multiply"
          />
          {/* Subtle gradient overlay to ensure text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-sacred-ivory/30 via-transparent to-sacred-ivory/90" />
          
          {/* Ornamental Frame (CSS generated) */}
          <div className="absolute inset-4 border-[1px] border-heritage-gold/30 rounded-lg pointer-events-none mix-blend-multiply" />
          <div className="absolute inset-6 border-[2px] border-heritage-gold/20 rounded-lg pointer-events-none mix-blend-multiply" />
        </div>
        <div className="z-10 text-center px-4 hero-title relative">
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-heading text-gold-embossed mb-6 font-bold pb-2">
            Ramudu Sita
          </h1>
          <p className="text-xl md:text-2xl font-accent text-text-primary tracking-[0.3em] uppercase font-bold drop-shadow-sm">
            A Tale of Deception & Devotion
          </p>
        </div>
      </section>

      {/* Chapter 2: Narrative */}
      <section ref={storyRef} className="relative py-32 px-4 border-t border-heritage-gold/20 bg-[url('/images/textures/mandala_parchment.png')] bg-cover bg-fixed bg-center">
        <div className="absolute inset-0 bg-sacred-ivory/80 backdrop-blur-sm" />
        <div className="max-w-3xl mx-auto text-center space-y-12 relative z-10">
          <p className="story-text text-3xl md:text-5xl font-heading leading-relaxed text-text-primary font-bold">
            "In the sacred halls, identities are veiled."
          </p>
          <div className="w-24 h-1 bg-heritage-gold mx-auto opacity-50 story-text" />
          <p className="story-text text-lg md:text-2xl font-accent leading-loose text-text-secondary font-medium">
            One among you is Ramudu, destined to seek his beloved. Another is Sita, hidden in plain sight. The rest are allies and foes from the epic. Can Ramudu see through the illusion?
          </p>
        </div>
      </section>

      {/* Chapter 3 & 4: Multiplayer & Characters */}
      <section className="relative py-32 px-4 bg-gradient-to-b from-soft-sand to-sacred-ivory">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 flex justify-center gap-4 relative">
               {/* Decorative background glow for characters */}
               <div className="absolute inset-0 bg-heritage-gold/10 blur-[100px] rounded-full pointer-events-none" />
               <div className="relative z-10">
                 <CharacterCard name="Ramudu" role="The Seeker" image="/images/characters/ramudu.png" isHidden={false} />
               </div>
               <div className="mt-24 relative z-10">
                 <CharacterCard name="Sita" role="The Hidden One" image="/images/characters/sita.png" isHidden={false} />
               </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-4xl md:text-6xl font-heading text-gold-embossed mb-8 font-bold">Enter the Chamber</h2>
              <RoomLobby />
            </div>
          </div>
        </div>
      </section>
      
    </main>
  );
}
