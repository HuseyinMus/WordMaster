import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AdService from '../services/adService';

interface RewardedAdComponentProps {
  onRewardEarned?: (reward: { type: string; amount: number }) => void;
  onAdClosed?: () => void;
  onAdError?: (error: string) => void;
  style?: any;
  title?: string;
  description?: string;
  rewardText?: string;
}

const RewardedAdComponent: React.FC<RewardedAdComponentProps> = ({
  onRewardEarned,
  onAdClosed,
  onAdError,
  style,
  title = '🎁 Bonus Kazan',
  description = 'Reklam izleyerek ekstra XP kazan!',
  rewardText = '+50 XP',
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAdReady, setIsAdReady] = useState(false);
  const [adService] = useState(AdService.getInstance());

  useEffect(() => {
    checkAdAvailability();
  }, []);

  const checkAdAvailability = async () => {
    if (Platform.OS === 'web') {
      setIsAdReady(false);
      return;
    }

    // AdMob servisinin hazır olup olmadığını kontrol et
    try {
      // Mock kontrol - gerçek uygulamada adService.isRewardedAdReady() kullanılabilir
      setIsAdReady(true);
    } catch (error) {
      console.log('Rewarded ad not available:', error);
      setIsAdReady(false);
    }
  };

  const showRewardedAd = async () => {
    if (Platform.OS === 'web') {
      // Web platformunda mock ödül ver
      Alert.alert(
        '🎉 Mock Ödül!',
        'Web platformunda gerçek reklam gösterilemez. Mock ödül verildi!',
        [
          {
            text: 'Tamam',
            onPress: () => {
              onRewardEarned?.({ type: 'xp', amount: 50 });
              onAdClosed?.();
            },
          },
        ]
      );
      return;
    }

    if (!isAdReady) {
      Alert.alert('Reklam Hazır Değil', 'Lütfen biraz bekleyin ve tekrar deneyin.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await adService.showRewardedAd();
      
      if (result.rewarded) {
        // Kullanıcı ödülü kazandı
        const reward = { type: 'xp', amount: 50 };
        onRewardEarned?.(reward);
        
        Alert.alert(
          '🎉 Tebrikler!',
          `${rewardText} kazandınız!`,
          [
            {
              text: 'Harika!',
              onPress: () => onAdClosed?.(),
            },
          ]
        );
      } else {
        // Kullanıcı reklamı izlemedi
        Alert.alert(
          'Reklam İzlenmedi',
          'Ödül kazanmak için reklamı tamamen izlemeniz gerekiyor.',
          [
            {
              text: 'Tamam',
              onPress: () => onAdClosed?.(),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error showing rewarded ad:', error);
      onAdError?.(error.message || 'Reklam gösterilirken hata oluştu');
      
      Alert.alert(
        'Hata',
        'Reklam gösterilirken bir hata oluştu. Lütfen tekrar deneyin.',
        [
          {
            text: 'Tamam',
            onPress: () => onAdClosed?.(),
          },
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, styles.mockContainer, style]}>
        <LinearGradient colors={['#FF6B6B', '#FF8E53']} style={styles.gradient}>
          <Text style={styles.mockTitle}>🎁 Mock Ödüllü Reklam</Text>
          <Text style={styles.mockDescription}>
            Web platformunda gerçek reklam gösterilemez
          </Text>
          <TouchableOpacity
            style={styles.mockButton}
            onPress={showRewardedAd}
            disabled={isLoading}
          >
            <Text style={styles.mockButtonText}>Mock Ödül Al</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <LinearGradient colors={['#FF6B6B', '#FF8E53']} style={styles.gradient}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        
        <View style={styles.rewardContainer}>
          <Text style={styles.rewardText}>{rewardText}</Text>
        </View>

        <TouchableOpacity
          style={[styles.button, !isAdReady && styles.disabledButton]}
          onPress={showRewardedAd}
          disabled={isLoading || !isAdReady}
        >
          {isLoading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.buttonText}>
              {isAdReady ? '🎬 Reklam İzle' : '⏳ Hazırlanıyor...'}
            </Text>
          )}
        </TouchableOpacity>

        {!isAdReady && (
          <Text style={styles.readyText}>
            Reklam yükleniyor, lütfen bekleyin...
          </Text>
        )}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 10,
  },
  mockContainer: {
    borderWidth: 2,
    borderColor: '#FF6B6B',
    borderStyle: 'dashed',
  },
  gradient: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 15,
  },
  rewardContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 15,
  },
  rewardText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  readyText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 8,
  },
  mockTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  mockDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 15,
  },
  mockButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  mockButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default RewardedAdComponent; 