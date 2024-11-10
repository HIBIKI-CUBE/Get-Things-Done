import type { PublicKeyCredentialCreationOptionsJSON } from '@simplewebauthn/types';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/prisma';
import { rpID, rpName } from '$lib/server/webAuthnConsts';
import { generateRegistrationOptions } from '@simplewebauthn/server';
import { error, json } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, locals: { session } }) => {
  const userName: string | null = (await request.json()).username;
  if (!userName)
    return error(400, 'Parameter missing');
  const user = await prisma.user.create({ data: { name: userName } });

  const options: PublicKeyCredentialCreationOptionsJSON = await generateRegistrationOptions({
    rpName,
    rpID,
    userName,
    userID: new TextEncoder().encode(user.id),
    attestationType: 'none',
    // Prevent users from re-registering existing authenticators
    excludeCredentials: undefined, // TODO: Get existing credentials,
    // See "Guiding use of authenticators via authenticatorSelection" below
    authenticatorSelection: {
      residentKey: 'required',
      userVerification: 'preferred',
      authenticatorAttachment: 'platform',
    },
  });

  await session.regenerate();
  session.cookie.path = '/';
  await session.setData({
    userId: user.id,
    challenge: options.challenge,
  });
  await session.save();

  return json({ options });
};