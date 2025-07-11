// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyB2lCU7FxrH5RRLi1HOAYPP6unmFmro9uo",
  authDomain: "tulu-app.firebaseapp.com",
  projectId: "tulu-app",
  storageBucket: "tulu-app.appspot.com",
  messagingSenderId: "62689167247",
  appId: "1:62689167247:web:cd284444e2848d80faadfa",
  measurementId: "G-2M7HKKVL13"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export default app;