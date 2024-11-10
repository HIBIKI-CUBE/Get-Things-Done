<script lang='ts'>
  import type { User } from '@prisma/client';
  import type { VerifiedRegistrationResponse } from '@simplewebauthn/server';
  import type { PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/types';
  import { invalidateAll } from '$app/navigation';
  import { startAuthentication } from '@simplewebauthn/browser';

  const { user }: { user: User | undefined } = $props();

  async function login() {
    const { options }: { options: PublicKeyCredentialRequestOptionsJSON | null } = await (await fetch(`/api/auth/login`)).json().catch((err) => {
      console.error(err);
    });
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
