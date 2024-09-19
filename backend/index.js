const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // Allow your frontend domain
    methods: ['GET', 'POST'],
  },
});

app.use(cors());

app.get('/', (req, res) => {
  res.send('Server is running');
});

io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle joining a room
  socket.on('joinRoom', (roomID) => {
    console.log(`User joined room: ${roomID}`);
    socket.join(roomID);
  });

  // Receive transcript and broadcast it to others in the room
  socket.on('sendTranscript', (data) => {
    console.log('Transcript received:', data.transcript);
    io.to(data.roomID).emit('receiveTranscript', data); // Send transcript to everyone in the room
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(5000, () => {
  console.log('Server is running on port 5000');
});
