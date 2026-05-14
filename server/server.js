const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3001;

// Basic Game State
const rooms = new Map();

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('create_room', (data) => {
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    rooms.set(roomId, {
      players: [{ id: socket.id, name: data.name, score: 0 }],
      status: 'waiting',
      rolesAssigned: false
    });
    socket.join(roomId);
    socket.emit('room_created', { roomId });
    io.to(roomId).emit('update_players', rooms.get(roomId).players);
  });

  socket.on('join_room', (data) => {
    const { roomId, name } = data;
    const room = rooms.get(roomId);

    if (room) {
      if (room.status !== 'waiting') {
        socket.emit('error', 'Game already started');
        return;
      }
      room.players.push({ id: socket.id, name, score: 0 });
      socket.join(roomId);
      socket.emit('room_joined', { roomId });
      io.to(roomId).emit('update_players', room.players);
    } else {
      socket.emit('error', 'Room not found');
    }
  });

  const startGame = (roomId) => {
    const room = rooms.get(roomId);
    if (room && room.players.length >= 3) {
      room.status = 'playing';
      
      const players = [...room.players];
      for (let i = players.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [players[i], players[j]] = [players[j], players[i]];
      }

      const roles = ['Ramudu', 'Sita', 'Hanuman', 'Lakshmana', 'Bharata', 'Shatrughna', 'Sugriva', 'Vibhishana', 'Ravana', 'Mandodari', 'Indrajit', 'Kaikeyi'];
      
      players.forEach((p, index) => {
        p.role = roles[index] || 'Villager';
        io.to(p.id).emit('role_assigned', { role: p.role });
      });

      room.players = players;
      room.rolesAssigned = true;

      io.to(roomId).emit('game_started');
    } else if (room) {
      io.to(roomId).emit('error', 'Minimum 3 players required to start.');
    }
  };

  socket.on('start_game', (roomId) => {
    startGame(roomId);
  });

  socket.on('guess_sita', (data) => {
    const { roomId, guessedPlayerId } = data;
    const room = rooms.get(roomId);
    if (!room) return;

    const ramudu = room.players.find(p => p.role === 'Ramudu');
    if (socket.id !== ramudu.id) return; // Only Ramudu can guess

    const guessedPlayer = room.players.find(p => p.id === guessedPlayerId);
    let correct = false;

    if (guessedPlayer && guessedPlayer.role === 'Sita') {
      correct = true;
      ramudu.score += 1000;
    } else {
      const sita = room.players.find(p => p.role === 'Sita');
      if (sita) sita.score += 1000;
    }

    const rolePoints = {
      'Hanuman': 900,
      'Lakshmana': 800,
      'Bharata': 700,
      'Shatrughna': 600,
      'Sugriva': 500,
      'Vibhishana': 400,
      'Ravana': 300,
      'Mandodari': 200,
      'Indrajit': 100,
      'Kaikeyi': 50
    };

    room.players.forEach(p => {
      if (p.role !== 'Ramudu' && p.role !== 'Sita') {
        p.score += rolePoints[p.role] || 50;
      }
    });

    room.status = 'finished';
    io.to(roomId).emit('game_over', {
      correct,
      guessedPlayerId,
      players: room.players
    });
    // Sync scores
    io.to(roomId).emit('update_players', room.players);

    // Auto-start next round
    setTimeout(() => {
      const currentRoom = rooms.get(roomId);
      if (currentRoom && currentRoom.status === 'finished') {
        if (currentRoom.players.length >= 3) {
          startGame(roomId);
        } else {
          currentRoom.status = 'waiting';
          io.to(roomId).emit('chamber_returned');
        }
      }
    }, 8000);
  });

  socket.on('return_to_chamber', (roomId) => {
    const room = rooms.get(roomId);
    if (!room) return;
    
    // Only process if coming from a finished state
    if (room.status === 'finished') {
      room.status = 'waiting';
      room.rolesAssigned = false;
      io.to(roomId).emit('chamber_returned');
      io.to(roomId).emit('update_players', room.players);
    }
  });

  socket.on('leave_chamber', (roomId) => {
    const room = rooms.get(roomId);
    if (!room) return;
    
    const index = room.players.findIndex(p => p.id === socket.id);
    if (index !== -1) {
      room.players.splice(index, 1);
      socket.leave(roomId);
      
      if (room.players.length === 0) {
        rooms.delete(roomId);
      } else {
        io.to(roomId).emit('update_players', room.players);
        // If game drops below 3 players during playing, end it
        if (room.players.length < 3 && room.status === 'playing') {
          room.status = 'waiting';
          io.to(roomId).emit('game_over', {
            correct: false,
            guessedPlayerId: null,
            players: room.players,
            message: 'Game ended: Not enough players'
          });
        }
      }
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    // Clean up empty rooms or remove player from room
    for (const [roomId, room] of rooms.entries()) {
      const index = room.players.findIndex(p => p.id === socket.id);
      if (index !== -1) {
        room.players.splice(index, 1);
        if (room.players.length === 0) {
          rooms.delete(roomId);
        } else {
          io.to(roomId).emit('update_players', room.players);
        }
        break;
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`);
});
