import React from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import AdService from '../services/adService';

// Koşullu import - sadece mobil platformlarda
let BannerAd: any = null;
let BannerAdSize: any = null;

if (Platform.OS !== 'web') {
  try {
    const mobileAds = require('react-native-google-mobile-ads');
    BannerAd = mobileAds.BannerAd;
    BannerAdSize = mobileAds.BannerAdSize;
  } catch (error) {
    console.log('AdMob not available:', error);
  }
}

interface BannerAdComponentProps {
  size?: any;
  style?: any;
}

const BannerAdComponent: React.FC<BannerAdComponentProps> = ({ 
  size,
  style 
}) => {
  // Expo Go'da mock reklam göster
  if (Platform.OS === 'web' || !BannerAd || !BannerAdSize) {
    return (
      <View style={[styles.container, styles.mockAd, style]}>
        <Text style={styles.mockAdText}>📱 Reklam Alanı</Text>
        <Text style={styles.mockAdSubtext}>Development Build'de gerçek reklamlar gösterilir</Text>
      </View>
    );
  }

  // Gerçek reklam göster
  const adService = AdService.getInstance();
  const adUnitId = adService.getBannerAdUnitId();

  return (
    <View style={[styles.container, style]}>
      <BannerAd
        unitId={adUnitId}
        size={size || BannerAdSize.BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  mockAd: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  mockAdText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    textAlign: 'center',
  },
  mockAdSubtext: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 5,
  },
});

export default BannerAdComponent; 