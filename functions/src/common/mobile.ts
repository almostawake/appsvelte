/**
 * Australian mobile numbers, normalised to E.164 (+614XXXXXXXX).
 *
 * One shared implementation because several places have to agree on the
 * exact string, and a mismatch fails silently in the worst way: the user
 * receives a code, types it correctly, signs in — and is then bounced as
 * "not on the list" because the whitelist doc id was stored in a different
 * shape from the `phone_number` claim Firebase puts in the ID token.
 *
 * The same rule is implemented twice more outside TypeScript, because both
 * run before this file exists in a new project: `normalize_au_mobile` in
 * the `n` installer (seeds the first whitelist row at provisioning) and
 * cmd-seed-user.mjs (seeds it into the emulator). Change one, change all
 * three.
 *
 * Only 04 mobiles are accepted. Landlines can't receive an SMS, so taking
 * one would put a row on the whitelist that can never sign in.
 */
export function normalizeAuMobile(input: string): string | null {
  const digits = input.replace(/\D/g, '');
  const local = digits.startsWith('61')
    ? digits.slice(2)
    : digits.startsWith('0')
      ? digits.slice(1)
      : digits;
  return /^4\d{8}$/.test(local) ? `+61${local}` : null;
}

/** Display form — +61412345678 reads back as the 0412 345 678 people know. */
export function formatAuMobile(e164: string): string {
  const m = /^\+61(4\d{2})(\d{3})(\d{3})$/.exec(e164);
  return m ? `0${m[1]} ${m[2]} ${m[3]}` : e164;
}
