import { Request, Response } from "express";
import PortfolioService from "../services/PortfolioService";

const portfolioService = new PortfolioService();

// Controller to get all portfolios registered
async function getAllPortfoliosRoute(req: Request, res: Response) {
  const result = await portfolioService.getAllPortfolios();
  res.status(200).json(result);
}

async function getUserPortfolioInsights(req: Request, res: Response) {
  const userId = req.params.userId;
  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }
  const result = await portfolioService.getAllPortfolios();
  res.status(200).json(result);
}

export { getAllPortfoliosRoute, getUserPortfolioInsights };
