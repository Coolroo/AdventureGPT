import { Adventure } from "./types.js";
import { getFirestore } from "firebase-admin/firestore";

import admin from "firebase-admin";

import serviceAccount from "../../.firebase/firebase_key.json" assert { type: "json" };

let service: admin.ServiceAccount = {
  projectId: serviceAccount.project_id,
  clientEmail: serviceAccount.client_email,
  privateKey: serviceAccount.private_key,
};
//console.log(service);
admin.initializeApp({
  credential: admin.credential.cert(service),
});

const db = getFirestore();

export const saveAdventure = async (adventure: Adventure) => {
  const docRef = db.collection("adventures").doc(adventure.title);

  await docRef.set(adventure);
};

export const getAdventures = async () => {
  let docs = await db.collection("adventures").get();
  return docs.docs.map((doc) => {
    return doc.data() as Adventure;
  });
};
