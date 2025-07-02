import { createClient, RedisClientType } from "redis";
import dotenv from "dotenv";
dotenv.config();

class RedisService {
  private client: RedisClientType | null = null;

  /**
   * Connects to Redis and initializes the client instance.
   * Reuses the connection if already established.
   */
  async connect(): Promise<RedisClientType> {
    if (this.client) return this.client; // Reuse existing connection

    try {
      this.client = createClient({
        url: process.env.REDIS_URL || "redis://localhost:6379",
        socket: {
          connectTimeout: 10000,
          reconnectStrategy: (retries) => {
            if (retries > 5) {
              return new Error("Max retries reached");
            }
            return Math.min(retries * 1000, 3000);
          },
        },
      });

      this.client.on("error", (err) =>
        console.error("Redis Client Error", err)
      );

      await this.client.connect();
      console.log("Connected to Redis");

      return this.client;
    } catch (error) {
      console.error("Error connecting to Redis:", error);
      throw error;
    }
  }

  /**
   * Returns the Redis client. Ensures connection is established first.
   */
  async getClient(): Promise<RedisClientType> {
    if (!this.client) {
      await this.connect();
    }
    return this.client!;
  }

  /**
   * Disconnects the Redis client.
   */
  async disconnect(): Promise<void> {
    if (!this.client) return;
    try {
      await this.client.quit();
      console.log("Disconnected from Redis");
      this.client = null;
    } catch (error) {
      console.error("Error disconnecting from Redis:", error);
      throw error;
    }
  }

  /**
   * Sets a key-value pair in Redis.
   */
  async setKey(key: string, value: string): Promise<void> {
    const client = await this.getClient();
    try {
      await client.set(key, value);
      console.log(`Set key ${key} with value ${value}`);
    } catch (error) {
      console.error(`Error setting key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Gets the value of a key from Redis.
   */
  async getKey(key: string): Promise<string | null> {
    const client = await this.getClient();
    try {
      const value = await client.get(key);
      console.log(`Retrieved key ${key} with value ${value}`);
      return value;
    } catch (error) {
      console.error(`Error getting key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Deletes a key from Redis.
   */
  async deleteKey(key: string): Promise<void> {
    const client = await this.getClient();
    try {
      await client.del(key);
      console.log(`Deleted key ${key}`);
    } catch (error) {
      console.error(`Error deleting key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Flushes all keys in Redis.
   */
  async flushAll(): Promise<void> {
    const client = await this.getClient();
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
