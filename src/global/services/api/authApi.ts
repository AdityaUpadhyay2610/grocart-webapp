import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { ref, get, set } from 'firebase/database';
import { auth, database as db } from '@global/config/firebaseConfig';
import { UserProfile, UserRole } from '@global/models';

export const authApi = {
  loginUser: async (email: string, password: string): Promise<UserProfile> => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const uid = credential.user.uid;
    const userRef = ref(db, `users/${uid}`);
    const snapshot = await get(userRef);

    if (!snapshot.exists()) {
      throw new Error('User profile does not exist in database.');
    }

    const val = snapshot.val();
    return {
      uid,
      name: val.name || '',
      email: val.email || credential.user.email || '',
      role: val.role as UserRole,
      storeName: val.storeName,
      phoneNumber: val.phoneNumber,
      address: val.address,
      avatarStyle: val.avatarStyle,
      avatarSeed: val.avatarSeed,
      avatarUrl: val.avatarUrl,
      createdAt: val.createdAt || Date.now(),
    };
  },

  registerUser: async (email: string, password: string, name: string, role: UserRole, storeName?: string): Promise<UserProfile> => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = credential.user.uid;
    const profile: UserProfile = {
      uid,
      name,
      email,
      role,
      storeName: storeName || '',
      createdAt: Date.now(),
    };

    await set(ref(db, `users/${uid}`), profile);
    return profile;
  },

  logoutUser: async (): Promise<void> => {
    await signOut(auth);
  },

  updateProfile: async (uid: string, updates: Partial<UserProfile>): Promise<void> => {
    const userRef = ref(db, `users/${uid}`);
    const snapshot = await get(userRef);
    if (!snapshot.exists()) {
      throw new Error('User profile does not exist.');
    }
    const currentData = snapshot.val();
    await set(userRef, { ...currentData, ...updates });
  },

  fetchUserProfile: async (uid: string): Promise<UserProfile> => {
    const userRef = ref(db, `users/${uid}`);
    const snapshot = await get(userRef);
    if (!snapshot.exists()) {
      throw new Error('User profile does not exist in database.');
    }
    const val = snapshot.val();
    return {
      uid,
      name: val.name || '',
      email: val.email || '',
      role: val.role as UserRole,
      storeName: val.storeName,
      phoneNumber: val.phoneNumber,
      address: val.address,
      avatarStyle: val.avatarStyle,
      avatarSeed: val.avatarSeed,
      avatarUrl: val.avatarUrl,
      createdAt: val.createdAt || Date.now(),
    };
  }
};
