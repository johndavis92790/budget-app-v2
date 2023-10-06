// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC1m-0W2dZ4hNpf-g56vTy82xqOo9Pk9QM",
  authDomain: "budget-app-v2-b07f3.firebaseapp.com",
  projectId: "budget-app-v2-b07f3",
  storageBucket: "budget-app-v2-b07f3.appspot.com",
  messagingSenderId: "247161623964",
  appId: "1:247161623964:web:698d9098daeb9378c76459",
  measurementId: "G-JKFQK3VXXC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);