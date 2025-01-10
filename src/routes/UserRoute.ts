
import express from 'express';
const userController = require('../controllers/UserController');

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
 *         id: d5fE_asz
 *         name: John Doe
 *         email: john.doe@example.com
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Fetch all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: The list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
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

router.post('/create', userController.createUserRoute);
router.get('/', userController.getUsersRoute);

export default router