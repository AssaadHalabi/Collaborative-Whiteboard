import { Router, Request, Response, NextFunction } from "express";
import { PrismaClient, Room, UserRoom } from "@prisma/client";
import { body, param, validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import Stripe from "stripe";

const prisma = new PrismaClient({ log: ["query"] });

const router = Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

const ACCESS_TOKEN_SECRET =
  process.env.ACCESS_TOKEN_SECRET || "youraccesstokensecret";
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "yourrefreshtokensecret";

if (ACCESS_TOKEN_SECRET === "youraccesstokensecret")
  throw new Error("ACCESS_TOKEN_SECRET is not set");
if (REFRESH_TOKEN_SECRET === "yourrefreshtokensecret")
  throw new Error("REFRESH_TOKEN_SECRET is not set");

// Middleware to authenticate the access token
function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    (req as any).user = user;
    next();
  });
}

// Error handling middleware
const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateRoomRequest:
 *       type: object
 *       required:
 *         - id
 *         - userName
 *       properties:
 *         id:
 *           type: string
 *         userName:
 *           type: string
 *     Room:
 *       type: object
 *       required:
 *         - id
 *         - ownerEmail
 *       properties:
 *         id:
 *           type: string
 *         users:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/UserRoom'
 *         ownerEmail:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     UserRoom:
 *       type: object
 *       required:
 *         - id
 *         - userEmail
 *         - roomId
 *         - userName
 *       properties:
 *         id:
 *           type: string
 *         userEmail:
 *           type: string
 *         roomId:
 *           type: string
 *         userName:
 *           type: string
 */

/**
 * @swagger
 * /rooms:
 *   get:
 *     summary: Retrieve a list of rooms
 *     tags:
 *     - rooms
 *     responses:
 *       200:
 *         description: A list of rooms
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Room'
 */
router.get("/rooms", authenticateToken, async (req: Request, res: Response) => {
  try {
    const rooms: Room[] = await prisma.room.findMany({
      include: {
        users: {
          include: {
            user: true,
          },
        },
      },
    });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /rooms/{id}:
 *   get:
 *     summary: Retrieve a single room
 *     tags:
 *     - rooms
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A single room
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Room'
 *       404:
 *         description: Room not found
 */
router.get(
  "/rooms/:id",
  param("id").not().isEmpty().withMessage("Room ID is required"),
  validate,
  authenticateToken,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const room: Room | null = await prisma.room.findUnique({
        where: { id },
        include: {
          users: {
            include: {
              user: true,
            },
          },
        },
      });
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }
      res.json(room);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

/**
 * @swagger
 * /owned_rooms:
 *   get:
 *     summary: Retrieve rooms a user owns
 *     tags:
 *     - rooms
 *     responses:
 *       200:
 *         description: Rooms a user owns
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Room'
 *       404:
 *         description: Room not found
 */
router.get(
  "/owned_rooms",
  validate,
  authenticateToken,
  async (req: Request, res: Response) => {
    const user = (req as any).user;
    try {
      const rooms: Room[] | null = await prisma.room.findMany({
        where: { ownerEmail: user.email },
        include: {
          users: {
            include: {
              user: true,
            },
          },
        },
      });

      res.json(rooms);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

/**
 * @swagger
 * /joined_rooms:
 *   get:
 *     summary: Retrieve rooms a user joined
 *     tags:
 *     - rooms
 *     responses:
 *       200:
 *         description: Rooms a user joined
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Room'
 *       404:
 *         description: Room not found
 */
router.get(
  "/joined_rooms",
  validate,
  authenticateToken,
  async (req: Request, res: Response) => {
    const user = (req as any).user;
    console.log("user");
    console.log(user);
    
    try {
      const rooms = await prisma.room.findMany({
        where: {
          users: {
            some: {
              userEmail: user.email
            }
          }
        },
        include: {
          users: true
        }
      });

      res.json(rooms);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

/**
 * @swagger
 * /rooms/{id}/users:
 *   get:
 *     summary: Retrieve active users in a single room
 *     tags:
 *     - rooms
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Active users in a single room
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserRoom'
 *       404:
 *         description: Room not found
 */
router.get(
  "/rooms/:id/users",
  param("id").not().isEmpty().withMessage("Room ID is required"),
  validate,
  authenticateToken,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const room: Room | null = await prisma.room.findUnique({
        where: { id },
      });
      const userRooms: UserRoom[] | null = await prisma.userRoom.findMany({
        where: { roomId: id },
      });
      
      // const response = await fetch(`https://api.liveblocks.io/v2/rooms/${id}/active_users`, {
      //   method: "GET",
      //   headers: {
      //     'Authorization': `Bearer ${process.env.LIVEBLOCKS_SECRET_KEY!}`,
      //     'Content-Type': 'application/json',
      //   }
      // });
      // console.log(await response.text());
      
      if (!room) {
        return res.status(404).json({ message: `Room ID ${id} not found` });
      }
      res.json(userRooms);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

/**
 * @swagger
 * /rooms:
 *   post:
 *     summary: Create a new room
 *     tags:
 *     - rooms
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRoomRequest'
 *     responses:
 *       201:
 *         description: The created room
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Room'
 *       400:
 *         description: Invalid input
 *       412:
 *         description: Precondition Failed
 */
router.post(
  "/rooms",
  body("id").not().isEmpty().withMessage("Room ID is required"),
  body("userName").not().isEmpty().withMessage("User name is required"),
  authenticateToken,
  validate,
  async (req: Request, res: Response) => {
    const { id, userName } = req.body;
    const user = (req as any).user as { email: string };

    try {
      const userData = await prisma.user.findUnique({
        where: { email: user.email },
        include: {
          subscription: true,
        },
      });

      if (!userData) {
        return res.status(404).json({ error: "User not found" });
      }

      const hasActiveSubscription =
        userData.subscription && userData.subscription.status === "ACTIVE";

      const ownedRoomsCount = await prisma.room.count({
        where: { ownerEmail: user.email },
      });

      if (!hasActiveSubscription && ownedRoomsCount >= 2) {
        return res
          .status(412)
          .json({ error: "Non-subscribed users cannot own more than 2 rooms" });
      }

      const room = await prisma.room.create({
        data: {
          id,
          owner: { connect: { email: user.email } },
          users: {
            create: {
              user: { connect: { email: user.email } },
              userName: userName,
            },
          },
        },
        include: {
          users: true,
        },
      });

      res.status(201).json(room);
    } catch (error: any) {
      if (error.code === "P2002" && error.meta?.target?.includes("id")) {
        return res.status(409).json({ error: "Room ID already exists" });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  },
);


/**
 * @swagger
 * /rooms/{id}/join:
 *   post:
 *     summary: Join a room
 *     tags:
 *     - rooms
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
 *             type: object
 *             properties:
 *               userName:
 *                 type: string
 *                 description: The custom username to use in the room
 *     responses:
 *       200:
 *         description: The user joined the room
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Room not found
 */
router.post(
  "/rooms/:id/join",
  param("id").not().isEmpty().withMessage("Room ID is required"),
  body("userName").not().isEmpty().withMessage("User name is required"),
  validate,
  authenticateToken,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { userName } = req.body;
    const user = (req as any).user as { email: string };

    try {
      const room: Room | null = await prisma.room.findUnique({ where: { id } });
      const response = await fetch(`https://api.liveblocks.io/v2/rooms/${id}`, {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${process.env.LIVEBLOCKS_SECRET_KEY!}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (!room || !response.ok) {
        console.log(room && `DB room found ${id}`)
        console.log(response.ok && `Liveblocks room found ${id}`)
        return res.status(404).json({ message: "Room not found" });
      }

      const userRoom = await prisma.userRoom.upsert({
        where: {
          userEmail_roomId: {
            userEmail: user.email,
            roomId: room.id,
          },
        },
        update: {
          userName: userName,
        },
        create: {
          user: { connect: { email: user.email } },
          room: { connect: { id: room.id } },
          userName: userName,
        },
      });

      res.status(200).json({ message: `User ${userName} joined the room` });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  },
);


// /**
//  * @swagger
//  * /rooms/{id}:
//  *   put:
//  *     summary: Update a room
//  *     tags:
//  *     - rooms
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             $ref: '#/components/schemas/Room'
//  *     responses:
//  *       200:
//  *         description: The updated room
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/Room'
//  *       400:
//  *         description: Invalid input
//  *       404:
//  *         description: Room not found
//  */
// router.put('/rooms/:id',
//   param('id').isUUID().withMessage('Invalid room ID'),
//   body('title').not().isEmpty().withMessage('Title is required'),
//   validate,
//   authenticateToken,
//   async (req: Request, res: Response) => {
//     const { id } = req.params;
//     const { title } = req.body;
//     try {
//       const room: Room = await prisma.room.update({
//         where: { id },
//         data: { title },
//         include: {
//           users: true
//         }
//       });
//       res.json(room);
//     } catch (error) {
//       res.status(404).json({ message: 'Room not found' });
//     }
//   }
// );

/**
 * @swagger
 * /rooms/{id}:
 *   delete:
 *     summary: Delete a room
 *     tags:
 *     - rooms
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: No Content
 *       404:
 *         description: Room not found
 *       403:
 *         description: Forbidden, user is not the owner of the room
 */
router.delete(
  "/rooms/:id",
  param("id").not().isEmpty().withMessage("Room ID is required"),
  validate,
  authenticateToken,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as any).user as { email: string };

    try {
      // Try deleting the room from Liveblocks
      const response = await fetch(`https://api.liveblocks.io/v2/rooms/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${process.env.LIVEBLOCKS_SECRET_KEY!}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok && response.status !== 404) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.text();
      console.log(data);

      // If the Liveblocks deletion was successful, continue with the database deletion
      const room = await prisma.room.findUnique({ where: { id } });

      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }

      if (room.ownerEmail !== user.email) {
        return res.status(403).json({ message: "Forbidden, user is not the owner of the room" });
      }

      // Delete related UserRoom entities
      await prisma.userRoom.deleteMany({
        where: { roomId: id },
      });

      // Delete the room
      await prisma.room.delete({ where: { id } });

      res.sendStatus(204);
    } catch (error) {
      // Ensure that the error response is only sent once
      if (!res.headersSent) {
        if (error instanceof Error) {
          console.error(error);
          res.status(500).json({ message: `Internal server error: ${error.message}` });
        } else {
          res.status(500).json({ message: "Internal server error" });
        }
      }
    }
  },
);

export default router;
