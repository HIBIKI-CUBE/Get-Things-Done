import { env } from '$env/dynamic/private';
import { PrismaD1 } from '@prisma/adapter-d1';
import { PrismaClient } from '@prisma/client';

export interface Env {
  // This must match the binding name defined in your wrangler.toml configuration
  DB: D1Database;
}

const adapter = new PrismaD1(env.DB as unknown as D1Database);
export const prisma = new PrismaClient({ adapter });
