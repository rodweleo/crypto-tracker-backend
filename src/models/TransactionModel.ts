export interface TransactionModel {
    id: string;
    portfolio_id: string;
    coin: string;
    quantity: number;
    purchase_price: number;
    created_at: string; // ISO timestamp
}
