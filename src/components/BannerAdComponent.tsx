import React from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import AdService from '../services/adService';

interface BannerAdComponentProps {
  size?: any;
  style?: any;
}

const BannerAdComponent: React.FC<BannerAdComponentProps> = ({ 
  size,
  style 
}) => {
  // Tüm platformlarda mock reklam göster (AdMob kaldırıldığı için)
  return (
    <View style={[styles.container, styles.mockAd, style]}>
      <Text style={styles.mockAdText}>📱 Reklam Alanı</Text>
      <Text style={styles.mockAdSubtext}>Reklam sistemi geçici olarak devre dışı</Text>
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