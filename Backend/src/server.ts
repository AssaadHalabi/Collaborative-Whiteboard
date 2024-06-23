import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { PrismaClient, User, Board } from '@prisma/client';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import userRoutes from './routes/user';
import drawingRoutes from './routes/drawing';
import boardRoutes from './routes/board';
import imageRoutes from './routes/image';

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

let lines: any[] = [];

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

// Swagger set up
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Express API with Swagger',
      version: '1.0.0',
    },
    servers: [
      {
        url: '/api',
        description: 'API server'
      }
    ]
  },
  apis: ['./src/routes/*.ts'], // files containing annotations as above
};

const swaggerSpec = swaggerJsdoc(options);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// REST API Routes
app.use('/api', userRoutes);
app.use('/api', drawingRoutes(io));
app.use('/api', boardRoutes);
app.use('/api', imageRoutes(io));

const port = process.env.PORT || 4000;
server.listen(port, () => console.log(`Listening on port ${port}`));
