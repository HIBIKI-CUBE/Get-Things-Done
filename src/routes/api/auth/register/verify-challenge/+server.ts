import type { RegistrationResponseJSON } from '@simplewebauthn/types';
import type { RequestHandler } from './$types';
import { Buffer } from 'node:buffer';
import { passkeys } from '$lib/db/schema';
import { db } from '$lib/drizzle';
import { origin, rpID } from '$lib/server/webAuthnConsts';
import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { json } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, locals: { session } }) => {
  const registrationResponseJSON: RegistrationResponseJSON = await request.json();

  const expectedChallenge = session.data.challenge;
  if (!expectedChallenge)
    return json({ error: 'Parameters incorrect' }, { status: 400, statusText: 'Bad Request' });

  const verification = await (async () => {
    try {
      return await verifyRegistrationResponse({
        response: registrationResponseJSON,
        expectedChallenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
      });
    }
    catch (error) {
      console.error(error);
    }
  })();

  if (!verification)
    return json({ error: 'Challenge or user not found' }, { status: 400, statusText: 'Bad Request' });

  const { verified } = verification;
  const { registrationInfo } = verification;

  const user = await db.query.users.findFirst({
    where: ({ id }, { eq }) => eq(id, session.data.userId ?? ''),
  });

  if (verified && registrationInfo && user) {
    const {
      credential,
      credentialDeviceType,
      credentialBackedUp,
    } = registrationInfo;

    await db.insert(passkeys)
      .values({
        user_id: user.id,
        webauthn_user_id: user.id,
        id: credential.id,
        public_key: Buffer.from(credential.publicKey),
        counter: credential.counter,
        transports: credential.transports?.join(',') ?? null,
        device_type: credentialDeviceType,
        backed_up: credentialBackedUp,
      });

    session.cookie.path = '/';
    await session.setData({ userId: user.id });
    await session.save();
  }

  return json({ verified });
};
