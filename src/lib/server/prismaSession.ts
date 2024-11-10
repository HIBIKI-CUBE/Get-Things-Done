import type { Session } from '@prisma/client';
import type { SessionCookieOptions, SessionStoreData, Store } from 'svelte-kit-sessions';
import { prisma } from '$lib/prisma';

interface Serializer {
  parse: (s: string) => SessionStoreData | Promise<SessionStoreData>;
  stringify: (data: SessionStoreData) => string;
}

interface MemoryStoreOptions {
  prefix?: string;
  serializer?: Serializer;
  ttl?: number;
}

const ONE_DAY_IN_SECONDS = 86400;

export default class PrismaStore implements Store {
  #prefix: string;

  #serializer: Serializer;

  /**
   * Time to live in milliseconds.
   * default: 86400 * 1000
   */
  #ttl: number;

  constructor(options?: MemoryStoreOptions) {
    this.#prefix = options?.prefix || '';
    this.#serializer = options?.serializer || JSON;
    this.#ttl = options?.ttl || ONE_DAY_IN_SECONDS * 1000;
  }

  async get(id: string): Promise<SessionStoreData | null> {
    const key = this.#prefix + id;
    const session = await prisma.session.findFirst({
      where: {
        id: key,
        OR: [
          {
            expires: { gt: new Date() },
          },
          {
            expires: null,
          },
        ],
      },
    });

    if (!session?.cookie) {
      return null;
    }

    const { cookie } = session;
    const result = {
      cookie: JSON.parse(cookie) as SessionCookieOptions,
      data: {
        userId: session.user_id ?? undefined,
        challenge: session.challenge ?? undefined,
      },
    };
    return result;
  }

  async set(id: string, storeData: SessionStoreData, ttl: number): Promise<void> {
    const key = this.#prefix + id;
    const { cookie } = storeData;

    const sessionData = {
      id: key,
      cookie: JSON.stringify(cookie),
      expires: ttl === Infinity ? null : new Date(Date.now() + ttl),
      user_id: storeData.data.userId ?? null,
      challenge: storeData.data.challenge ?? null,
    } satisfies Omit<Session, 'created_at'>;

    await prisma.session.upsert({
      where: {
        id: key,
      },
      update: sessionData,
      create: sessionData,
    });
  }

  async destroy(id: string): Promise<void> {
    const key = this.#prefix + id;
    prisma.session.delete({
      where: {
        id: key,
      },
    });
  }

  async touch(id: string, ttl: number): Promise<void> {
    const key = this.#prefix + id;
    await prisma.session.update({
      where: {
        id: key,
      },
      data: {
        expires: new Date(Date.now() + ttl),
      },
    });
  }
}
