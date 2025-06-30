import { PrismaClient } from "@prisma/client";

class PrismaService {
  constructor() {}

  /**
   * Initializes the Prisma client.
   * @returns {PrismaClient} - The initialized Prisma client.
   */
  static initialize(): PrismaClient {
    const prisma = new PrismaClient();

    // Optionally, you can add error handling or logging here
    prisma.$on("error", (e) => {
      console.error("Prisma Client Error:", e);
    });

    return prisma;
  }

  /**
   * Closes the Prisma client connection.
   * @param {PrismaClient} prisma - The Prisma client to close.
   */
  static async close(prisma: PrismaClient): Promise<void> {
    if (prisma) {
      try {
        await prisma.$disconnect();
        console.log("Prisma Client disconnected successfully.");
      } catch (error) {
        console.error("Error disconnecting Prisma Client:", error);
      }
    } else {
      console.warn("Prisma Client is not initialized or already disconnected.");
    }
  }
}

export default PrismaService;
