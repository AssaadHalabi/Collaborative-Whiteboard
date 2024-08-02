import { Router, Request, Response, NextFunction } from "express";
import {
  PrismaClient,
  Room,
  Subscription,
  SubscriptionType,
  SubscriptionStatus,
} from "@prisma/client";
import { body, param, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
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
 *     Subscription:
 *       type: object
 *       required:
 *         - stripeId
 *         - userEmail
 *         - type
 *         - status
 *         - createdAt
 *         - updatedAt
 *       properties:
 *         stripeId:
 *           type: string
 *         userEmail:
 *           type: string
 *         type:
 *           type: string
 *           enum: [FREE, PREMIUM]
 *         status:
 *           type: string
 *           enum: [ACTIVE, INACTIVE]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /subscriptions:
 *   post:
 *     summary: Create a new subscription
 *     tags:
 *     - subscriptions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [FREE, PREMIUM]
 *               stripeId:
 *                 type: string
 *             required:
 *               - type
 *               - stripeId
 *     responses:
 *       201:
 *         description: The created subscription
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Subscription'
 *       400:
 *         description: Invalid input
 */
router.post(
  "/subscriptions",
  body("type")
    .isIn(["FREE", "PREMIUM"])
    .withMessage("Invalid subscription type"),
  body("stripeId").not().isEmpty().withMessage("Stripe ID is required"),
  validate,
  authenticateToken,
  async (req: Request, res: Response) => {
    const { type, stripeId } = req.body;
    const user = (req as any).user as { email: string };

    try {
      const subscription = await prisma.subscription.create({
        data: {
          type: type as SubscriptionType,
          status: SubscriptionStatus.ACTIVE,
          stripeId,
          user: { connect: { email: user.email } },
        },
      });
      res.status(201).json(subscription);
    } catch (error) {
      res.status(400).json({ message: "Subscription creation failed" });
    }
  },
);

/**
 * @swagger
 * /subscriptions/{id}:
 *   put:
 *     summary: Update a subscription
 *     tags:
 *     - subscriptions
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
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE]
 *             required:
 *               - status
 *     responses:
 *       200:
 *         description: The updated subscription
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Subscription'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Subscription not found
 */
router.put(
  "/subscriptions/:id",
  param("id").isUUID().withMessage("Invalid subscription ID"),
  body("status")
    .isIn(["ACTIVE", "INACTIVE"])
    .withMessage("Invalid subscription status"),
  validate,
  authenticateToken,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
      const subscription: Subscription = await prisma.subscription.update({
        where: { stripeId: id },
        data: { status: status as SubscriptionStatus },
      });
      res.json(subscription);
    } catch (error) {
      res.status(404).json({ message: "Subscription not found" });
    }
  },
);

export default router;
