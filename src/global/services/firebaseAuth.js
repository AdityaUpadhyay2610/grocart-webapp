import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendEmailVerification, 
  updateProfile as firebaseUpdateProfile, 
  onAuthStateChanged as firebaseOnAuthStateChanged
} from "firebase/auth";
import { auth } from "@global/config/firebaseConfig";

export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

export const register = async (username, email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update display name
    await firebaseUpdateProfile(user, { displayName: username });
    
    // Send email verification
    try {
      await sendEmailVerification(user);
    } catch (err) {
      console.warn("Failed to send verification email:", err);
    }
    
    return { user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

export const resendVerificationEmail = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error("No user is currently logged in.");
  await sendEmailVerification(user);
};

export const updateProfile = async (displayName) => {
  const user = auth.currentUser;
  if (!user) throw new Error("No user is currently logged in.");
  await firebaseUpdateProfile(user, { displayName });
  return user;
};

export const refreshUser = async () => {
  const user = auth.currentUser;
  if (user) {
    await user.reload();
    return auth.currentUser;
  }
  return null;
};

export const onAuthStateChange = (callback) => {
  return firebaseOnAuthStateChanged(auth, callback);
};
