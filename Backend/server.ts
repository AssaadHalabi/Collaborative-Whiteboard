import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { PrismaClient, Drawing, Image, User, Board } from '@prisma/client';

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

// REST API Routes
// User routes
app.get('/users', async (req: Request, res: Response) => {
  const users: User[] = await prisma.user.findMany();
  res.json(users);
});

app.get('/users/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const user: User | null = await prisma.user.findUnique({ where: { id } });
  res.json(user);
});

app.post('/users', async (req: Request, res: Response) => {
  const { name, email } = req.body;
  const user: User = await prisma.user.create({ data: { name, email } });
  res.json(user);
});

app.put('/users/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email } = req.body;
  const user: User = await prisma.user.update({
    where: { id },
    data: { name, email }
  });
  res.json(user);
});

app.delete('/users/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.user.delete({ where: { id } });
  res.sendStatus(204);
});

// Board routes
app.get('/boards', async (req: Request, res: Response) => {
  const boards: Board[] = await prisma.board.findMany();
  res.json(boards);
});

app.get('/boards/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const board: Board | null = await prisma.board.findUnique({ where: { id: Number(id) } });
  res.json(board);
});

app.post('/boards', async (req: Request, res: Response) => {
  const { title, userIds } = req.body;
  const board: Board = await prisma.board.create({
    data: {
      title,
      users: { connect: userIds.map((id: string) => ({ id })) }
    }
  });
  res.json(board);
});

app.put('/boards/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, userIds } = req.body;
  const board: Board = await prisma.board.update({
    where: { id: Number(id) },
    data: {
      title,
      users: { set: userIds.map((id: string) => ({ id })) }
    }
  });
  res.json(board);
});

app.delete('/boards/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.board.delete({ where: { id: Number(id) } });
  res.sendStatus(204);
});

// Drawing routes
app.get('/drawings', async (req: Request, res: Response) => {
  const drawings: Drawing[] = await prisma.drawing.findMany();
  res.json(drawings);
});

app.get('/drawings/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const drawing: Drawing | null = await prisma.drawing.findUnique({ where: { id: Number(id) } });
  res.json(drawing);
});

app.post('/drawings', async (req: Request, res: Response) => {
  const { userId, boardId, type, data } = req.body;
  const drawing: Drawing = await prisma.drawing.create({
    data: {
      userId,
      boardId,
      type,
      data
    }
  });
  res.json(drawing);
});

app.put('/drawings/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId, boardId, type, data } = req.body;
  const board: Board | null = await prisma.board.findUnique({ where: { id: Number(boardId) } });
  if(!board) res.status(404).json(`Board ${boardId} doesn't exist`);
  const drawing: Drawing = await prisma.drawing.update({
    where: { id: Number(id) },
    data: { userId, boardId, type, data }
  });

  // Notify clients via WebSocket
  io.emit('drawingUpdated', drawing);

  res.json(drawing);
});

app.delete('/drawings/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.drawing.delete({ where: { id: Number(id) } });
  res.sendStatus(204);
});

// Image routes
app.get('/images', async (req: Request, res: Response) => {
  const images: Image[] = await prisma.image.findMany();
  res.json(images);
});

app.get('/images/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const image: Image | null = await prisma.image.findUnique({ where: { id } });
  res.json(image);
});

app.post('/images', async (req: Request, res: Response) => {
  const { userId, boardId, url, position } = req.body;
  const image: Image = await prisma.image.create({
    data: {
      userId,
      boardId,
      url,
      position
    }
  });
  res.json(image);
});

app.put('/images/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId, boardId, url, position } = req.body;
  const image: Image = await prisma.image.update({
    where: { id },
    data: { userId, boardId, url, position }
  });

  // Notify clients via WebSocket
  io.emit('imageUpdated', image);

  res.json(image);
});

app.delete('/images/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.image.delete({ where: { id } });
  res.sendStatus(204);
});

const port = process.env.PORT || 4000;
server.listen(port, () => console.log(`Listening on port ${port}`));
