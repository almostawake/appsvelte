import { z } from 'zod';

/**
 * @collection grants/{email}
 *
 * Per-user record of a Google OAuth permission grant — the refresh token
 * and metadata captured when a user clicks the /consent link, signs in to
 * Google, and clicks "Allow" on the consent screen.
 *
 * Keyed by the lowercased email on the Google identity token returned by
 * the consent flow — deliberately NOT the app's own sign-in identity,
 * which is a mobile number (`/users/{e164Mobile}`). The two are separate
 * on purpose: you sign in to this app by SMS, but you grant Google access
 * as whichever Google account you pick on the consent screen. Anyone who
 * can sign in can also grant; this doc is where the resulting credentials
 * land.
 *
 * Doc presence == "this user has granted us Google access at least once."
 *
 * Security: never client-readable. Default-deny in firestore.rules covers
 * the /grants collection — only the Admin SDK (Cloud Functions) reads or
 * writes it. Refresh tokens are credentials and must never leave the
 * server.
 */
export const grantSchema = z.object({
  email: z.email(),
  provider: z.literal('google'),
  refreshToken: z.string().nullable(),
  accessToken: z.string(),
  expiresAt: z.number(),
  scopes: z.array(z.string()),
  grantedAt: z.number(),
});

export type Grant = z.infer<typeof grantSchema>;
