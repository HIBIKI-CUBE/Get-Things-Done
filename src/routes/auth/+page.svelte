<script>
  import { page } from '$app/stores'
  import { SignIn, SignOut } from '@auth/sveltekit/components'
</script>

<h1>SvelteKit Auth Example</h1>
<div>
  {#if $page.data.session}
    <span class='signedInText'>
      <small>Signed in as</small><br />
      <strong>{$page.data.session.user?.name ?? 'User'}</strong>
    </span>
    <SignOut>
      <div slot='submitButton' class='buttonPrimary'>Sign out</div>
    </SignOut>
  {:else}
    <span class='notSignedInText'>You are not signed in</span>
    <SignIn provider='passkey' />
  {/if}
</div>
