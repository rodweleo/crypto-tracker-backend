import express from "express";
import { buyCryptoRoute, fetchStoredLiveCryptoPricesRoute } from "../controllers/CryptoController";

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
 */

router.post("/buy", buyCryptoRoute);
router.get("/live-prices", fetchStoredLiveCryptoPricesRoute);

export default router;
