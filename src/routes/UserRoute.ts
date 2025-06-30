import express from "express";
import {
  createUserRoute,
  getAllUsersRoute,
  getUserByEmailRoute,
} from "../controllers/UserController";

const router = express.Router();

// POST /users - Create a new user
/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the user
 *         name:
 *           type: string
 *           description: The user's name
 *         email:
 *           type: string
 *           description: The user's email
 *       required:
 *         - name
 *         - email
 *       example:
 *         name: John Doe
 *         email: john.doe@example.com
 */

/**
 * @swagger
 * /api/users/create:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: The user was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */

/**
 * @swagger
 * /api/users/{email}:
 *   get:
 *     summary: Fetch user by email
 *     tags: [Users]
 *     requestBody:
 *       required: false
 *     responses:
 *       200:
 *         description: The user details were fetched successfully
 */

router.get("/", getAllUsersRoute);
router.post("/create", createUserRoute);
router.get("/:email", getUserByEmailRoute);

export default router;
