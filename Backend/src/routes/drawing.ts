import { Router, Request, Response } from 'express';
import { PrismaClient, Drawing, Board } from '@prisma/client';
import { Server } from 'socket.io';

const prisma = new PrismaClient();

export default (io: Server) => {
  const router = Router();

  /**
   * @swagger
   * components:
   *   schemas:
   *     Drawing:
   *       type: object
   *       properties:
   *         id:
   *           type: integer
   *         userId:
   *           type: string
   *         boardId:
   *           type: integer
   *         type:
   *           type: string
   *         data:
   *           type: object
   *         createdAt:
   *           type: string
   *           format: date-time
   *         updatedAt:
   *           type: string
   *           format: date-time
   *       required:
   *         - userId
   *         - boardId
   *         - type
   *         - data
   */

  /**
   * @swagger
   * /drawings:
   *   get:
   *     summary: Retrieve a list of drawings
   *     responses:
   *       200:
   *         description: A list of drawings
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Drawing'
   */
  router.get('/drawings', async (req: Request, res: Response) => {
    const drawings: Drawing[] = await prisma.drawing.findMany();
    res.json(drawings);
  });

  /**
   * @swagger
   * /drawings/{id}:
   *   get:
   *     summary: Retrieve a single drawing
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: A single drawing
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Drawing'
   */
  router.get('/drawings/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const drawing: Drawing | null = await prisma.drawing.findUnique({ where: { id: Number(id) } });
    res.json(drawing);
  });

  /**
   * @swagger
   * /drawings:
   *   post:
   *     summary: Create a new drawing
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/Drawing'
   *     responses:
   *       201:
   *         description: The created drawing
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Drawing'
   */
  router.post('/drawings', async (req: Request, res: Response) => {
    const { userId, boardId, type, data } = req.body;
    const drawing: Drawing = await prisma.drawing.create({
      data: {
        userId,
        boardId,
        type,
        data
      }
    });
    res.status(201).json(drawing);
  });

  /**
   * @swagger
   * /drawings/{id}:
   *   put:
   *     summary: Update a drawing
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/Drawing'
   *     responses:
   *       200:
   *         description: The updated drawing
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Drawing'
   */
  router.put('/drawings/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { userId, boardId, type, data } = req.body;
    const board: Board | null = await prisma.board.findUnique({ where: { id: Number(boardId) } });
    if (!board) return res.status(404).json(`Board ${boardId} doesn't exist`);

    const drawing: Drawing = await prisma.drawing.update({
      where: { id: Number(id) },
      data: { userId, boardId, type, data }
    });

    // Notify clients via WebSocket
    io.emit('drawingUpdated', drawing);

    res.json(drawing);
  });

  /**
   * @swagger
   * /drawings/{id}:
   *   delete:
   *     summary: Delete a drawing
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       204:
   *         description: No Content
   */
  router.delete('/drawings/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    await prisma.drawing.delete({ where: { id: Number(id) } });
    res.sendStatus(204);
  });

  return router;
};
