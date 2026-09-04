<!--
  Shared top bar ("nav bar") used by the public home page and the
  /admin layout. Two states:

    signed-in whitelisted user → hamburger menu top left (admin pages +
                                 sign out) and the signed-in mobile top right
    everyone else              → "sign in" link top right

  Importing this pulls in authStore, which initializes Firebase — so the
  public `/` page now initializes Firebase Auth purely to *read* session
  state. Anonymous visitors still have no data path (docs/CLAUDE-AUTH.md);
  nothing here gates the page it sits on.
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
    // Navigate home BEFORE signing out: once off /admin its gate effect
    // is gone, so it can't race this with its own redirect to /login.
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
          New admin pages (e.g. /admin/scopes) should add themselves here
          in the same shape — a li with an anchor — so the menu stays the
          single source of nav truth.
        -->
        <nav
          class="border-border absolute top-full left-0 mt-1 min-w-[180px] border bg-white shadow-sm"
        >
          <ul>
            <li>
              <a href="/admin" onclick={closeMenu} class="hover:bg-bg-hover block px-3 py-2">
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
  {:else if authStore.loaded}
    <a href="/login" class="ml-auto text-[15px]">sign in</a>
  {/if}
  <!-- !loaded → empty bar: no "sign in" flash for a returning admin. -->
</header>
