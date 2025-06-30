import { PrismaClient } from "../generated/prisma";
import logger from "../utils/logger";

const prisma = new PrismaClient();

/**
 * UserService class to handle user-related operations
 * such as creating a user, fetching all users, and fetching a user by email.
 */
class UserService {
  constructor() {}

  // Create a user
  async createUser(userData: any) {
    logger.info("Saving a new user with details: " + JSON.stringify(userData));

    try {
      const result = await prisma.user.create({
        data: {
          name: userData.name,
          email: userData.email,
        },
      });

      //fetch the user details from the database
      const savedUserDetails = await prisma.user.findUnique({
        where: {
          id: result.id,
        },
      });
      if (!savedUserDetails) {
        throw new Error("User not found after creation");
      }
      logger.info(
        "User created successfully: " + JSON.stringify(savedUserDetails)
      );

      return savedUserDetails;
    } catch (e: any) {
      logger.error("Error creating user: " + e.message);
      throw new Error("Failed to create user");
    }
  }

  // Get all users
  async getUsers() {
    try {
      const users = await prisma.user.findMany();
      if (!users || users.length === 0) {
        logger.info("No users found in the database.");
        return [];
      }
      logger.info("Users fetched successfully: " + JSON.stringify(users));
      return users;
    } catch (e: any) {
      logger.error("Error getting users: " + e.message);
      throw new Error("Failed to get users");
    }
  }

  async getUserByEmail(email: string) {
    logger.info("Fetching user by email: " + email);
    try {
      if (!email) {
        throw new Error("Email is required to fetch user");
      }
      if (typeof email !== "string") {
        throw new Error("Email must be a string");
      }
      if (!email.includes("@")) {
        throw new Error("Invalid email format");
      }

      const user = await prisma.user.findUnique({
        where: {
          email: email,
        },
      });

      if (!user) {
        logger.info("User not found with email: " + email);
        return null;
      }

      return user;
    } catch (e: any) {
      logger.error("Error getting user by email: " + e.message);
      throw new Error("Failed to get user by email");
    }
  }
}

export default UserService;
