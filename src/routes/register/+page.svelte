<script lang='ts'>
  import type { VerifiedRegistrationResponse } from '@simplewebauthn/server';
  import type { PublicKeyCredentialCreationOptionsJSON } from '@simplewebauthn/types';
  import { goto, invalidateAll } from '$app/navigation';
  import { startRegistration } from '@simplewebauthn/browser';

  let username = $state('');
  async function createPasskey() {
    if (username === '') {
      return;
    }
    const { options }: { options: PublicKeyCredentialCreationOptionsJSON | null } = await (await fetch(`/api/auth/register`, {
      method: 'POST',
      body: JSON.stringify({ username }),
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
    })).json().catch((err) => {
      console.error(err);
    });
    if (!options)
      return;
    const registrationResponse = await startRegistration({ optionsJSON: options });

    const verificationJSON: VerifiedRegistrationResponse = await (await fetch('/api/auth/register/verify-challenge', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registrationResponse),
    })).json();

    if (verificationJSON.verified) {
      await invalidateAll();
      goto('/');
    }
    else {
      throw new Error(`Verification failed: ${verificationJSON}`);
    }
  }

</script>

<form action="">
  <label>ユーザー名
    <input type='text' required autocomplete='username webauthn' bind:value={username}>
  </label>
  <button onclick={createPasskey}>登録</button>
</form>
