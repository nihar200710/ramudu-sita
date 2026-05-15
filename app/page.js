'use client';
import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useGameStore } from '@/lib/store';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { motion } from 'framer-motion';
import { Howl } from 'howler';

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
  const slokhaRef = useRef(null);
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

    const socketUrl = 'https://ramudu-sita.onrender.com';
    const newSocket = io(socketUrl);
    setSocket(newSocket);

    newSocket.on('room_created', ({ roomId }) => setRoomId(roomId));
    newSocket.on('room_joined', ({ roomId }) => setRoomId(roomId));
    newSocket.on('update_players', (playersList) => setPlayers(playersList));
    newSocket.on('game_started', () => {
      setGameStatus('playing');
      lenis.scrollTo(0, { immediate: true }); 
    });
    newSocket.on('role_assigned', ({ role }) => setRole(role));
    newSocket.on('game_over', (data) => {
      setGameOverData(data);
      setGameStatus('finished');
    });
    newSocket.on('chamber_returned', () => resetGame());

    return () => {
      newSocket.disconnect();
      lenis.destroy();
    };
  }, []);

  // GSAP Animations
  useEffect(() => {
    if (gameStatus !== 'lobby') return;

    const ctx = gsap.context(() => {
      gsap.from('.hero-title-main', {
        opacity: 0,
        y: 30,
        duration: 2,
        ease: 'power3.out',
        delay: 0.5
      });

      gsap.from('.hero-title-bg', {
        opacity: 0,
        scale: 1.1,
        duration: 3,
        ease: 'power2.out',
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

      gsap.from('.story-text', {
        opacity: 0,
        y: 40,
        duration: 1.5,
        stagger: 0.4,
        scrollTrigger: {
          trigger: storyRef.current,
          start: 'top 80%',
        }
      });

      // Slokha Reveal with Audio
      let playedBell = false;
      gsap.from('.slokha-char', {
        opacity: 0,
        y: 10,
        duration: 0.8,
        stagger: 0.05,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: slokhaRef.current,
          start: 'top 75%',
          onEnter: () => {
             if (!playedBell) {
               try {
                 const bell = new Howl({ src: ['/audio/temple-bell.mp3'], volume: 0.3 });
                 bell.play();
                 playedBell = true;
               } catch (e) {}
             }
          }
        }
      });
    });

    return () => ctx.revert();
  }, [gameStatus]);

  useEffect(() => {
    if (gameStatus === 'finished') {
      setCountdown(8);
      const interval = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000);
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
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-sacred-ivory/80 z-10 backdrop-blur-[2px]" />
          <img src="/images/hero/chamber_bg.png" alt="Background" className="w-full h-full object-cover opacity-40 mix-blend-multiply" />
        </div>

        <div className="z-10 w-full max-w-6xl mx-auto flex flex-col items-center">
          <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-12">
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
            <TempleButton onClick={handleGuess} disabled={!selectedCharacterId}>Reveal Identity</TempleButton>
          )}
        </div>
        
        <div className="relative w-full mt-12 md:mt-0 md:fixed md:w-auto md:bottom-8 md:left-8 z-20 pointer-events-none">
           <div className="pointer-events-auto flex justify-center md:block"><ScoreBoard /></div>
        </div>
      </main>
    );
  }

  if (gameStatus === 'finished') {
    return (
      <main className="min-h-screen relative flex flex-col items-center justify-center p-4 bg-sacred-ivory">
        <div className="absolute inset-0 z-0">
          <img src="/images/hero/chamber_bg.png" alt="Background" className="w-full h-full object-cover opacity-20 mix-blend-multiply" />
        </div>
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="z-10 text-center bg-white/80 p-12 rounded-2xl border-2 border-heritage-gold/30 backdrop-blur-xl shadow-[0_20px_50px_rgba(201,162,39,0.1)]">
          <h1 className="text-4xl md:text-6xl font-heading mb-6 drop-shadow-sm font-bold">
            {gameOverData.correct ? <span className="text-gold-embossed">Ramudu Found Sita!</span> : <span className="text-red-800">A Tragic Mistake</span>}
          </h1>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 my-8 md:my-12">
             {gameOverData.players.map(p => (
               <div key={p.id} className="flex flex-col items-center gap-2">
                 <CharacterCard name={p.role} isHidden={false} image={`/images/characters/${p.role?.toLowerCase() || 'villager'}.png`} />
                 <h3 className="font-heading text-2xl text-text-primary mt-2 font-semibold">{p.name}</h3>
                 <p className="text-md text-text-secondary font-medium">Score: {p.score}</p>
               </div>
             ))}
          </div>
          <div className="flex justify-center gap-4 items-center flex-col mt-8">
            <p className="text-heritage-gold font-accent tracking-widest uppercase font-bold">Next round starting in {countdown}...</p>
            <button onClick={handleLeaveChamber} className="px-8 py-3 border-2 border-red-800/20 text-red-800 font-accent uppercase tracking-widest hover:bg-red-50 hover:border-red-800/40 transition-all rounded-md font-bold mt-4">Leave Chamber</button>
          </div>
        </motion.div>
      </main>
    );
  }

  // Particle Generation for Background
  const particles = Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 15 + 5,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5
  }));

  const slokhaText = "मायायां लीयते सत्यं। प्रेम्णा ज्ञायते सीता॥";

  return (
    <main className="relative bg-sacred-ivory selection:bg-heritage-gold selection:text-white overflow-hidden">
      
      {/* Chapter 1: Sacred Entrance */}
      <section ref={heroRef} className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
        
        {/* Background & Particles */}
        <div className="absolute inset-0 z-0">
          <img src="/images/hero/chamber_bg.png" alt="Sacred Chamber" className="hero-bg w-full h-[120%] object-cover object-center opacity-70 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-b from-sacred-ivory/20 via-transparent to-sacred-ivory" />
          
          {/* Subtle Rotating Mandala */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] border border-heritage-gold/10 rounded-full animate-spin-slow mix-blend-multiply pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] border border-heritage-gold/20 rounded-full animate-spin-slow mix-blend-multiply pointer-events-none" style={{ animationDirection: 'reverse', animationDuration: '90s' }} />

          {/* Floating Incense / Petals */}
          {particles.map(p => (
            <motion.div
              key={p.id}
              className="absolute rounded-full bg-heritage-gold/20 blur-[2px]"
              style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%` }}
              animate={{ y: [0, -100, 0], x: [0, Math.random() * 50 - 25, 0], opacity: [0, 0.8, 0] }}
              transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
        </div>

        {/* Foreground Typography */}
        <div className="z-10 flex flex-col items-center justify-center w-full relative h-full">
          {/* Massive Outlined Text Behind */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center hero-title-bg pointer-events-none mix-blend-multiply">
            <h1 className="text-[12vw] leading-none font-heading text-outline-gold font-bold tracking-widest whitespace-nowrap opacity-40">
              RAMUDUSITA
            </h1>
          </div>

          {/* Centerpiece Typography */}
          <div className="relative hero-title-main text-center flex flex-col items-center z-20 mt-[-5vh]">
            {/* Top Emblem / Sacred Symbol */}
            <div className="mb-6 w-12 h-12 border-2 border-heritage-gold/50 rounded-full flex items-center justify-center rotate-45 shadow-[0_0_15px_rgba(201,162,39,0.3)]">
               <div className="w-6 h-6 border border-royal-gold/60 rounded-full -rotate-45" />
            </div>

            <h1 className="text-7xl md:text-9xl font-samarkan text-gold-embossed mb-2 drop-shadow-md">
              रामुडु सीता
            </h1>
            <h2 className="text-xl md:text-3xl font-heading text-text-primary tracking-[0.5em] uppercase font-bold mt-4">
              Ramudu <span className="text-heritage-gold">•</span> Sita
            </h2>
          </div>
        </div>
      </section>

      {/* Chapter 2: Narrative & Slokha */}
      <section ref={storyRef} className="relative min-h-screen py-32 px-4 flex flex-col items-center justify-center bg-[url('/images/textures/mandala_parchment.png')] bg-cover bg-fixed bg-center border-t border-heritage-gold/20">
        <div className="absolute inset-0 bg-sacred-ivory/85 backdrop-blur-[1px]" />
        
        <div className="max-w-4xl mx-auto text-center space-y-20 relative z-10 w-full">
          
          {/* English Narrative */}
          <div className="space-y-8">
            <p className="story-text text-2xl md:text-4xl font-heading leading-relaxed text-text-primary font-bold">
              In the sacred halls, identities are veiled.
            </p>
            <p className="story-text text-lg md:text-2xl font-accent leading-loose text-text-secondary max-w-2xl mx-auto font-medium">
              One among you is Ramudu, destined to seek his beloved.<br/>
              Another is Sita, hidden in plain sight.<br/>
              The rest are allies and foes from the epic.<br/>
              Can Ramudu see through the illusion?
            </p>
          </div>

          <div className="w-px h-24 bg-gradient-to-b from-transparent via-heritage-gold to-transparent mx-auto story-text" />

          {/* Sanskrit Slokha Reveal */}
          <div ref={slokhaRef} className="py-12 relative">
            <div className="absolute inset-0 bg-heritage-gold/5 blur-3xl rounded-full" />
            <h3 className="text-3xl md:text-5xl font-samarkan text-royal-gold mb-8 leading-relaxed drop-shadow-sm flex flex-wrap justify-center gap-x-3 md:gap-x-5">
              {slokhaText.split(' ').map((word, index) => (
                <span key={index} className="slokha-char inline-block">
                  {word}
                </span>
              ))}
            </h3>
            <p className="story-text text-base md:text-lg font-accent text-text-secondary italic font-semibold max-w-lg mx-auto tracking-wide">
              "Truth dissolves within illusion.<br/>Through devotion, Sita is revealed."
            </p>
          </div>
        </div>
      </section>

      {/* Chapter 3: The Chamber (Multiplayer Lobby) */}
      <section className="relative py-32 px-4 bg-gradient-to-b from-sacred-ivory via-soft-sand/30 to-sacred-ivory border-t border-heritage-gold/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-samarkan text-gold-embossed mb-4">Enter the Chamber</h2>
            <p className="text-text-secondary font-accent uppercase tracking-[0.2em] font-bold">The Epic Awaits</p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 flex justify-center gap-4 relative">
               <div className="absolute inset-0 bg-heritage-gold/15 blur-[80px] rounded-full pointer-events-none" />
               <div className="relative z-10">
                 <CharacterCard name="Ramudu" role="The Seeker" image="/images/characters/ramudu.png" isHidden={false} />
               </div>
               <div className="mt-24 relative z-10">
                 <CharacterCard name="Sita" role="The Hidden One" image="/images/characters/sita.png" isHidden={false} />
               </div>
            </div>
            <div className="order-1 lg:order-2">
              <RoomLobby />
            </div>
          </div>
        </div>
      </section>
      
    </main>
  );
}
