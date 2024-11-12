import type { AuthenticationResponseJSON, AuthenticatorTransportFuture } from '@simplewebauthn/types';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/prisma';
import { origin, rpID } from '$lib/server/webAuthnConsts';
import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import { json } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, locals: { session } }) => {
  const response: AuthenticationResponseJSON = await request.json();

  const user = await prisma.user.findFirst({
    where: {
      Passkey: {
        some: {
          id: response.id,
        },
      },
    },
    include: {
      Passkey: {
        where: {
          id: response.id,
        },
      },
    },
  });

  const passkey = user?.Passkey[0];

  const expectedChallenge = session.data.challenge;
  if (!expectedChallenge || !user || !passkey)
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
          publicKey: passkey.public_key,
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
    await prisma.passkey.update({
      where: {
        id: passkey.id,
      },
      data: {
        counter: newCounter,
      },
    });
    session.cookie.path = '/';
    await session.setData({ userId: user.id });
    await session.save();
  }

  return json({ verified });
};
