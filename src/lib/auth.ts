import { PrismaAdapter } from '@auth/prisma-adapter'
import { SvelteKitAuth } from '@auth/sveltekit'
import PassKey from '@auth/sveltekit/providers/passkey'
import { prisma } from '$lib/prisma'

export const { handle, signIn, signOut } = SvelteKitAuth({
  providers: [PassKey],
  adapter: PrismaAdapter(prisma),
  experimental: { enableWebAuthn: true },
})
