import { env } from '$env/dynamic/private';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from './db/schema';

export const db = drizzle(env.DB as unknown as D1Database, { schema });
