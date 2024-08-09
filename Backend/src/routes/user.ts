import { Router, Request, Response, NextFunction } from "express";
import { PrismaClient, User, RefreshToken } from "@prisma/client";
import { body, param, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserDto } from "../../types/User";
import { sendEmail } from "../services/emailSerice";
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { parseS3Uri } from "../utils/parseS3Uri";
import { createS3Uri } from "../utils/createS3Uri";

const prisma = new PrismaClient({ log: ["query"] });

const router = Router();
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});
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
 * components:
 *   schemas:
 *     CreateUser:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *         password:
 *           type: string
 *         avatarImageName:
 *           type: string
 *       required:
 *         - email
 *         - password
 *         - avatarImageName
 *     UpdateUser:
 *       type: object
 *       properties:
 *         avatarImageName:
 *           type: string
 *       required:
 *         - avatarImageName
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
 *       - users
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
    try {
      const user = await prisma.user.findUnique({
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
      let avatarURL = null
      if(user.avatarUri ){
        const command = new GetObjectCommand(parseS3Uri(user.avatarUri)
        );

      avatarURL = await getSignedUrl(s3Client, command, { expiresIn: 604800 });}

      res.json({
        ...user,
        avatarURL,
      });
    } catch (error) {
      res.status(500).json({ message: "An error occurred while retrieving the user" });
    }
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
 *       409:
 *         description: User with email already exists
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
    try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user: User = await prisma.user.create({
      data: { email, avatarUri, password: hashedPassword },
    });
    res.status(201).json({ email: user.email, avatarUri: user.avatarUri });
    } catch (error:any) {
      if (error.code === "P2002" && error.meta?.target?.includes("email")) {
        return res.status(409).json({ message: `User with email ${email} already exists` });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

/**
 * @swagger
 * /generate-upload-url:
 *   post:
 *     summary: Generate a pre-signed URL for uploading an image to S3
 *     tags:
 *       - Upload
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - avatarImageName
 *               - avatarImageType
 *             properties:
 *               avatarImageName:
 *                 type: string
 *                 description: The name of the image to be uploaded
 *               avatarImageType:
 *                 type: string
 *                 description: The MIME type of the image to be uploaded
 *     responses:
 *       200:
 *         description: The pre-signed URL for image upload
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   description: The pre-signed URL
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post(
  '/generate-upload-url',
  body('avatarImageName').not().isEmpty().withMessage('avatarImageName is required'),
  body('avatarImageType').not().isEmpty().withMessage('avatarImageType is required'),
  validate,
  authenticateToken,
  async (req: Request, res: Response) => {
    const { avatarImageName, avatarImageType } = req.body;

    try {
      const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: avatarImageName,
        ContentType: avatarImageType,
      };

      const command = new PutObjectCommand(params);
      const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

      console.log('[INFO_POST_AVATAR_IMAGE_UPLOAD_PRESIGNED_URL] AOA FEATURE UPLOAD URL created successfully');
      return res.status(200).json({ url });
    } catch (error: any) {
      console.error(`[ERROR_POST_AVATAR_IMAGE_UPLOAD_PRESIGNED_URL] ${error.message}`);
      return res.status(500).json({message: error.message});
    }
  }
);

/**
 * @swagger
 * /users/{email}:
 *   put:
 *     summary: Update a user
 *     tags:
 *       - users
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
 *             $ref: '#/components/schemas/UpdateUser'
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
  body("avatarImageName").not().isEmpty().withMessage("avatarImageName is required"),
  validate,
  authenticateToken,
  async (req: Request, res: Response) => {
    const { email } = req.params;
    const { avatarImageName } = req.body;
    const avatarUri = createS3Uri(avatarImageName);
    try {
      const oldUser = await prisma.user.findUnique({
        where: { email },
        select: {
          email: true,
          avatarUri: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      if (!oldUser) {
        return res.status(404).json({ message: "User not found" });
      }
      const user = await prisma.user.update({
        where: { email },
        data: { avatarUri },
      });
      res.json({ email: user.email, avatarUri: user.avatarUri });
    } catch (error) {
      res.status(500).json({ message: "An error occurred while updating the user" });
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

    // Store the token in the database
    await prisma.resetToken.create({
      data: {
        token,
        email: user.email,
        createdAt: new Date(),
      },
    });

    const resetLink = `${process.env.FRONTEND_URL}/authentication/reset-password?token=${token}`;

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
