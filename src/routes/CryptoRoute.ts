
const express = require('express');
const cryptoController = require('../controllers/CryptoController');

const router = express.Router();


/**
 * @swagger
 * /api/crypto/live-prices:
 *   get:
 *     summary: Fetch live crypto prices
 *     tags: [Crypto Prices]
 *     responses:
 *       200:
 *         description: The list of all live crypto prices
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Coin'
 */

// router.post('/', cryptoController.fetchAndStoreCryptoPricesRoute);
router.get("/live-prices", cryptoController.fetchStoredLiveCryptoPricesRoute)


export default router;