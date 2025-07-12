import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';

const { width, height } = Dimensions.get('window');

const AuthScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const { 
    signIn, 
    signUp, 
    signInWithGoogle, 
    authLoading, 
    authError, 
    clearAuthError 
  } = useAuth();

  // Animasyon efekti
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  // Form değişikliklerinde hata mesajını temizle
  useEffect(() => {
    if (authError) {
      clearAuthError();
    }
  }, [email, password, displayName]);

  // E-posta validasyonu
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Şifre validasyonu
  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  // Form validasyonu
  const validateForm = () => {
    if (!email.trim()) {
      return { isValid: false, message: 'E-posta adresi gereklidir' };
    }
    
    if (!validateEmail(email)) {
      return { isValid: false, message: 'Geçerli bir e-posta adresi girin' };
    }
    
    if (!password.trim()) {
      return { isValid: false, message: 'Şifre gereklidir' };
    }
    
    if (!validatePassword(password)) {
      return { isValid: false, message: 'Şifre en az 6 karakter olmalıdır' };
    }
    
    if (!isLogin && !displayName.trim()) {
      return { isValid: false, message: 'Ad soyad gereklidir' };
    }
    
    if (!isLogin && displayName.trim().length < 2) {
      return { isValid: false, message: 'Ad soyad en az 2 karakter olmalıdır' };
    }
    
    return { isValid: true, message: '' };
  };

  // Giriş/Kayıt işlemi
  const handleAuth = async () => {
    const validation = validateForm();
    if (!validation.isValid) {
      return;
    }

    try {
      let result;
      
      if (isLogin) {
        result = await signIn(email.trim(), password);
      } else {
        result = await signUp(email.trim(), password, displayName.trim());
      }
      
      if (result.success) {
        // Başarılı işlem - AuthContext otomatik olarak yönlendirecek
        console.log(result.message);
      }
    } catch (error) {
      console.error('Auth error:', error);
    }
  };

  // Google ile giriş
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithGoogle();
      if (!result.success) {
        console.log(result.message);
      }
    } catch (error) {
      console.error('Google sign in error:', error);
    }
  };

  // Form temizleme
  const clearForm = () => {
    setEmail('');
    setPassword('');
    setDisplayName('');
    setShowPassword(false);
    clearAuthError();
  };

  // Giriş/Kayıt modu değiştirme
  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    clearForm();
  };

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2', '#f093fb']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Text style={styles.logo}>WM</Text>
              </View>
              <Text style={styles.title}>WordMaster</Text>
              <Text style={styles.subtitle}>
                {isLogin 
                  ? 'Hesabına giriş yap ve öğrenmeye başla' 
                  : 'Yeni hesap oluştur ve kelime yolculuğuna başla'
                }
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Ad Soyad (Sadece kayıt modunda) */}
              {!isLogin && (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Ad Soyad</Text>
                  <TextInput
                    style={styles.input}
                    value={displayName}
                    onChangeText={setDisplayName}
                    placeholder="Adınızı ve soyadınızı girin"
                    placeholderTextColor="#999"
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                </View>
              )}

              {/* E-posta */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>E-posta</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="E-posta adresinizi girin"
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                />
              </View>

              {/* Şifre */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Şifre</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Şifrenizi girin"
                    placeholderTextColor="#999"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="password"
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Text style={styles.eyeText}>
                      {showPassword ? 'Gizle' : 'Göster'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Hata Mesajı */}
              {authError && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{authError}</Text>
                </View>
              )}

              {/* Giriş/Kayıt Butonu */}
              <TouchableOpacity
                style={[styles.primaryButton, authLoading && styles.buttonDisabled]}
                onPress={handleAuth}
                disabled={authLoading}
              >
                {authLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    {isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
                  </Text>
                )}
              </TouchableOpacity>

              {/* Ayırıcı */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>veya</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Google Butonu */}
              <TouchableOpacity
                style={[styles.googleButton, authLoading && styles.buttonDisabled]}
                onPress={handleGoogleSignIn}
                disabled={authLoading}
              >
                <Text style={styles.googleButtonText}>Google ile Giriş Yap</Text>
              </TouchableOpacity>

              {/* Mod Değiştirme */}
              <TouchableOpacity
                style={styles.switchButton}
                onPress={toggleAuthMode}
                disabled={authLoading}
              >
                <Text style={styles.switchText}>
                  {isLogin 
                    ? 'Hesabın yok mu? Kayıt ol' 
                    : 'Zaten hesabın var mı? Giriş yap'
                  }
                </Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Kelime öğrenme yolculuğuna başla!
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    minHeight: height,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  form: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 25,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 15,
    },
    shadowOpacity: 0.4,
    shadowRadius: 25,
    elevation: 15,
  },
  inputContainer: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    padding: 18,
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  passwordInput: {
    flex: 1,
    padding: 18,
    fontSize: 16,
  },
  eyeButton: {
    padding: 18,
    paddingLeft: 10,
  },
  eyeText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#fee',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#fcc',
  },
  errorText: {
    color: '#c33',
    fontSize: 14,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: '#667eea',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    marginTop: 15,
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e9ecef',
  },
  dividerText: {
    marginHorizontal: 15,
    color: '#666',
    fontSize: 14,
  },
  googleButton: {
    backgroundColor: '#4285f4',
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#4285f4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  googleButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  switchButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    marginTop: 30,
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default AuthScreen; 