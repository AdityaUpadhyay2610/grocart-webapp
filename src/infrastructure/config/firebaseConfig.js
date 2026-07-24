import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCoUnOWWFM0Z1php5g_q2ER5ccglIxbqIE",
  authDomain: "groceryapp-7ad95.firebaseapp.com",
  databaseURL: "https://groceryapp-7ad95-default-rtdb.firebaseio.com",
  projectId: "groceryapp-7ad95",
  storageBucket: "groceryapp-7ad95.firebasestorage.app",
  messagingSenderId: "710025426935"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
