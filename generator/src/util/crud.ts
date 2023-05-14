import { Adventure } from "./types.js";
import { getFirestore } from "firebase-admin/firestore";

import admin from "firebase-admin";

import { getStorage } from "firebase-admin/storage";

import serviceAccount from "../../.firebase/firebase_key.json" assert { type: "json" };

let service: admin.ServiceAccount = {
  projectId: serviceAccount.project_id,
  clientEmail: serviceAccount.client_email,
  privateKey: serviceAccount.private_key,
};
//console.log(service);
admin.initializeApp({
  credential: admin.credential.cert(service),
  storageBucket: "adventure-gpt-bfb3c.appspot.com",
});

const db = getFirestore();

const imageStorage = getStorage().bucket();

export const saveAdventure = async (adventure: Adventure, thumbnail: Blob) => {
  const storageRef = imageStorage.file(
    `thumbnails/${adventure.title.replace(/\s/g, "")}.png`
  );

  const buffer = Buffer.from(await thumbnail.arrayBuffer());
  await storageRef.save(buffer, {
    contentType: "image/png",
  });

  await storageRef.makePublic();
  const docRef = db.collection("adventures").doc(adventure.title);
  adventure.thumbnail = storageRef.publicUrl();
  await docRef.set(adventure);
};

export const getAdventures = async () => {
  let docs = await db.collection("adventures").get();
  return docs.docs.map((doc) => {
    return doc.data() as Adventure;
  });
};
