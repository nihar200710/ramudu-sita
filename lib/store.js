import { create } from 'zustand';

export const useGameStore = create((set) => ({
  socket: null,
  setSocket: (socket) => set({ socket }),
  roomId: null,
  setRoomId: (roomId) => set({ roomId }),
  players: [],
  setPlayers: (players) => set({ players }),
  playerName: '',
  setPlayerName: (playerName) => set({ playerName }),
  gameStatus: 'lobby', // lobby, playing, finished
  setGameStatus: (status) => set({ gameStatus: status }),
  role: null,
  setRole: (role) => set({ role }),
  gameOverData: null,
  setGameOverData: (data) => set({ gameOverData: data }),
}));
