import { PrismaClient } from "@prisma/client";
import { withOptimize } from "@prisma/extension-optimize";

const optimizeApiKey = process.env.OPTIMIZE_API_KEY;

// Create Prisma client with or without Optimize extension
const prisma = optimizeApiKey 
  ? new PrismaClient().$extends(
      withOptimize({
        apiKey: optimizeApiKey as string
      })
    )
  : new PrismaClient();

export default prisma;
