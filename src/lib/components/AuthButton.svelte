<script lang='ts'>
  import type { VerifiedRegistrationResponse } from '@simplewebauthn/server';
  import type { PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/types';
  import type { InferSelectModel } from 'drizzle-orm';
  import { invalidateAll } from '$app/navigation';
  import { users } from '$lib/db/schema';
  import { startAuthentication } from '@simplewebauthn/browser';

  const { user }: { user: InferSelectModel<typeof users> | undefined } = $props();

  async function login() {
    const { options } = await (await fetch(`/api/auth/login`)).json().catch((err) => {
      console.error(err);
    }) as { options: PublicKeyCredentialRequestOptionsJSON | null };
    if (!options)
      return;
    const authenticationResponse = await startAuthentication({
      optionsJSON: options,
    });

    const verificationJSON: VerifiedRegistrationResponse = await (await fetch('/api/auth/login/verify-challenge', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(authenticationResponse),
    })).json();

    if (verificationJSON.verified) {
      await invalidateAll();
    }
    else {
      throw new Error(`Verification failed: ${verificationJSON}`);
    }
  }

  async function logout() {
    await fetch('/api/auth/logout', {
      credentials: 'same-origin',
    });
    await invalidateAll();
  }
</script>

{#if user?.id}
  <button onclick={logout}>ログアウトする</button>
{:else}
  <button onclick={login}>ログインする</button>
{/if}
