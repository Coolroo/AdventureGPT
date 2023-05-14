import { Adventure } from "./types.js";

const {
  initializeApp,
  applicationDefault,
  cert,
} = require("firebase-admin/app");
const {
  getFirestore,
  Timestamp,
  FieldValue,
} = require("firebase-admin/firestore");

var admin = require("firebase-admin");

var serviceAccount = require("./.firebase/firebase_key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

initializeApp();

const db = getFirestore();

export const saveAdventure = async (adventure: Adventure) => {
  const docRef = db.collection("adventures").doc(adventure.title);

  await docRef.set(adventure);
};
