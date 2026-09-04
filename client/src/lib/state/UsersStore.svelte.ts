import { collection, onSnapshot, doc, setDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import type { User as FbUser } from 'firebase/auth';
import { getFirebase } from '$lib/firebase/init';
import { userSchema, type User } from '$common/User';
import { normalizeAuMobile } from '$common/mobile';

class UsersStore {
  users = $state<User[]>([]);
  loaded = $state(false);
  error = $state<string | null>(null);
  private unsub: (() => void) | null = null;

  start = () => {
    if (this.unsub) return;
    const { db } = getFirebase();
    const q = query(collection(db, 'users'), orderBy('addedAt', 'asc'));
    this.unsub = onSnapshot(
      q,
      (snap) => {
        this.users = snap.docs.map((d) => userSchema.parse(d.data()));
        this.loaded = true;
      },
      (err) => {
        this.error = err.message;
        this.loaded = true;
      },
    );
  };

  stop = () => {
    this.unsub?.();
    this.unsub = null;
  };

  // Normalise before writing: the doc id has to match the phone_number
  // claim exactly or the invited person signs in and is bounced as "not
  // on the list" — the one failure mode worth spending a line to prevent.
  add = async (mobile: string, addedBy: string) => {
    const e164 = normalizeAuMobile(mobile);
    if (!e164) throw new Error('Not an Australian mobile — like 0412 345 678');
    const { db } = getFirebase();
    await setDoc(
      doc(db, 'users', e164),
      userSchema.parse({
        mobile: e164,
        admin: true,
        addedAt: Date.now(),
        addedBy,
      } satisfies User),
    );
  };

  remove = async (mobile: string) => {
    const { db } = getFirebase();
    await deleteDoc(doc(db, 'users', mobile));
  };

  // Called once per successful sign-in. Enriches the existing whitelist
  // row with the now-available Firebase uid and the current sign-in
  // timestamp. setDoc with merge so we don't clobber `admin`, `addedBy`.
  recordSignIn = async (user: FbUser) => {
    if (!user.phoneNumber) return;
    const { db } = getFirebase();
    await setDoc(
      doc(db, 'users', user.phoneNumber),
      { uid: user.uid, lastSignInAt: Date.now() },
      { merge: true },
    );
  };
}

export const usersStore = new UsersStore();
