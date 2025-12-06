// lib/prismadb.ts

import { PrismaClient } from "@prisma/client";

declare global {
  // Allow global `var prisma` in TypeScript
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const client = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = client;
}

export default client;
