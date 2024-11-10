<script lang='ts'>
  import type { LayoutServerData } from './$types';
  import AuthButton from '$lib/components/AuthButton.svelte';

  const layout: { data: LayoutServerData } = $props();
</script>

{#if layout.data.user}
  {layout.data.user?.name}さん、こんにちは！
{/if}

<AuthButton user={layout.data.user} />
