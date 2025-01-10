
import express from 'express';
const portfolioController = require('../controllers/PortfolioController');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateCoinInPortfolio:
 *       type: object
 *       properties:
 *         coin:
 *           type: string
 *           description: The name of the coin to be updated
 *         quantity:
 *           type: number
 *           description: The quantity of the coin to be updated
 *         purchase_price:
 *           type: number
 *           description: The purchase price of the coin to be updated
 *       required:
 *         - coin
 *         - quantity
 *         - purchase_price
 *       example:
 *         coin: Bitcoin
 *         quantity: 2
 *         purchase_price: 94329
 */


/**
 * @swagger
 * /api/portfolios/insights/{id}:
 *   post:
 *     summary: Fetch a user's portfolio details using the user id
 *     tags: [Portfolios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *     responses:
 *       201:
 *         description: The user's portfolio was successfully created
 *         content:
 *           application/json:
 */

/**
 * @swagger
 * /api/portfolios/{portfolioId}/coins/{coinName}:
 *   delete:
 *     summary: Delete a coin from a user's portfolio
 *     description: Deletes a coin by its ID from the user's portfolio.
 *     parameters:
 *       - in: path
 *         name: portfolioId
 *         required: true
 *         schema:
 *          type: string
 *         description: The user's portfolio ID
 *       - in: path
 *         name: coinName
 *         required: true
 *         schema:
 *          type: string
 *          description: The name of the coin to delete
 *     tags: [Portfolios]
 *     responses:
 *       201:
 *         description: The coin was successfully deleted from the user's portfolio
 *         content:
 *           application/json:
 */

/**
 * @swagger
 * /api/portfolios/{portfolioId}:
 *   get:
 *     summary: Retrieve a user's portfolio by portfolio ID
 *     description: Retrieve a user's portfolio by its ID.
 *     parameters:
 *       - in: path
 *         name: portfolioId
 *         required: true
 *         schema:
 *          type: string
 *         description: The user's portfolio ID
 *     tags: [Portfolios]
 *     responses:
 *       201:
 *         description: The portfolio details were successfully deleted from the user's portfolio
 *         content:
 *           application/json:
 *             
 */


/**
 * @swagger
 * /api/portfolios/{portfolioId}/coins:
 *   put:
 *     summary: Update a coin in a user's portfolio
 *     description: Updates a coin by its name in the user's portfolio.
 *     requestBody:
 *      required: true
 *      content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCoinInPortfolio'
 *     parameters:
 *       - in: path
 *         name: portfolioId
 *         required: true
 *         schema:
 *          type: string
 *         description: The user's portfolio id
 * 
 *     tags: [Portfolios]
 *     responses:
 *       200:
 *         description: The coin details have been updated.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UpdateCoinInPortfolio'
 */

router.post('/create', portfolioController.createUserPortfolioRoute);
router.get('/', portfolioController.getAllPortfoliosRoute);
router.get('/insights', portfolioController.getAllPortfoliosRoute);
router.get('/insights/:id', portfolioController.fetchUserPortfolioInsightsRoute);
router.get('/:portfolioId', portfolioController.fetchPortfolioDetailsRoute);
router.put('/:portfolioId/coins', portfolioController.updateCoinInPortfolioRoute);
router.delete('/:portfolioId/coins/:coinName', portfolioController.deleteCoinFromUserPortfolioRoute);

export default router