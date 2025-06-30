import { Request, Response } from "express";
import CryptoService from "../services/CryptoService";

const cryptoService = new CryptoService();

async function fetchStoredLiveCryptoPricesRoute(req: Request, res: Response) {
  const result = await cryptoService.fetchStoredLiveCryptoPrices();

  res.status(200).json(result);
}

async function buyCryptoRoute(req: Request, res: Response) {
  const cryptoService = new CryptoService();
  const result = await cryptoService.buyCrypto(req);

  if (result) {
    res.status(200).json(result);
  } else {
    res.status(400).json({ error: "Failed to buy crypto" });
  }
}

export { fetchStoredLiveCryptoPricesRoute, buyCryptoRoute};
