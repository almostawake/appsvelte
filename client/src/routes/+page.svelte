<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import type { ConfirmationResult } from 'firebase/auth';
  import { authStore } from '$lib/state/AuthStore.svelte';
  import { usersStore } from '$lib/state/UsersStore.svelte';
  import { AuthService } from '$lib/services/AuthService';
  import { formatAuMobile, normalizeAuMobile } from '$common/mobile';

  // The app's front door. There is no public/marketing surface — you land
  // here, sign in, and land on /users. Two steps in one route: enter a
  // mobile, then enter the code texted to it. (A separate /auth/action
  // route, which email-link sign-in needed, has no equivalent — there's no
  // link to land on, so the whole flow stays in this component's state.)
  let mobile = $state('');
  let code = $state('');
  let confirmation = $state<ConfirmationResult | null>(null);
  let busy = $state(false);
  let error = $state<string | null>(null);
  let sentTo = $state('');
  let codeEl = $state<HTMLInputElement | null>(null);
  let denied = $derived(page.url.searchParams.get('denied') === '1');

  // A signed-in admin has no business on the sign-in screen — send them
  // to /users, the landing page of the app proper.
  $effect(() => {
    if (authStore.loaded && authStore.user && authStore.isAdmin === true) {
      goto('/users', { replaceState: true });
    }
  });

  $effect(() => {
    if (confirmation && codeEl) codeEl.focus();
  });

  async function submitMobile(e: SubmitEvent) {
    e.preventDefault();
    if (busy) return;
    const e164 = normalizeAuMobile(mobile);
    if (!e164) {
      error = "that's not an australian mobile — like 0412 345 678";
      return;
    }
    busy = true;
    error = null;
    try {
      confirmation = await AuthService.sendCode(e164);
      sentTo = e164;
      // Local dev sends no actual SMS — the emulator just records the
      // code. Pre-fill it so signing in locally is one click, not a trip
      // through the emulator logs.
      const dev = await AuthService.devCode(e164);
      if (dev) code = dev;
    } catch (err) {
      error = (err as Error).message;
    } finally {
      busy = false;
    }
  }

  async function submitCode(e: SubmitEvent) {
    e.preventDefault();
    if (busy || !confirmation) return;
    busy = true;
    error = null;
    try {
      const user = await AuthService.confirmCode(confirmation, code);
      // Best-effort enrichment of the whitelist row with uid +
      // lastSignInAt. Failure shouldn't block the redirect — the user is
      // signed in either way, and the next sign-in will retry. A user who
      // isn't whitelisted fails this write silently and is then bounced
      // by the /admin gate, which is the intended outcome.
      try {
        await usersStore.recordSignIn(user);
      } catch {
        /* swallow */
      }
      goto('/users', { replaceState: true });
    } catch (err) {
      error = (err as Error).message;
    } finally {
      busy = false;
    }
  }

  function startOver() {
    confirmation = null;
    code = '';
    error = null;
  }
</script>

<div class="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6">
  {#if !confirmation}
    <form onsubmit={submitMobile} class="space-y-3">
      {#if denied}
        <div class="text-err">
          that number isn't on the admin list. ask an existing admin to add you.
        </div>
      {/if}
      <div class="flex items-center gap-2">
        <input
          id="mobile"
          class="tx-input w-[360px]"
          type="tel"
          autocomplete="tel"
          required
          bind:value={mobile}
          placeholder="0412 345 678"
        />
        <button class="tx-btn whitespace-nowrap" type="submit" disabled={busy || !mobile.trim()}>
          {busy ? 'sending…' : 'text me a code'}
        </button>
      </div>
      {#if error}
        <div class="text-err">{error}</div>
      {/if}
    </form>
  {:else}
    <form onsubmit={submitCode} class="space-y-3">
      <p class="text-fg-muted">we texted a code to {formatAuMobile(sentTo)}.</p>
      <div class="flex items-center gap-2">
        <input
          id="code"
          class="tx-input w-[180px]"
          type="text"
          inputmode="numeric"
          autocomplete="one-time-code"
          required
          bind:this={codeEl}
          bind:value={code}
          placeholder="123456"
        />
        <button class="tx-btn whitespace-nowrap" type="submit" disabled={busy || !code.trim()}>
          {busy ? 'checking…' : 'sign in'}
        </button>
      </div>
      {#if error}
        <div class="text-err">{error}</div>
      {/if}
      <button type="button" class="tx-btn-ghost" onclick={startOver}>use a different number</button>
    </form>
  {/if}
</div>
