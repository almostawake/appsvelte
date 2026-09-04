# What this app does

This file is the app's functional state: the first read of any feature session,
and part of any commit that changes behaviour. Keep entries short — what it
does, where it lives, what data it touches.

## Built and working

- **`/` — the public app.** Placeholder home page with a top nav bar
  (`AppHeader`): visitors see a "sign in" link top right; signed-in
  whitelisted users see the admin menu top left and their mobile top right.
  No auth gate — visitors stay anonymous and make no Firestore writes
  (Firebase Auth initializes on `/` only to *read* session state). New
  features go here unless the user says otherwise.
- **`/admin` — whitelist management.** Signed-in users manage the `users`
  collection (doc id = E.164 mobile, e.g. `+61412345678`). Presence on the
  list is what grants sign-in; anyone on it can add/remove anyone (users
  manage users, no separate admin tier).
- **Sign-in plumbing.** `/login` only — enter a mobile, get a six-digit code
  by SMS, enter it. Both steps live on that one route (there is no link to
  land on, so nothing like the old `/auth/action`). SMS only — no passwords,
  no email, no OAuth. The shared top bar (`AppHeader.svelte`) links to
  `/login` and owns the signed-in menu/sign-out. How it works:
  docs/CLAUDE-AUTH.md.
- **`api` Cloud Function.** The single inbound HTTP endpoint for external
  callers (webhooks, server-to-server), gated by a bearer secret in
  `functions/.env`. No app-specific routes yet. Conventions: docs/CLAUDE-API.md.

## Features

*None yet.*

<!-- Entry format — add one per shipped feature:
### <Name> — <one line: what it does for the user>
- Screens: routes involved
- Data: @collection paths touched
- Functions/API: callables or api routes added
- Notes: anything a future session must know that the code doesn't show
-->
