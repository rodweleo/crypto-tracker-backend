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

async function fetchUserPortfolioInsightsRoute(req: Request, res: Response) {

    const { id } = req.params;

    try {
        const result = await portfolioService.getUserPortfolioInsights(id);
        res.status(200).json(result)
    } catch (error: any) {
        res.status(500).json(error.message)
    }
}

async function deleteCoinFromUserPortfolioRoute(req: Request, res: Response) {

    const { portfolioId, coinName } = req.params;

    const result = await portfolioService.deleteCoinFromUserPortfolio(portfolioId, coinName);

    if (result === null) {
        res.status(500).json("Something went wrong")
    }

    res.status(200).json(result)

}

async function fetchPortfolioDetailsRoute(req: Request, res: Response) {

    const { portfolioId } = req.params;

    if (portfolioId === undefined) {
        res.status(500).json("Portfolio ID is required")
    }

    const result = await portfolioService.getPortfolioDetails(portfolioId);

    res.status(200).json(result)

}


async function updateCoinInPortfolioRoute(req: Request, res: Response) {

    const { portfolioId } = req.params;

    const result = await portfolioService.updateCoinInPortfolio(portfolioId, req.body);

    if (result === null) {
        res.status(500).json("Something went wrong")
    }

    res.status(200).json(result)
}

module.exports = {
    createUserPortfolioRoute,
    getAllPortfoliosRoute,
    fetchUserPortfolioInsightsRoute,
    deleteCoinFromUserPortfolioRoute,
    fetchPortfolioDetailsRoute,
    updateCoinInPortfolioRoute
};