import { createClient, RedisClientType } from "redis";
import dotenv from "dotenv";
dotenv.config();

class RedisService {
  /**
   * RedisService provides methods to connect, disconnect, and perform basic operations
   * on a Redis database.
   */

  //define a local variable to hold the Redis client instance
  private client: RedisClientType | null = null;
  /**
   * Constructor for RedisService.
   * Initializes the Redis client.
   */
  constructor() {
    // The client will be initialized asynchronously; call init() after instantiation
  }

  async connect() {
    try {
      const client = createClient({
        url: process.env.REDIS_URL! || "redis://localhost:6379",
        socket: {
          connectTimeout: 10000, // 10 seconds
          reconnectStrategy: (retries) => {
            if (retries > 5) {
              return new Error("Max retries reached");
            }
            return Math.min(retries * 1000, 3000); // Exponential backoff
          },
        },
      });
      await client.connect();
      console.log("Connected to Redis");
      return client;
    } catch (error) {
      console.error("Error connecting to Redis:", error);
      throw error;
    }
  }

  async disconnect(client: RedisClientType) {
    try {
      await client.quit();
      console.log("Disconnected from Redis");
    } catch (error) {
      console.error("Error disconnecting from Redis:", error);
      throw error;
    }
  }

  async setKey(client: RedisClientType, key: string, value: string) {
    try {
      await client.set(key, value);
      console.log(`Set key ${key} with value ${value}`);
    } catch (error) {
      console.error(`Error setting key ${key}:`, error);
      throw error;
    }
  }

  async getKey(client: RedisClientType, key: string): Promise<string | null> {
    try {
      const value = await client.get(key);
      console.log(`Retrieved key ${key} with value ${value}`);
      return value;
    } catch (error) {
      console.error(`Error getting key ${key}:`, error);
      throw error;
    }
  }

  async deleteKey(client: RedisClientType, key: string) {
    try {
      await client.del(key);
      console.log(`Deleted key ${key}`);
    } catch (error) {
      console.error(`Error deleting key ${key}:`, error);
      throw error;
    }
  }

  async flushAll(client: RedisClientType) {
    try {
      await client.flushAll();
      console.log("Flushed all keys in Redis");
    } catch (error) {
      console.error("Error flushing all keys:", error);
      throw error;
    }
  }
}

export default RedisService;
