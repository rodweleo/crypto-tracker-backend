import { Request, Response } from "express";

const cryptoService = require('../services/CryptoService');



async function fetchStoredLiveCryptoPricesRoute(req: Request, res: Response) {
    const result = await cryptoService.fetchStoredLiveCryptoPrices();

    res.status(200).json(result);
}


module.exports = {
    fetchStoredLiveCryptoPricesRoute
};