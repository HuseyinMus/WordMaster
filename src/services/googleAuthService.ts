import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../config/firebase';

// Web browser'ı tamamla
WebBrowser.maybeCompleteAuthSession();

// Google OAuth 2.0 konfigürasyonu
const GOOGLE_CLIENT_ID = '367754054232-220738cc335aee05f4582d.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = 'GOCSPX-your-secret-here'; // Bu değer client-side'da güvenli değil

const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

export class GoogleAuthService {
  static async signInWithGoogle() {
    try {
      // Auth request oluştur
      const request = new AuthSession.AuthRequest({
        clientId: GOOGLE_CLIENT_ID,
        scopes: ['openid', 'profile', 'email'],
        redirectUri: AuthSession.makeRedirectUri({
          scheme: 'wordmaster'
        }),
        responseType: AuthSession.ResponseType.Code,
        extraParams: {
          access_type: 'offline',
        },
      });

      // Auth session başlat
      const result = await request.promptAsync(discovery);

      if (result.type === 'success') {
        // Authorization code'u access token'a çevir
        const tokenResult = await AuthSession.exchangeCodeAsync(
          {
            clientId: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET,
            code: result.params.code,
            redirectUri: AuthSession.makeRedirectUri({
              scheme: 'wordmaster'
            }),
            extraParams: {
              code_verifier: request.codeVerifier || '',
            },
          },
          discovery
        );

        // Firebase credential oluştur
        const credential = GoogleAuthProvider.credential(
          tokenResult.accessToken,
          tokenResult.idToken
        );

        // Firebase ile giriş yap
        const userCredential = await signInWithCredential(auth, credential);
        
        return {
          success: true,
          user: userCredential.user,
          message: 'Google ile giriş başarılı!'
        };
      } else {
        return {
          success: false,
          message: 'Google giriş işlemi iptal edildi'
        };
      }
    } catch (error: any) {
      console.error('Google sign in error:', error);
      
      let errorMessage = 'Google ile giriş yapılırken bir hata oluştu';
      
      if (error.message.includes('popup_closed')) {
        errorMessage = 'Google giriş penceresi kapatıldı';
      } else if (error.message.includes('network')) {
        errorMessage = 'Ağ bağlantısı hatası';
      }
      
      return {
        success: false,
        message: errorMessage
      };
    }
  }

  // Google Sign-In'in kullanılabilir olup olmadığını kontrol et
  static isAvailable() {
    return true; // Expo ile her zaman kullanılabilir
  }
} 