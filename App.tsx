import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, Platform, SafeAreaView } from 'react-native';
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { ADMOB_CONFIG } from './src/config/admob';

// Koşullu import - sadece mobil platformlarda
let mobileAds: any = null;
let MaxAdContentRating: any = null;

if (Platform.OS !== 'web') {
  try {
    const mobileAdsModule = require('react-native-google-mobile-ads');
    mobileAds = mobileAdsModule.default;
    MaxAdContentRating = mobileAdsModule.MaxAdContentRating;
  } catch (error) {
    console.log('AdMob not available:', error);
  }
}

export default function App() {
  useEffect(() => {
    // AdMob'u başlat (sadece mobil platformlarda)
    const initializeAds = async () => {
      if (Platform.OS === 'web' || !mobileAds || !MaxAdContentRating) {
        console.log('AdMob disabled on web platform or not available');
        return;
      }

      try {
        await mobileAds().initialize();
        console.log('AdMob initialized successfully');
        
        // Test cihazları ekle (geliştirme aşamasında)
        await mobileAds().setRequestConfiguration({
          maxAdContentRating: MaxAdContentRating.PG,
          tagForChildDirectedTreatment: false,
          tagForUnderAgeOfConsent: false,
        });
        
        console.log('AdMob request configuration set');
        
        // Production modunda gerçek reklamları kullan
        const AdService = require('./src/services/adService').default;
        const adService = AdService.getInstance();
        adService.setTestMode(false);
        console.log('AdMob production mode enabled');
      } catch (error) {
        console.error('AdMob initialization error:', error);
      }
    };

    initializeAds();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#667eea" />
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
