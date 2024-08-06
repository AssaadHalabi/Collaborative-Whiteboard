import express, { NextFunction, Request, Response } from 'express';
import { createCheckoutSession } from '../services/stripeService';
import Stripe from 'stripe';
import jwt from "jsonwebtoken";
import { body, param, validationResult } from "express-validator";
import { convertUnixToDate } from '../utils/convertUnixToDate';
import { isSubscriptionValid } from '../utils/isSubscriptionValid';
import { PrismaClient, SubscriptionStatus, SubscriptionType } from '@prisma/client';

const prisma = new PrismaClient({ log: ["query"] });

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_TEST_SECRET_KEY as string);
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
 *     CheckoutSession:
 *       type: object
 *       required:
 *         - priceId
 *       properties:
 *         priceId:
 *           type: string
 *           description: The price ID of the product
 */

/**
 * @swagger
 * /create-checkout-session:
 *   post:
 *     summary: Create a checkout session
 *     tags: [payment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CheckoutSession'
 *     responses:
 *       200:
 *         description: Checkout session created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sessionId:
 *                   type: string
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/create-checkout-session',
  body("priceId").not().isEmpty().withMessage("stripe product priceId is required"),
  authenticateToken, validate, async (req: Request, res: Response) => {
    const user = (req as any).user;
    try {  
      const session = await createCheckoutSession(req.body.priceId, user.email);
      res.json({ sessionId: session.id });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

// router.post('/create-subscription', async (req: Request, res: Response) => {
//     const { email, paymentMethodId, priceId } = req.body;
//     try {
//         const subscription = await createSubscription(email, paymentMethodId, priceId);
//         res.json(subscription);
//     } catch (error) {
//         res.status(400).json({ error: (error as Error).message });
//     }
// });
/**
 * @swagger
 * /webhooks/stripe:
 *   post:
 *     summary: Handle Stripe webhooks
 *     tags: [payment]
 *     responses:
 *       200:
 *         description: Webhook handled
 *       400:
 *         description: Webhook error
 */
router.post('/webhooks/stripe', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];

  let event: Stripe.Event;
  try {
      event = stripe.webhooks.constructEvent(req.body, sig as string, process.env.STRIPE_WEBHOOK_SECRET || '');
  } catch (err) {
      console.log((err as Error).message);
      return res.status(400).send(`Webhook Error: ${(err as Error).message}`);
  }

  const session = event.data.object as Stripe.Checkout.Session;
  console.log(event.data.object);
  if (event.type === 'checkout.session.completed') {
      try {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          console.log("hooooray webhooks");
          console.log(subscription.id);
          console.log(JSON.stringify(subscription, null, 2));

          await prisma.subscription.upsert({
              where: {
                  stripeId: subscription.id,
              },
              update: {
                  type: 'PREMIUM',
                  status: 'ACTIVE',
                  user: { connect: { email: session.customer_email! } },
              },
              create: {
                  type: 'PREMIUM',
                  status: 'ACTIVE',
                  stripeId: subscription.id,
                  user: { connect: { email: session.customer_email! } },
              },
          });

          res.status(200).send(subscription);
      } catch (error) {
          res.status(500).send(`Failed to save subscription: ${(error as Error).message}`);
      }
  } else {
      res.status(200).send('Unhandled event type');
  }
});


export default router;
