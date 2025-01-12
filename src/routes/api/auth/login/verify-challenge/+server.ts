import type { AuthenticationResponseJSON, AuthenticatorTransportFuture } from '@simplewebauthn/types';
import type { RequestHandler } from './$types';
import { passkeys } from '$lib/db/schema';
import { db } from '$lib/drizzle';
import { origin, rpID } from '$lib/server/webAuthnConsts';
import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export const POST: RequestHandler = async ({ request, locals: { session } }) => {
  const response: AuthenticationResponseJSON = await request.json();
  const expectedChallenge = session.data.challenge;

  const passkey = await db.query.passkeys.findFirst({
    where: ({ id }, { eq }) => eq(id, response.id),
  });

  if (!expectedChallenge || !passkey)
    return json({ error: 'challenge or user not found' }, { status: 400, statusText: 'Bad Request' });

  const verification = await (async () => {
    try {
      return await verifyAuthenticationResponse({
        response,
        expectedChallenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        credential: {
          id: passkey.id,
          publicKey: passkey.public_key as Uint8Array,
          counter: passkey.counter,
          transports: passkey.transports?.split(',') as AuthenticatorTransportFuture[],
        },
      });
    }
    catch (error) {
      console.error(error);
    }
  })();

  if (!verification)
    return json({ error: 'challenge or user not found' }, { status: 400, statusText: 'Bad Request' });

  const { verified } = verification;
  const { newCounter } = verification.authenticationInfo;

  if (verified) {
    await db.update(passkeys)
      .set({ counter: newCounter })
      .where(eq(passkeys.id, passkey.id));
    session.cookie.path = '/';
    await session.setData({ userId: passkey.user_id });
    await session.save();
  }

  return json({ verified });
};
