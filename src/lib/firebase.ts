
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  "projectId": "studio-6906438855-8df19",
  "appId": "1:1000546259217:web:2a102323d000ed1825fcb0",
  "apiKey": "AIzaSyAViBcZPMhYlqcTh749Rxvrg7sQHho0Ubo",
  "authDomain": "studio-6906438855-8df19.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "1000546259217"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
