import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

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
try {
  if (Platform.OS !== 'web') {
    // Mobil ortam (React Native) - persistence ile
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
  } else {
    // Web ortamı
    auth = getAuth(app);
  }
} catch (error) {
  console.warn('Auth initialization error, using default:', error);
  auth = getAuth(app);
}

// Firestore servisini export et
export const db = getFirestore(app);
export { auth };

export default app; 