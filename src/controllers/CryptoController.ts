import { Request, Response } from "express";
import CryptoService from "../services/CryptoService";
import { addPurchaseToQueue } from "../utils/bullmq/queues";
import logger from "../utils/logger";
import { v4 as uuidv4 } from "uuid";

const cryptoService = new CryptoService();

async function fetchStoredLiveCryptoPricesRoute(req: Request, res: Response) {
  const result = await cryptoService.fetchStoredLiveCryptoPrices();

  res.status(200).json(result);
}

async function buyCryptoRoute(req: Request, res: Response): Promise<any> {
  const { user_id, coin_id, quantity, purchase_price } = req.body;

  logger.info(
    `Received purchase request: user_id=${user_id}, coin_id=${coin_id}, quantity=${quantity}, purchase_price=${purchase_price}`
  );

  const job_id = `P${user_id}${coin_id}${Date.now()}`;
  await addPurchaseToQueue(job_id, user_id, coin_id, quantity, purchase_price);

  return res.status(202).json({ message: "Purchase request queued" });
}

export { fetchStoredLiveCryptoPricesRoute, buyCryptoRoute };
