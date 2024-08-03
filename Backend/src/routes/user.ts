import { Router, Request, Response, NextFunction } from "express";
import { PrismaClient, User, RefreshToken } from "@prisma/client";
import { body, param, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserDto } from "../../types/User";
import { sendEmail } from "../services/emailSerice";

const prisma = new PrismaClient({ log: ["query"] });

const router = Router();

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
 *     User:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *         password:
 *           type: string
 *         avatarUri:
 *           type: string
 *       required:
 *         - email
 *         - password
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Retrieve a list of users
 *     tags:
 *     - users
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get("/users", authenticateToken, async (req: Request, res: Response) => {
  const users: UserDto[] = await prisma.user.findMany({
    select: {
      email: true,
      avatarUri: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  res.json(users);
});

/**
 * @swagger
 * /users/{email}:
 *   get:
 *     summary: Retrieve a single user
 *     tags:
 *     - users
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A single user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
router.get(
  "/users/:email",
  param("email").isEmail().withMessage("Invalid email format"),
  validate,
  authenticateToken,
  async (req: Request, res: Response) => {
    const { email } = req.params;
    const user: UserDto | null = await prisma.user.findUnique({
      where: { email },
      select: {
        email: true,
        avatarUri: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  },
);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags:
 *     - users
 *     - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: The created user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input
 */
router.post(
  "/users",
  body("email").isEmail().withMessage("Invalid email format"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  validate,
  async (req: Request, res: Response) => {
    const { email, avatarUri = null, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user: User = await prisma.user.create({
      data: { email, avatarUri, password: hashedPassword },
    });
    res.status(201).json({ email: user.email, avatarUri: user.avatarUri });
  },
);

/**
 * @swagger
 * /users/{email}:
 *   put:
 *     summary: Update a user
 *     tags:
 *     - users
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: The updated user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: User not found
 */
router.put(
  "/users/:email",
  param("email").isEmail().withMessage("Invalid email format"),
  body("avatarUri").not().isEmpty().withMessage("Avatar is required"),
  validate,
  authenticateToken,
  async (req: Request, res: Response) => {
    const { email } = req.params;
    const { avatarUri } = req.body;
    try {
      const oldUser: UserDto | null = await prisma.user.findUnique({
        where: { email },
        select: {
          email: true,
          avatarUri: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      if (!oldUser) throw new Error();
      const user: UserDto = await prisma.user.update({
        where: { email },
        data: { avatarUri: avatarUri || oldUser.avatarUri },
      });
      res.json({ email: user.email, avatarUri: user.avatarUri });
    } catch (error) {
      res.status(404).json({ message: "User not found" });
    }
  },
);

/**
 * @swagger
 * /users/{email}:
 *   delete:
 *     summary: Delete a user
 *     tags:
 *     - users
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: No Content
 *       404:
 *         description: User not found
 */
router.delete(
  "/users/:email",
  param("email").isEmail().withMessage("Invalid email format"),
  validate,
  authenticateToken,
  async (req: Request, res: Response) => {
    const { email } = req.params;
    try {
      await prisma.user.delete({ where: { email } });
      res.sendStatus(204);
    } catch (error) {
      res.status(404).json({ message: "User not found" });
    }
  },
);

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login a user
 *     tags:
 *     - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       400:
 *         description: Invalid credentials
 */
router.post(
  "/login",
  body("email").isEmail().withMessage("Invalid email format"),
  body("password").not().isEmpty().withMessage("Password is required"),
  validate,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user: User | null = await prisma.user.findUnique({
      where: { email },
    });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const accessToken = jwt.sign({ email: user.email }, ACCESS_TOKEN_SECRET, {
      expiresIn: "15m",
    });
    const refreshToken = jwt.sign({ email: user.email }, REFRESH_TOKEN_SECRET);
    await prisma.refreshToken.create({
      data: { token: refreshToken, email: user.email },
    });
    res.json({ accessToken, refreshToken });
  },
);

/**
 * @swagger
 * /logout:
 *   post:
 *     summary: Logout a user
 *     tags:
 *     - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *             required:
 *               - token
 *     responses:
 *       204:
 *         description: Logout successful
 *       400:
 *         description: Invalid request
 */
router.post("/logout", async (req: Request, res: Response) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ message: "Token is required" });
  await prisma.refreshToken.delete({ where: { token } });
  res.sendStatus(204);
});

/**
 * @swagger
 * /refresh:
 *   post:
 *     summary: Refresh access token
 *     tags:
 *     - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *             required:
 *               - token
 *     responses:
 *       200:
 *         description: Access token refreshed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *       403:
 *         description: Invalid or expired refresh token
 */
router.post("/refresh", async (req: Request, res: Response) => {
  
  const { token } = req.body;
  if (!token) return res.status(400).json({ message: "Token is required" });

  const storedToken = await prisma.refreshToken.findUnique({
    where: { token },
  });
  if (!storedToken) return res.sendStatus(403);

  jwt.verify(token, REFRESH_TOKEN_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    const accessToken = jwt.sign(
      { email: (user as any).email },
      ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" },
    );
    res.json({ accessToken });
  });
});

/**
 * @swagger
 * /change-password:
 *   post:
 *     summary: Change the password using email, old password, and new password
 *     tags:
 *     - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *             required:
 *               - email
 *               - oldPassword
 *               - newPassword
 *     responses:
 *       200:
 *         description: Password change successful
 *       400:
 *         description: Invalid input or credentials
 *       404:
 *         description: User not found
 */
router.post(
  "/change-password",
  body("email").isEmail().withMessage("Invalid email format"),
  body("oldPassword").not().isEmpty().withMessage("Old password is required"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long"),
  validate,
  async (req: Request, res: Response) => {
    const { email, oldPassword, newPassword } = req.body;

    const user: User | null = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      return res.status(400).json({ message: "Invalid old password" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email },
      data: { password: hashedNewPassword },
    });

    res.json({ message: "Password change successful" });
  },
);

/**
 * @swagger
 * /check-auth:
 *   get:
 *     summary: Check if the user is authenticated
 *     tags:
 *     - Authentication
 *     responses:
 *       200:
 *         description: User is authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email:
 *                   type: string
 *       401:
 *         description: Unauthorized
 */
router.get("/check-auth", authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user;
  res.json({ email: user.email });
});
/**
 * @swagger
 * components:
 *   schemas:
 *     ForgotPasswordRequest:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           description: The user's email
 *       example:
 *         email: user@example.com
 */

/**
 * @swagger
 * /forgot-password:
 *   post:
 *     summary: Request a password reset
 *     tags: 
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgotPasswordRequest'
 *     responses:
 *       200:
 *         description: Password reset email sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password reset email sent
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 */
router.post(
  "/forgot-password",
  body("email").isEmail().withMessage("Invalid email format"),
  validate,
  async (req: Request, res: Response) => {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = jwt.sign({ email: user.email }, ACCESS_TOKEN_SECRET, {
      expiresIn: "1h",
    });

    // Store the token in the database (optional)
    await prisma.resetToken.create({
      data: {
        token,
        email: user.email,
        createdAt: new Date(),
      },
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    // Send email
    await sendEmail(user.email, "Password Reset", `Click here to reset your password: ${resetLink}`);

    res.json({ message: "Password reset email sent" });
  },
);

/**
 * @swagger
 * components:
 *   schemas:
 *     ResetPasswordRequest:
 *       type: object
 *       required:
 *         - token
 *         - newPassword
 *       properties:
 *         token:
 *           type: string
 *           description: The password reset token
 *         newPassword:
 *           type: string
 *           description: The new password
 *           minLength: 6
 *       example:
 *         token: some.jwt.token
 *         newPassword: newpassword123
 */

/**
 * @swagger
 * /reset-password:
 *   post:
 *     summary: Reset the password using the token
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordRequest'
 *     responses:
 *       200:
 *         description: Password reset successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password reset successful
 *       400:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid or expired token
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 */
router.post(
  "/reset-password",
  body("token").not().isEmpty().withMessage("Token is required"),
  body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters long"),
  validate,
  async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;

    let email: string;
    try {
      const payload = jwt.verify(token, ACCESS_TOKEN_SECRET) as { email: string };
      email = payload.email;
    } catch (err) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email },
      data: { password: hashedNewPassword },
    });

    res.json({ message: "Password reset successful" });
  },
);



export default router;
