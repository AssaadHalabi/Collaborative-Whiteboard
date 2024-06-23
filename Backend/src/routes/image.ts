import { Router, Request, Response } from 'express';
import { PrismaClient, Image } from '@prisma/client';
import { Server } from 'socket.io';

const prisma = new PrismaClient();

export default (io: Server) => {
  const router = Router();

  /**
   * @swagger
   * components:
   *   schemas:
   *     Image:
   *       type: object
   *       properties:
   *         id:
   *           type: string
   *         userId:
   *           type: string
   *         boardId:
   *           type: integer
   *         url:
   *           type: string
   *         position:
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
   *         - url
   *         - position
   */

  /**
   * @swagger
   * /images:
   *   get:
   *     summary: Retrieve a list of images
   *     responses:
   *       200:
   *         description: A list of images
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Image'
   */
  router.get('/images', async (req: Request, res: Response) => {
    const images: Image[] = await prisma.image.findMany();
    res.json(images);
  });

  /**
   * @swagger
   * /images/{id}:
   *   get:
   *     summary: Retrieve a single image
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: A single image
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Image'
   */
  router.get('/images/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const image: Image | null = await prisma.image.findUnique({ where: { id } });
    res.json(image);
  });

  /**
   * @swagger
   * /images:
   *   post:
   *     summary: Create a new image
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/Image'
   *     responses:
   *       201:
   *         description: The created image
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Image'
   */
  router.post('/images', async (req: Request, res: Response) => {
    const { userId, boardId, url, position } = req.body;
    const image: Image = await prisma.image.create({
      data: {
        userId,
        boardId,
        url,
        position
      }
    });
    res.status(201).json(image);
  });

  /**
   * @swagger
   * /images/{id}:
   *   put:
   *     summary: Update an image
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/Image'
   *     responses:
   *       200:
   *         description: The updated image
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Image'
   */
  router.put('/images/:id', async (req: Request, res: Response) => {
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

  /**
   * @swagger
   * /images/{id}:
   *   delete:
   *     summary: Delete an image
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       204:
   *         description: No Content
   */
  router.delete('/images/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    await prisma.image.delete({ where: { id } });
    res.sendStatus(204);
  });

  return router;
};
