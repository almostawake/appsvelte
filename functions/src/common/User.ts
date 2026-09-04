import { z } from 'zod';

/**
 * @collection users/{e164Mobile}
 *
 * One row per signed-in user. Doc presence == "may sign in to /admin".
 *
 * Doc id is the E.164 mobile (+614XXXXXXXX) — it must match the
 * `phone_number` claim Firebase Auth puts in the ID token character for
 * character, because that's what the Firestore rule compares against.
 * Normalise every number through `normalizeAuMobile` before it becomes a
 * doc id; never store what the user typed.
 *
 * Fields are split into two phases:
 *  - Invite time: { mobile, admin, addedAt, addedBy } — written by
 *    /admin add or the bootstrap seed.
 *  - First sign-in onwards: { uid, lastSignInAt } get filled in (and
 *    `lastSignInAt` refreshed on every subsequent sign-in).
 *
 * `admin: true` on every row today — every user IS an admin. The
 * field exists for explicit visibility in the Firestore console and
 * to future-proof for non-admin user records later.
 */
export const userSchema = z.object({
  mobile: z.string().regex(/^\+614\d{8}$/),
  admin: z.boolean(),
  addedAt: z.number(),
  addedBy: z.string(),
  uid: z.string().optional(),
  lastSignInAt: z.number().optional(),
});

export type User = z.infer<typeof userSchema>;
