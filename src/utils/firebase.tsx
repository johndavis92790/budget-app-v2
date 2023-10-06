import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyC1m-0W2dZ4hNpf-g56vTy82xqOo9Pk9QM",
  authDomain: "budget-app-v2-b07f3.firebaseapp.com",
  projectId: "budget-app-v2-b07f3",
  storageBucket: "budget-app-v2-b07f3.appspot.com",
  messagingSenderId: "247161623964",
  appId: "1:247161623964:web:698d9098daeb9378c76459",
  measurementId: "G-JKFQK3VXXC"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const functions = getFunctions(app);