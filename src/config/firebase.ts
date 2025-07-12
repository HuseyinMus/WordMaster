import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// import { getReactNativePersistence } from 'firebase/auth/react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { Platform } from 'react-native';

// Firebase konfigürasyonu
const firebaseConfig = {
  apiKey: "AIzaSyB-M7lI_ddEVM33ViKSKnEXsmbONsd-dtM",
  authDomain: "yenibirseyfa.firebaseapp.com",
  projectId: "yenibirseyfa",
  storageBucket: "yenibirseyfa.firebasestorage.app",
  messagingSenderId: "367754054232",
  appId: "1:367754054232:web:220738cc335aee05f4582d",
  measurementId: "G-L7LX4L7JS4"
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);

// Auth servisini platforma göre optimize et
let auth;
if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
  // Mobil ortam (React Native)
  // const { getReactNativePersistence } = require('firebase/auth/react-native');
  // auth = initializeAuth(app, {
  //   persistence: getReactNativePersistence(AsyncStorage)
  // });
  auth = getAuth(app);
} else {
  // Web ve test ortamı
  auth = getAuth(app);
}

// Firestore servisini export et
export const db = getFirestore(app);
export { auth };

export default app; 