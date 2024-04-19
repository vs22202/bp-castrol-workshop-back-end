// https://firebase.google.com/docs/web/setup#available-libraries
import { FirebaseError, initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL, listAll, deleteObject } from "firebase/storage";

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

// Function to delete a file from Firebase Storage
export async function deleteFileFromStorage(fileUrl: string) {
    try {
        const filePath = extractFilePath(fileUrl);
        const fileRef = ref(storage, filePath);

        // Delete the file
        await deleteObject(fileRef);
        console.log(`File ${filePath} successfully deleted.`);
    } catch (error) {
        console.error('Error deleting file:', error);
    }
}

function extractFilePath(downloadUrl: string): string {
    // Remove the protocol and domain part of the URL
    const pathStartIndex = downloadUrl.indexOf('/o/');
    const filePathEncoded = downloadUrl.substring(pathStartIndex + 3); // Adding 3 to exclude '/o/' itself

    // Decode the path component
    const decodedPath = decodeURIComponent(filePathEncoded);

    // Replace %20 with space
    const filePathWithSpace = decodedPath.replace(/%20/g, ' ');

    // Replace %2F with /
    const filePathWithSlash = filePathWithSpace.replace(/%2F/g, '/');

    // Extract the filename from the path
    const filenameStartIndex = filePathWithSlash.lastIndexOf('/') + 1;
    let filename = filePathWithSlash.substring(filenameStartIndex);

    // Convert filename to lowercase
    filename = filename.toLowerCase();

    // Remove filename from the path to get the directory path
    const directoryPath = filePathWithSlash.substring(0, filenameStartIndex);

    // Remove query parameters from the filename
    const filenameWithoutParams = filename.split('?')[0];

    return directoryPath + filenameWithoutParams;
}
