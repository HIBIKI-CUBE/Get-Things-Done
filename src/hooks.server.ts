import type { Handle } from '@sveltejs/kit';
import { SESSION_SECRET } from '$env/static/private';
import PrismaStore from '$lib/server/prismaSession';
import { sveltekitSessionHandle } from 'svelte-kit-sessions';

declare module 'svelte-kit-sessions' {
  interface SessionData {
    userId?: string;
    challenge?: string;
  }
}

export const handle: Handle = sveltekitSessionHandle({
  secret: SESSION_SECRET,
  store: new PrismaStore(),
  cookie: {
    maxAge: 3600 * 8,
    httpOnly: true,
    sameSite: 'strict',
    secure: true,
    path: '/',
  },
  rolling: true,
});
