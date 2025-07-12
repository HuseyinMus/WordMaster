import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import { Alert } from 'react-native';
import { auth } from '../config/firebase';
import { FirebaseService } from '../services/firebaseService';
import { GoogleAuthService } from '../services/googleAuthService';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  authLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ success: boolean; message: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; message: string }>;
  signOut: () => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
  clearAuthError: () => void;
  authError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Firebase auth state değişikliklerini dinle
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser?.email);
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Kullanıcı verilerini Firestore'dan al
          const userData = await FirebaseService.getUser(firebaseUser.uid);
          
          if (userData) {
            console.log('Existing user found:', userData.displayName);
            setUser(userData);
          } else {
            console.log('Creating new user profile');
            // Yeni kullanıcı - veritabanında kayıt yok
            const newUser: User = {
              uid: firebaseUser.uid,
              email: firebaseUser.email!,
              displayName: firebaseUser.displayName || firebaseUser.email!.split('@')[0],
              photoURL: firebaseUser.photoURL || null,
              dailyGoal: 5,
              level: 1,
              xp: 0,
              streak: 0,
              totalWordsLearned: 0,
              createdAt: new Date()
            };
            
            await FirebaseService.createUser(newUser);
            setUser(newUser);
            
            // Örnek kelimeler ekle
            await FirebaseService.addSampleWords(firebaseUser.uid);
            // Ek kelimeler ekle
            await FirebaseService.addExtraWords(firebaseUser.uid);
            console.log('New user profile created successfully');
          }
        } catch (error) {
          console.error('Error loading user data:', error);
          setAuthError('Kullanıcı verileri yüklenirken hata oluştu');
        }
      } else {
        setUser(null);
        console.log('User signed out');
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Hata mesajlarını temizle
  const clearAuthError = () => {
    setAuthError(null);
  };

  // Giriş yapma fonksiyonu
  const signIn = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    setAuthLoading(true);
    setAuthError(null);
    
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('Sign in successful:', result.user.email);
      return { success: true, message: 'Giriş başarılı!' };
    } catch (error: any) {
      console.error('Sign in error:', error);
      let errorMessage = 'Giriş yapılırken bir hata oluştu';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Şifre yanlış';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Geçersiz e-posta adresi';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Çok fazla başarısız deneme. Lütfen daha sonra tekrar deneyin';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Bu hesap devre dışı bırakılmış';
          break;
        default:
          errorMessage = 'Giriş yapılırken bir hata oluştu';
      }
      
      setAuthError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setAuthLoading(false);
    }
  };

  // Kayıt olma fonksiyonu
  const signUp = async (email: string, password: string, displayName: string): Promise<{ success: boolean; message: string }> => {
    setAuthLoading(true);
    setAuthError(null);
    
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      if (result.user) {
        // Kullanıcı profilini güncelle
        await updateProfile(result.user, { displayName });
        
        // Veritabanına kullanıcı kaydı
        const newUser: User = {
          uid: result.user.uid,
          email: result.user.email!,
          displayName,
          photoURL: null,
          dailyGoal: 5,
          level: 1,
          xp: 0,
          streak: 0,
          totalWordsLearned: 0,
          createdAt: new Date()
        };
        
        await FirebaseService.createUser(newUser);
        
        // Örnek kelimeler ekle
        await FirebaseService.addSampleWords(result.user.uid);
        // Ek kelimeler ekle
        await FirebaseService.addExtraWords(result.user.uid);
        
        console.log('Sign up successful:', result.user.email);
        return { success: true, message: 'Hesabınız başarıyla oluşturuldu!' };
      }
      
      return { success: false, message: 'Kayıt işlemi başarısız' };
    } catch (error: any) {
      console.error('Sign up error:', error);
      let errorMessage = 'Kayıt olurken bir hata oluştu';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Bu e-posta adresi zaten kullanılıyor';
          break;
        case 'auth/weak-password':
          errorMessage = 'Şifre çok zayıf. En az 6 karakter olmalıdır';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Geçersiz e-posta adresi';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'E-posta/şifre girişi etkin değil';
          break;
        default:
          errorMessage = 'Kayıt olurken bir hata oluştu';
      }
      
      setAuthError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setAuthLoading(false);
    }
  };

  // Google ile giriş fonksiyonu
  const signInWithGoogle = async (): Promise<{ success: boolean; message: string }> => {
    setAuthLoading(true);
    setAuthError(null);
    
    try {
      if (!GoogleAuthService.isAvailable()) {
        return { success: false, message: 'Google Sign-In bu cihazda kullanılamıyor' };
      }

      const result = await GoogleAuthService.signInWithGoogle();
      
      if (result.success) {
        console.log('Google sign in successful:', result.user?.email);
        return { success: true, message: result.message };
      } else {
        setAuthError(result.message);
        return { success: false, message: result.message };
      }
    } catch (error: any) {
      console.error('Google sign in error:', error);
      const errorMessage = 'Google ile giriş yapılırken bir hata oluştu';
      setAuthError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setAuthLoading(false);
    }
  };

  // Çıkış yapma fonksiyonu
  const signOut = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
      console.log('Sign out successful');
    } catch (error: any) {
      console.error('Sign out error:', error);
      setAuthError('Çıkış yapılırken bir hata oluştu');
    }
  };

  // Kullanıcı profilini güncelleme
  const updateUserProfile = async (updates: Partial<User>): Promise<void> => {
    if (!user) return;
    
    try {
      await FirebaseService.updateUser(user.uid, updates);
      setUser({ ...user, ...updates });
    } catch (error: any) {
      console.error('Update profile error:', error);
      setAuthError('Profil güncellenirken bir hata oluştu');
    }
  };

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    authLoading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    updateUserProfile,
    clearAuthError,
    authError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 