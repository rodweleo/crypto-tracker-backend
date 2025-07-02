import { Worker, Job } from "bullmq";
import CryptoService from "../../../services/CryptoService";
import RedisService from "../../../services/RedisService";
import Redis from "ioredis";

const redis = new Redis({
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

const redisService = new RedisService();
export const purchaseWorker = new Worker(
  "purchase-crypto",
  async (job: Job) => {
    const cryptoService = new CryptoService();
    await cryptoService.buyCrypto(job.data);
  },
  {
    connection: redis,
    concurrency: 5, // Adjust concurrency as needed
    autorun: true, // Automatically start the worker
    lockDuration: 30000, // Lock duration for job processing
  }
);
