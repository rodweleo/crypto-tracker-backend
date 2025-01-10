import { Request, Response } from "express";

const portfolioService = require('../services/PortfolioService');

async function createUserPortfolioRoute(req: Request, res: Response) {
    const result = await portfolioService.createPortfolioEntry(req);
    res.status(200).json(result);
}

// Controller to get all users
async function getAllPortfoliosRoute(req: Request, res: Response) {
    const result = await portfolioService.getAllPortfolios();
    res.status(200).json(result);
}

module.exports = {
    createUserPortfolioRoute,
    getAllPortfoliosRoute,
};