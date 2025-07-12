import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import BannerAdComponent from './BannerAdComponent';
import RewardedAdComponent from './RewardedAdComponent';
import AdService from '../services/adService';
import { FirebaseService } from '../services/firebaseService';
import { useAuth } from '../contexts/AuthContext';
import TestService, { TestResult } from '../services/testService';
import TestReportComponent from './TestReportComponent';

const AdTestComponent: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [adService] = useState(AdService.getInstance());
  const [testService] = useState(TestService.getInstance());

  const runAllTests = async () => {
    setIsRunningTests(true);
    setTestResults([]);

    try {
      const results = await testService.runAllTests(user?.uid);
      setTestResults(results);
    } catch (error) {
      console.error('Test suite error:', error);
      Alert.alert('Test Hatası', 'Testler çalıştırılırken bir hata oluştu.');
    } finally {
      setIsRunningTests(false);
    }
  };

  const testRewardedAdFlow = async () => {
    try {
      const result = await testService.testRewardedAd();
      setTestResults(prev => [...prev, result]);
      
      if (result.status === 'success') {
        Alert.alert('Test Başarılı', result.message);
      } else if (result.status === 'warning') {
        Alert.alert('Test Tamamlandı', result.message);
      } else {
        Alert.alert('Test Hatası', result.message);
      }
    } catch (error) {
      Alert.alert('Test Hatası', `Ödüllü reklam test hatası: ${error.message}`);
    }
  };

  const testInterstitialAdFlow = async () => {
    try {
      const result = await testService.testInterstitialAd();
      setTestResults(prev => [...prev, result]);
      
      if (result.status === 'success') {
        Alert.alert('Test Başarılı', result.message);
      } else if (result.status === 'warning') {
        Alert.alert('Test Tamamlandı', result.message);
      } else {
        Alert.alert('Test Hatası', result.message);
      }
    } catch (error) {
      Alert.alert('Test Hatası', `Interstitial reklam test hatası: ${error.message}`);
    }
  };

  const testFirebaseXP = async () => {
    if (!user) {
      Alert.alert('Hata', 'Kullanıcı girişi yapılmamış');
      return;
    }

    try {
      const result = await testService.testFirebaseXP(user.uid, 10);
      setTestResults(prev => [...prev, result]);
      
      if (result.status === 'success') {
        Alert.alert('Test Başarılı', result.message);
      } else {
        Alert.alert('Test Hatası', result.message);
      }
    } catch (error) {
      Alert.alert('Test Hatası', `Firebase XP test hatası: ${error.message}`);
    }
  };

  const clearTestResults = () => {
    setTestResults([]);
    testService.clearResults();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return '#28a745';
      case 'error': return '#dc3545';
      case 'warning': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return '⏳';
    }
  };

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Geri</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>🧪 Reklam Test Merkezi</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Test Buttons */}
        <View style={styles.testSection}>
          <Text style={styles.sectionTitle}>🔬 Test İşlemleri</Text>
          
          <TouchableOpacity
            style={[styles.testButton, styles.primaryButton]}
            onPress={runAllTests}
            disabled={isRunningTests}
          >
            {isRunningTests ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.testButtonText}>🚀 Tüm Testleri Çalıştır</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.testButton, styles.secondaryButton]}
            onPress={testRewardedAdFlow}
            disabled={isRunningTests}
          >
            <Text style={styles.testButtonText}>🎁 Ödüllü Reklam Test Et</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.testButton, styles.secondaryButton]}
            onPress={testInterstitialAdFlow}
            disabled={isRunningTests}
          >
            <Text style={styles.testButtonText}>📺 Interstitial Test Et</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.testButton, styles.infoButton]}
            onPress={testFirebaseXP}
            disabled={isRunningTests}
          >
            <Text style={styles.testButtonText}>💰 Firebase XP Test Et</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.testButton, styles.dangerButton]}
            onPress={clearTestResults}
          >
            <Text style={styles.testButtonText}>🗑️ Sonuçları Temizle</Text>
          </TouchableOpacity>

          {testResults.length > 0 && (
            <TouchableOpacity
              style={[styles.testButton, styles.successButton]}
              onPress={() => setShowReport(true)}
            >
              <Text style={styles.testButtonText}>📊 Detaylı Rapor Görüntüle</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Test Results */}
        <View style={styles.resultsSection}>
          <Text style={styles.sectionTitle}>
            📊 Test Sonuçları ({testResults.length})
          </Text>
          
          {testResults.length === 0 ? (
            <View style={styles.emptyResults}>
              <Text style={styles.emptyText}>Henüz test çalıştırılmadı</Text>
            </View>
          ) : (
            testResults.map((result, index) => (
              <View key={index} style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultName}>{result.name}</Text>
                  <Text style={[styles.resultStatus, { color: getStatusColor(result.status) }]}>
                    {getStatusIcon(result.status)}
                  </Text>
                </View>
                <Text style={styles.resultMessage}>{result.message}</Text>
                {result.details && (
                  <Text style={styles.resultDetails}>
                    {JSON.stringify(result.details, null, 2)}
                  </Text>
                )}
                <Text style={styles.resultTimestamp}>
                  {result.timestamp.toLocaleTimeString()}
                  {result.duration && ` (${result.duration}ms)`}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Live Ad Components */}
        <View style={styles.liveSection}>
          <Text style={styles.sectionTitle}>📱 Canlı Reklam Bileşenleri</Text>
          
          <View style={styles.adContainer}>
            <Text style={styles.adLabel}>Banner Reklam:</Text>
            <BannerAdComponent style={styles.bannerAd} />
          </View>

          <View style={styles.adContainer}>
            <Text style={styles.adLabel}>Ödüllü Reklam:</Text>
            <RewardedAdComponent
              title="🧪 Test Ödüllü Reklam"
              description="Test amaçlı ödüllü reklam"
              rewardText="+10 XP"
              onRewardEarned={(reward) => {
                Alert.alert('Test Ödülü', `${reward.amount} ${reward.type} kazandınız!`);
              }}
              onAdClosed={() => console.log('Test ad closed')}
              onAdError={(error) => console.log('Test ad error:', error)}
              style={styles.rewardedAd}
            />
          </View>
        </View>
      </ScrollView>

      {/* Test Report Modal */}
      {showReport && (
        <TestReportComponent
          results={testResults}
          onClose={() => setShowReport(false)}
        />
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  placeholder: {
    width: 60,
  },
  testSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  testButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#28a745',
  },
  secondaryButton: {
    backgroundColor: '#007bff',
  },
  infoButton: {
    backgroundColor: '#17a2b8',
  },
  dangerButton: {
    backgroundColor: '#dc3545',
  },
  successButton: {
    backgroundColor: '#20c997',
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsSection: {
    padding: 20,
  },
  emptyResults: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: 'white',
    fontSize: 16,
  },
  resultCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  resultStatus: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  resultDetails: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'monospace',
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 4,
    marginBottom: 5,
  },
  resultTimestamp: {
    fontSize: 12,
    color: '#999',
  },
  liveSection: {
    padding: 20,
  },
  adContainer: {
    marginBottom: 20,
  },
  adLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  bannerAd: {
    marginBottom: 10,
  },
  rewardedAd: {
    marginBottom: 10,
  },
});

export default AdTestComponent; 