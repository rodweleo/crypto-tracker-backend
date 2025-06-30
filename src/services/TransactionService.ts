import logger from "../utils/logger";

class TransactionService {
  constructor() {}

  async buyCrypto() {
    //save the user's transaction
    logger.info(
      `Saving the user's crypto transaction...: ${JSON.stringify(transaction)}`
    );
    const { data, error } = await SupabaseClient.from(
      "gochapaa_users_transactions"
    )
      .insert(transaction)
      .select();

    if (error) {
      Logger.error(`Error adding transaction: ${error.message}`);
    }

    logger.info(
      `Transaction for portfolio ${
        transaction.portfolio_id
      } saved successfully: ${JSON.stringify(data)}`
    );

    return data;
  }
}

export default TransactionService;
