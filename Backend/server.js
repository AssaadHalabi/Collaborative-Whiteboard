import express from 'express';
import { createServer } from 'http';
import socketIo from 'socket.io';
import cors from 'cors';  // Import the cors middleware

const app = express();
app.use(cors());  // Enable CORS for all routes

const server = createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",  // Allow only the frontend origin
    methods: ["GET", "POST"]
  }
});

let lines = [];

io.on('connection', (socket) => {
  console.log('New client connected');
  socket.emit('drawing', { lines });

  socket.on('drawing', (data) => {
    const { lines: newLines, user } = data;
    console.log(`Received new drawing data from ${user.name} (${user.id}):`, newLines.length);
    lines = newLines;
    socket.broadcast.emit('drawing', { lines });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const port = 4000;
server.listen(port, () => console.log(`Listening on port ${port}`));
