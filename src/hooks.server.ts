import type { Handle } from '@sveltejs/kit';
import { SESSION_SECRET } from '$env/static/private';
import KvStore from 'svelte-kit-connect-cloudflare-kv';
import { sveltekitSessionHandle } from 'svelte-kit-sessions';

declare module 'svelte-kit-sessions' {
  interface SessionData {
    userId?: string;
    challenge?: string;
  }
}

export const handle: Handle = async ({ event, resolve }) => {
  let sessionHandle: Handle | null = null;

  if (event.platform && event.platform.env) {
    // https://kit.svelte.dev/docs/adapter-cloudflare#bindings
    const store = new KvStore({ client: event.platform.env.session });
    sessionHandle = sveltekitSessionHandle({
      secret: SESSION_SECRET,
      store,
      cookie: {
        maxAge: 3600 * 8,
        httpOnly: true,
        sameSite: 'strict',
        secure: true,
        path: '/',
      },
      rolling: true,
    });
  }

  return sessionHandle ? sessionHandle({ event, resolve }) : resolve(event);
};
