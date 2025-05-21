// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDKxm2rzvjgsxfg1vJ6ZgzPJRPfY3R7HR4",
  authDomain: "phoenix-energy-firebase.firebaseapp.com",
  projectId: "phoenix-energy-firebase",
  storageBucket: "phoenix-energy-firebase.firebasestorage.app",
  messagingSenderId: "82665667347",
  appId: "1:82665667347:web:a6dab9227aa655573638e6",
  measurementId: "G-1CQS4L7V4Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);