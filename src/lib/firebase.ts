
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  "projectId": "studio-6906438855-8df19",
  "appId": "1:1000546259217:web:2a102323d000ed1825fcb0",
  "apiKey": process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  "authDomain": "studio-6906438855-8df19.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "1000546259217"
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (typeof window !== 'undefined' && !getApps().length) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} else if (getApps().length > 0) {
  app = getApp();
  auth = getAuth(app);
  db = getFirestore(app);
}

// @ts-ignore
export { app, auth, db };
