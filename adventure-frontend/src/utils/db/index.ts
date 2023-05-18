import { FirebaseOptions, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD4y8e-hX2qJHVO1dWnKSEOOEiptHR0Fx4",
  authDomain: "adventure-gpt-bfb3c.firebaseapp.com",
  projectId: "adventure-gpt-bfb3c",
  storageBucket: "adventure-gpt-bfb3c.appspot.com",
  messagingSenderId: "319167469235",
  appId: "1:319167469235:web:e791febc8379aff39782c6",
};
export const app = initializeApp(firebaseConfig);
export const database = getFirestore(app);
