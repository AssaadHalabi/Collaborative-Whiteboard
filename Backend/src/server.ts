import express, { Request, Response } from "express";
import { createServer } from "http";
import cors from "cors";
import { PrismaClient, User, Room } from "@prisma/client";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import userRoutes from "./routes/user";
import roomRoutes from "./routes/room";
import subscriptionRoutes from "./routes/subscription";
import paymentRoutes from './routes/payment';

const prisma = new PrismaClient({ log: ["query"] });
const app = express();
app.use(cors());
// app.use(express.json());
// Use JSON parser for all non-webhook routes
app.use(
  (
    req,
    res,
    next
  ) => {
    if (req.originalUrl === '/api/payment/webhooks/stripe') {
      next();
    } else {
      express.json()(req, res, next);
    }
  }
);
const server = createServer(app);

// Swagger set up
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Express API with Swagger",
      version: "1.0.0",
    },
    servers: [
      {
        url: "/api",
        description: "API server",
      },
    ],
  },
  apis: ["./src/routes/*.ts"], // files containing annotations as above
};

const swaggerSpec = swaggerJsdoc(options);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// REST API Routes
app.use("/api", userRoutes);
app.use("/api", roomRoutes);
app.use("/api", subscriptionRoutes);
app.use("/api", paymentRoutes);

const port = process.env.PORT || 4000;
server.listen(port, () => console.log(`Listening on port ${port}`));
