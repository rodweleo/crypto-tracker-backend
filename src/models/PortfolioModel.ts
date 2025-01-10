export interface PortfolioModel {
    id: string;
    userId: string;
    totalValue: number;
    growth24h: number;
    createdAt: string; // ISO timestamp
    updatedAt: string;
}