import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const connectToDatabase = async () => {
  try {
    await prisma.$connect();
    console.log("Database connected successfully!!!");
  } catch (error) {
    console.log("Database connection failed!!! ", error);
    process.exit(1);
  }
};

export { prisma, connectToDatabase };
