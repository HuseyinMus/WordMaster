import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert, Platform } from 'react-native';
import AdService from '../services/adService';

// Koşullu import - sadece mobil platformlarda
let RewardedAd: any = null;
let RewardedAdEventType: any = null;

if (Platform.OS !== 'web') {
  try {
    const mobileAds = require('react-native-google-mobile-ads');
    RewardedAd = mobileAds.RewardedAd;
    RewardedAdEventType = mobileAds.RewardedAdEventType;
  } catch (error) {
    console.log('AdMob not available:', error);
  }
}

interface RewardedAdButtonProps {
  title: string;
  rewardDescription: string;
  onRewardEarned: () => void;
  style?: any;
  disabled?: boolean;
}

const RewardedAdButton: React.FC<RewardedAdButtonProps> = ({
  title,
  rewardDescription,
  onRewardEarned,
  style,
  disabled = false
}) => {
  const [loading, setLoading] = useState(false);
  const adService = AdService.getInstance();

  const handleShowRewardedAd = async () => {
    if (disabled || loading) return;

    // Web platformunda reklamları gösterme
    if (Platform.OS === 'web') {
      Alert.alert(
        'Web Platformu',
        'Ödüllü reklamlar sadece mobil uygulamalarda kullanılabilir.',
        [{ text: 'Tamam' }]
      );
      return;
    }

    setLoading(true);
    
    try {
      const result = await adService.showRewardedAd();
      
      if (result.rewarded) {
        Alert.alert(
          '🎉 Ödül Kazandınız!',
          rewardDescription,
          [
            {
              text: 'Tamam',
              onPress: onRewardEarned
            }
          ]
        );
      } else {
        Alert.alert(
          'Reklam İzlenmedi',
          'Ödül kazanmak için reklamı tamamen izlemeniz gerekiyor.',
          [{ text: 'Tamam' }]
        );
      }
    } catch (error) {
      console.error('Rewarded ad error:', error);
      Alert.alert(
        'Hata',
        'Reklam yüklenirken bir hata oluştu. Lütfen tekrar deneyin.',
        [{ text: 'Tamam' }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        style,
        disabled && styles.disabledButton,
        loading && styles.loadingButton
      ]}
      onPress={handleShowRewardedAd}
      disabled={disabled || loading}
    >
      <Text style={[
        styles.buttonText,
        disabled && styles.disabledButtonText,
        loading && styles.loadingButtonText
      ]}>
        {loading ? '⏳ Yükleniyor...' : title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#ff6b35',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  loadingButton: {
    backgroundColor: '#ffa366',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButtonText: {
    color: '#999',
  },
  loadingButtonText: {
    color: 'white',
  },
});

export default RewardedAdButton; 