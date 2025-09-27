
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  "projectId": "studio-6906438855-8df19",
  "appId": "1:1000546259217:web:2a102323d000ed1825fcb0",
  "apiKey": process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  "authDomain": "studio-6906438855-8df19.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "1000546259217"
};

let app: FirebaseApp;

const getFirebaseApp = () => {
    if (typeof window === 'undefined') {
        return null;
    }
    if (!getApps().length) {
        app = initializeApp(firebaseConfig);
    } else {
        app = getApp();
    }
    return app;
}

export const getFirebaseAuth = (): Auth | null => {
    const app = getFirebaseApp();
    return app ? getAuth(app) : null;
}

export const getFirestoreDb = (): Firestore | null => {
    const app = getFirebaseApp();
    return app ? getFirestore(app) : null;
}
