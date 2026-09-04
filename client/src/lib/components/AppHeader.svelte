<!--
  Top bar for the signed-in surface — the (app) layout group is the only
  thing that renders it. Hamburger menu top left (pages + sign out), the
  signed-in mobile top right.

  It still checks `isAdmin === true` before painting anything, even though
  its layout already gates on the same condition: the layout's redirect
  runs in an effect, so there is one frame where a non-admin would
  otherwise see admin chrome.
-->
<script lang="ts">
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/state/AuthStore.svelte';
  import { formatAuMobile } from '$common/mobile';

  let menuOpen = $state(false);

  function toggleMenu() {
    menuOpen = !menuOpen;
  }

  function closeMenu() {
    menuOpen = false;
  }

  async function handleSignOut() {
    closeMenu();
    // Navigate to the sign-in screen BEFORE signing out: once off the
    // (app) layout its gate effect is gone, so it can't race this with a
    // redirect of its own.
    await goto('/', { replaceState: true });
    await authStore.signOut();
  }
</script>

<svelte:window
  onclick={(e) => {
    const target = e.target as HTMLElement;
    if (!target.closest('[data-menu-root]')) closeMenu();
  }}
/>

<header class="border-border bg-bg-soft flex h-16 items-center border-b px-3">
  {#if authStore.loaded && authStore.isAdmin === true}
    <div data-menu-root class="relative">
      <button
        class="hover:bg-bg-hover flex h-14 w-14 items-center justify-center rounded"
        onclick={toggleMenu}
        aria-label="Menu"
        aria-expanded={menuOpen}
      >
        <span aria-hidden="true" class="text-3xl leading-none">≡</span>
      </button>
      {#if menuOpen}
        <!--
          New pages (e.g. /scopes) should add themselves here in the same
          shape — a li with an anchor — so the menu stays the single
          source of nav truth. They live under routes/(app)/ to inherit
          the auth gate.
        -->
        <nav
          class="border-border absolute top-full left-0 mt-1 min-w-[180px] border bg-white shadow-sm"
        >
          <ul>
            <li>
              <a href="/users" onclick={closeMenu} class="hover:bg-bg-hover block px-3 py-2">
                users
              </a>
            </li>
            <li class="border-border border-t">
              <button
                type="button"
                class="hover:bg-bg-hover block w-full px-3 py-2 text-left"
                onclick={handleSignOut}
              >
                sign out
              </button>
            </li>
          </ul>
        </nav>
      {/if}
    </div>
    <div class="text-fg-faint ml-auto text-[15px]">
      {authStore.user?.phoneNumber ? formatAuMobile(authStore.user.phoneNumber) : ''}
    </div>
  {/if}
  <!-- Anything other than a loaded admin renders an empty bar; the layout
       is already redirecting them out. -->
</header>
