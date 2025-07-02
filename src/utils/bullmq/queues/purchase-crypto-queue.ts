import logger from "../../../utils/logger";
import { Queue } from "bullmq";

const purchaseQueue = new Queue("purchase-crypto");

export async function addPurchaseToQueue(
  job_id: string,
  user_id: string,
  coin_id: number,
  quantity: number,
  purchase_price: number
): Promise<void> {
  try {
    logger.info(
      `Adding purchase to queue: job_id=${job_id}, user_id=${user_id}, coin_id=${coin_id}, quantity=${quantity}, purchase_price=${purchase_price}`
    );
    await purchaseQueue.add(
      "purchase-crypto",
      {
        job_id,
        user_id,
        coin_id,
        quantity,
        purchase_price,
      },
      {
        jobId: job_id,
        attempts: 5,
        backoff: { type: "exponential", delay: 1000 },
        removeOnComplete: true,
        removeOnFail: false,
      }
    );
  } catch (error) {
    console.error("Error adding purchase to queue:", error);
    throw error;
  }
}
