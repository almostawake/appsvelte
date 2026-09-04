<!--
  The signed-in surface: gate + chrome. `(app)` is a SvelteKit layout
  GROUP — the parentheses keep it out of the URL, so pages inside it live
  at root level (/users, and /scopes etc. later) while still sharing one
  auth check. That's the whole reason for the group: without it each
  top-level page would have to re-implement the gate.

  Only the sign-in screen at / sits outside. There is no anonymous
  surface in this app.
-->
<script lang="ts">
  import { goto } from '$app/navigation';
  import type { Snippet } from 'svelte';
  import AppHeader from '$lib/components/AppHeader.svelte';
  import { authStore } from '$lib/state/AuthStore.svelte';
  import { usersStore } from '$lib/state/UsersStore.svelte';

  let { children }: { children: Snippet } = $props();

  // Three states once `loaded` resolves:
  //   no user           → / (sign in)
  //   user, not admin   → sign out, /?denied=1
  //   user, admin       → render the page
  // The template below is also gated on `loaded && isAdmin === true`,
  // so the chrome (menu, signed-in mobile, etc.) never paints for
  // non-admins. Without that gate the layout flashed briefly before
  // this effect's redirect could fire.
  $effect(() => {
    if (!authStore.loaded) return;
    if (!authStore.user) {
      goto('/', { replaceState: true });
    } else if (authStore.isAdmin === false) {
      authStore.signOut().then(() => goto('/?denied=1', { replaceState: true }));
    }
  });

  // Long-lived Firestore subscription tied to this layout's lifecycle.
  // Only start once the user is known to be an admin — otherwise the
  // onSnapshot would hit a permission-denied error.
  $effect(() => {
    if (authStore.isAdmin !== true) return;
    usersStore.start();
    return () => usersStore.stop();
  });
</script>

{#if authStore.loaded && authStore.isAdmin === true}
  <div class="flex min-h-screen flex-col">
    <AppHeader />

    <!--
    Page-content gutter: pl uses --page-gutter (= the menu icon's visible
    left edge, defined in app.css) so every page aligns with the menu
    icon. New pages should not add their own horizontal padding — they
    inherit this.

    `flex flex-col` makes <main> a flex column so a page can opt into
    filling the remaining height; pages that just stack content at the
    top need no extra classes.
  -->
    <main class="flex flex-1 flex-col overflow-auto py-4 pr-3 pl-[var(--page-gutter)]">
      {@render children()}
    </main>
  </div>
{/if}
