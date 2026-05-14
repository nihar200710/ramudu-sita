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
        scale: 0.85,
        duration: 1.4,
        ease: 'power3.out',
        delay: 0.2
      });

      gsap.to('.hero-bg', {
        y: '30%',
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
        y: 50,
        duration: 1,
        stagger: 0.3,
        scrollTrigger: {
          trigger: storyRef.current,
          start: 'top 70%',
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
      <main className="min-h-screen relative flex flex-col items-center justify-center py-20 px-4 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-myth-navy/90 z-10" />
          <img src="/images/hero/ayodhya-night.png" alt="Background" className="w-full h-full object-cover opacity-30" />
        </div>

        <div className="z-10 w-full max-w-6xl mx-auto flex flex-col items-center">
          <motion.div 
            initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl font-accent text-accent-gold/80 uppercase tracking-widest mb-2">Your Identity</h2>
            <div className="flex justify-center mb-4">
              {role && <CharacterCard name={role} isHidden={false} image={`/images/characters/${role.toLowerCase()}.png`} />}
            </div>
            {role === 'Ramudu' && (
              <p className="mt-4 text-sacred-blue text-xl font-accent animate-pulse">
                Find your Sita among the hidden ones.
              </p>
            )}
            {role === 'Sita' && (
              <p className="mt-4 text-accent-gold text-xl font-accent">
                Wait for Ramudu to find you.
              </p>
            )}
          </motion.div>

          <div className="flex flex-wrap justify-center gap-8 mb-16">
            {players.filter(p => p.id !== socket.id).map(p => (
              <div key={p.id} className="flex flex-col items-center gap-4">
                <CharacterCard
                  name={p.name}
                  isHidden={true}
                  isSelected={selectedCharacterId === p.id}
                  onClick={() => role === 'Ramudu' ? setSelectedCharacterId(p.id) : null}
                />
                <span className="font-heading text-ancient-parchment/80">{p.name}</span>
              </div>
            ))}
          </div>

          {role === 'Ramudu' && (
            <TempleButton onClick={handleGuess} disabled={!selectedCharacterId}>
              Reveal Identity
            </TempleButton>
          )}
        </div>
        
        <div className="fixed bottom-8 left-8 z-20">
           <ScoreBoard />
        </div>
      </main>
    );
  }

  if (gameStatus === 'finished') {
    return (
      <main className="min-h-screen relative flex flex-col items-center justify-center p-4">
        <div className="absolute inset-0 z-0 bg-myth-navy">
          <img src="/images/hero/ayodhya-night.png" alt="Background" className="w-full h-full object-cover opacity-20" />
        </div>
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="z-10 text-center bg-shadow-black/60 p-12 rounded-2xl border border-accent-gold/30 backdrop-blur-md"
        >
          <h1 className="text-6xl font-heading mb-6 drop-shadow-lg">
            {gameOverData.correct ? (
              <span className="text-accent-gold">Ramudu Found Sita!</span>
            ) : (
              <span className="text-red-500">A Tragic Mistake</span>
            )}
          </h1>
          <div className="flex flex-wrap justify-center gap-6 my-12">
             {gameOverData.players.map(p => (
               <div key={p.id} className="flex flex-col items-center gap-2">
                 <CharacterCard 
                    name={p.role} 
                    isHidden={false} 
                    image={`/images/characters/${p.role?.toLowerCase() || 'villager'}.png`} 
                 />
                 <h3 className="font-heading text-xl text-ancient-parchment mt-2">{p.name}</h3>
                 <p className="text-sm text-ancient-parchment/60">Score: {p.score}</p>
               </div>
             ))}
          </div>
          <div className="flex justify-center gap-4 items-center flex-col mt-8">
            <p className="text-accent-gold/80 font-accent tracking-widest uppercase">Next round starting in {countdown}...</p>
            <button onClick={handleLeaveChamber} className="px-6 py-3 border border-red-500/30 text-red-400 font-accent uppercase tracking-widest hover:bg-red-500/10 transition-colors mt-4">
              Leave Chamber
            </button>
          </div>
        </motion.div>
      </main>
    );
  }

  // Lobby Status (Storytelling Page)
  return (
    <main className="relative bg-myth-navy">
      {/* Chapter 1: Hero */}
      <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/hero/ayodhya-night.png" 
            alt="Ayodhya Night" 
            className="hero-bg w-full h-[130%] object-cover object-top opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-myth-navy/50 to-myth-navy" />
        </div>
        <div className="z-10 text-center px-4 hero-title">
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-heading text-transparent bg-clip-text bg-gradient-to-b from-accent-gold to-ancient-parchment drop-shadow-[0_0_30px_rgba(212,175,55,0.4)] mb-4">
            Ramudu Sita
          </h1>
          <p className="text-xl md:text-2xl font-accent text-ancient-parchment/80 tracking-widest uppercase">
            A Tale of Deception & Devotion
          </p>
        </div>
      </section>

      {/* Chapter 2: Narrative */}
      <section ref={storyRef} className="relative py-32 px-4 border-t border-accent-gold/10">
        <div className="max-w-3xl mx-auto text-center space-y-12">
          <p className="story-text text-2xl md:text-4xl font-heading leading-relaxed text-ancient-parchment">
            &quot;In the shadows of the ancient realms, identities are veiled.&quot;
          </p>
          <p className="story-text text-lg md:text-xl font-accent leading-loose text-ancient-parchment/70">
            One among you is Ramudu, destined to seek his beloved. Another is Sita, hidden in plain sight. The rest are allies and foes from the epic. Can Ramudu see through the illusion?
          </p>
        </div>
      </section>

      {/* Chapter 3 & 4: Multiplayer & Characters */}
      <section className="relative py-32 px-4 bg-gradient-to-b from-myth-navy to-shadow-black">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 flex justify-center gap-4">
              <CharacterCard name="Ramudu" role="The Seeker" image="/images/characters/ramudu.png" isHidden={false} />
              <div className="mt-20">
                <CharacterCard name="Sita" role="The Hidden One" image="/images/characters/sita.png" isHidden={false} />
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-4xl md:text-5xl font-heading text-accent-gold mb-8">Enter the Chamber</h2>
              <RoomLobby />
            </div>
          </div>
        </div>
      </section>
      
      {/* Chapter 5 & 6: Rules & Leaderboard are merged into the experience */}
    </main>
  );
}
