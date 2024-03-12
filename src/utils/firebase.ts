// Import the functions you need from the SDKs you need
import { readFileSync } from "node:fs";
import { FirebaseError, initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getStorage, ref, uploadBytes, getDownloadURL, listAll } from "firebase/storage";
// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage();

export const uploadFile = async (file: Express.Multer.File): Promise<string> => {
    const storageRef = ref(storage, 'userFiles/' + `${file.originalname}-${Date.now()}`);
    let metadata = { contentType: file.mimetype }
    const snapshot= await uploadBytes(storageRef, file.buffer, metadata);
    return await getDownloadURL(snapshot.ref)

}