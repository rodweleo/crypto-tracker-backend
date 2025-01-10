
import express from 'express';
const portfolioController = require('../controllers/PortfolioController');

const router = express.Router();

// POST /portfolios - Create a new user
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
 * /api/portfolios:
 *   get:
 *     summary: Fetch all portfolios
 *     tags: [Portfolios]
 *     responses:
 *       200:
 *         description: The list of all registered portfolios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Portfolio'
 */

/**
 * @swagger
 * /api/portfolios/create:
 *   post:
 *     summary: Create a new user portfolio
 *     tags: [Portfolios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Portfolio'
 *     responses:
 *       201:
 *         description: The user's portfolio was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Portfolio'
 */

router.post('/create', portfolioController.createUserPortfolioRoute);
router.get('/', portfolioController.getAllPortfoliosRoute);
router.get('/insights', portfolioController.getAllPortfoliosRoute);

export default router