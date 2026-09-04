<!--
  /users — the landing page after sign-in. Add/remove mobile numbers on
  the `users` collection. Anyone listed here can sign in and edit this
  list (users manage users — there's no separate admin tier).
-->
<script lang="ts">
  import { authStore } from '$lib/state/AuthStore.svelte';
  import { usersStore } from '$lib/state/UsersStore.svelte';
  import Page from '$lib/components/Page.svelte';
  import { formatAuMobile } from '$common/mobile';

  let adding = $state(false);
  let newMobile = $state('');
  let saving = $state(false);
  let error = $state<string | null>(null);
  let inputEl = $state<HTMLInputElement | null>(null);

  $effect(() => {
    if (adding && inputEl) inputEl.focus();
  });

  function startAdd() {
    adding = true;
    newMobile = '';
    error = null;
  }

  function cancelAdd() {
    adding = false;
    newMobile = '';
    error = null;
  }

  async function submitAdd(e: SubmitEvent) {
    e.preventDefault();
    if (saving) return;
    saving = true;
    error = null;
    try {
      const me = authStore.user?.phoneNumber ?? 'unknown';
      await usersStore.add(newMobile, me);
      cancelAdd();
    } catch (err) {
      error = (err as Error).message;
    } finally {
      saving = false;
    }
  }

  async function remove(mobile: string) {
    error = null;
    try {
      await usersStore.remove(mobile);
    } catch (err) {
      error = (err as Error).message;
    }
  }
</script>

<Page title="users" description="these users can sign in and manage this list.">
  <ul class="space-y-1">
    {#each usersStore.users as item (item.mobile)}
      <li class="group flex items-center gap-2">
        <!-- Stored E.164, shown in the 04xx form people recognise. -->
        <span>{formatAuMobile(item.mobile)}</span>
        {#if usersStore.users.length > 1}
          <!--
            Two layered hover states. Row-hover (`group`) reveals the ×
            button; button-hover (`group/del`) additionally reveals the
            "delete <mobile>" label. Mirrors the `+ add a user` pattern
            below, just in red.
          -->
          <button
            type="button"
            class="group/del text-err inline-flex items-center gap-2 opacity-0 group-hover:opacity-100"
            onclick={() => remove(item.mobile)}
            aria-label="delete {formatAuMobile(item.mobile)}"
          >
            <span class="text-[24px] leading-none">×</span>
            <span class="opacity-0 transition-opacity group-hover/del:opacity-100">delete</span>
          </button>
        {/if}
      </li>
    {/each}
  </ul>

  <div class="mt-[1.45em]">
    {#if !adding}
      <button
        type="button"
        class="group text-fg-faint hover:text-fg inline-flex items-center gap-2"
        onclick={startAdd}
        aria-label="add a user"
      >
        <span class="text-[24px] leading-none">+</span>
        <span class="opacity-0 transition-opacity group-hover:opacity-100">add a user</span>
      </button>
    {:else}
      <form onsubmit={submitAdd} class="flex items-center gap-2">
        <input
          class="tx-input w-72"
          type="tel"
          required
          bind:this={inputEl}
          placeholder="0412 345 678"
          bind:value={newMobile}
          onkeydown={(e) => {
            if (e.key === 'Escape') cancelAdd();
          }}
        />
        <button class="tx-btn" type="submit" disabled={saving || !newMobile.trim()}>
          {saving ? '…' : 'add'}
        </button>
        <button class="tx-btn-ghost" type="button" onclick={cancelAdd}>cancel</button>
      </form>
    {/if}
  </div>

  {#if error}
    <div class="text-err mt-3">{error}</div>
  {/if}
</Page>
