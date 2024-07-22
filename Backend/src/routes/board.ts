import { Router, Request, Response } from 'express';
import { PrismaClient, Board } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Board:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         userIds:
 *           type: array
 *           items:
 *             type: string
 *       required:
 *         - title
 */

/**
 * @swagger
 * /boards:
 *   get:
 *     summary: Retrieve a list of boards
 *     responses:
 *       200:
 *         description: A list of boards
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Board'
 */
router.get('/boards', async (req: Request, res: Response) => {
  const boards: Board[] = await prisma.board.findMany();
  res.json(boards);
});

/**
 * @swagger
 * /boards/{id}:
 *   get:
 *     summary: Retrieve a single board
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A single board
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Board'
 */
router.get('/boards/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const board: Board | null = await prisma.board.findUnique({ where: { id: Number(id) } });
  if(!board) res.status(404).json(`Board with id ${id} doesn't exist`);
  res.json(board);
});

/**
 * @swagger
 * /boards:
 *   post:
 *     summary: Create a new board
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *             required:
 *               - title
 *               - userIds
 *     responses:
 *       201:
 *         description: The created board
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Board'
 */
router.post('/boards', async (req: Request, res: Response) => {
  const { title, userIds } = req.body;
  if (!userIds) {
    return res.status(400).json({ error: 'userIds is required' });
  }
  const board: Board = await prisma.board.create({
    data: {
      title,
      users: { connect: userIds.map((id: string) => ({ id })) }
    }
  });
  res.status(201).json(board);
});

/**
 * @swagger
 * /boards/{id}:
 *   put:
 *     summary: Update a board
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
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: The updated board
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Board'
 */
router.put('/boards/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, userIds } = req.body;

  const existingBoard: Board | null = await prisma.board.findUnique({ where: { id: Number(id) } });

  if (!existingBoard) {
    return res.status(404).json(`Board with id ${id} doesn't exist`);
  }

  const updateData: any = { title };

  if (userIds) {
    updateData.users = { set: userIds.map((id: string) => ({ id })) };
  }

  const board: Board = await prisma.board.update({
    where: { id: Number(id) },
    data: updateData
  });

  res.json(board);
});

/**
 * @swagger
 * /boards/{id}:
 *   delete:
 *     summary: Delete a board
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
router.delete('/boards/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.board.delete({ where: { id: Number(id) } });
  res.sendStatus(204);
});

export default router;
