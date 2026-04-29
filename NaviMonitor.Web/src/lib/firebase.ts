import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBZJPtfIgRtnxYPQfaq7Pzs41vJDwY8Has",
  authDomain: "navi-monitor.firebaseapp.com",
  projectId: "navi-monitor",
  storageBucket: "navi-monitor.firebasestorage.app",
  messagingSenderId: "711609951499",
  appId: "1:711609951499:web:f5a74274eefd143cbb6e0e",
  measurementId: "G-S24F8PD3EV"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
