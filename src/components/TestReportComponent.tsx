import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TestResult } from '../services/testService';

interface TestReportComponentProps {
  results: TestResult[];
  onClose: () => void;
}

const TestReportComponent: React.FC<TestReportComponentProps> = ({ results, onClose }) => {
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success': return 'Başarılı';
      case 'error': return 'Hata';
      case 'warning': return 'Uyarı';
      default: return 'Bekliyor';
    }
  };

  const getSummaryStats = () => {
    const total = results.length;
    const success = results.filter(r => r.status === 'success').length;
    const error = results.filter(r => r.status === 'error').length;
    const warning = results.filter(r => r.status === 'warning').length;
    const successRate = total > 0 ? Math.round((success / total) * 100) : 0;

    return { total, success, error, warning, successRate };
  };

  const generateReport = () => {
    const stats = getSummaryStats();
    const timestamp = new Date().toLocaleString('tr-TR');
    
    let report = `🧪 WordMaster Test Raporu\n`;
    report += `📅 Tarih: ${timestamp}\n`;
    report += `📊 Özet: ${stats.success}/${stats.total} başarılı (${stats.successRate}%)\n\n`;
    
    report += `📈 İstatistikler:\n`;
    report += `✅ Başarılı: ${stats.success}\n`;
    report += `❌ Hata: ${stats.error}\n`;
    report += `⚠️ Uyarı: ${stats.warning}\n\n`;
    
    report += `🔍 Detaylı Sonuçlar:\n`;
    results.forEach((result, index) => {
      report += `${index + 1}. ${result.name}\n`;
      report += `   Durum: ${getStatusText(result.status)}\n`;
      report += `   Mesaj: ${result.message}\n`;
      if (result.duration) {
        report += `   Süre: ${result.duration}ms\n`;
      }
      report += `\n`;
    });
    
    return report;
  };

  const shareReport = async () => {
    try {
      const report = generateReport();
      await Share.share({
        message: report,
        title: 'WordMaster Test Raporu',
      });
    } catch (error) {
      console.error('Rapor paylaşım hatası:', error);
    }
  };

  const stats = getSummaryStats();

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>📊 Test Raporu</Text>
          <TouchableOpacity onPress={shareReport} style={styles.shareButton}>
            <Text style={styles.shareButtonText}>📤</Text>
          </TouchableOpacity>
        </View>

        {/* Summary Stats */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>📈 Özet İstatistikler</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.total}</Text>
              <Text style={styles.statLabel}>Toplam Test</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statNumber, { color: '#28a745' }]}>{stats.success}</Text>
              <Text style={styles.statLabel}>Başarılı</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statNumber, { color: '#dc3545' }]}>{stats.error}</Text>
              <Text style={styles.statLabel}>Hata</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statNumber, { color: '#ffc107' }]}>{stats.warning}</Text>
              <Text style={styles.statLabel}>Uyarı</Text>
            </View>
          </View>

          <View style={styles.successRateCard}>
            <Text style={styles.successRateText}>Başarı Oranı</Text>
            <Text style={styles.successRateNumber}>{stats.successRate}%</Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${stats.successRate}%` }
                ]} 
              />
            </View>
          </View>
        </View>

        {/* Detailed Results */}
        <View style={styles.resultsSection}>
          <Text style={styles.sectionTitle}>🔍 Detaylı Sonuçlar</Text>
          
          {results.map((result, index) => (
            <View key={index} style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <View style={styles.resultTitleContainer}>
                  <Text style={styles.resultNumber}>#{index + 1}</Text>
                  <Text style={styles.resultName}>{result.name}</Text>
                </View>
                <View style={styles.resultStatusContainer}>
                  <Text style={[styles.resultStatus, { color: getStatusColor(result.status) }]}>
                    {getStatusIcon(result.status)}
                  </Text>
                  <Text style={[styles.resultStatusText, { color: getStatusColor(result.status) }]}>
                    {getStatusText(result.status)}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.resultMessage}>{result.message}</Text>
              
              {result.details && (
                <View style={styles.detailsContainer}>
                  <Text style={styles.detailsTitle}>Detaylar:</Text>
                  <Text style={styles.detailsText}>
                    {typeof result.details === 'object' 
                      ? JSON.stringify(result.details, null, 2)
                      : result.details
                    }
                  </Text>
                </View>
              )}
              
              <View style={styles.resultFooter}>
                <Text style={styles.resultTimestamp}>
                  {result.timestamp.toLocaleTimeString('tr-TR')}
                </Text>
                {result.duration && (
                  <Text style={styles.resultDuration}>
                    {result.duration}ms
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Recommendations */}
        <View style={styles.recommendationsSection}>
          <Text style={styles.sectionTitle}>💡 Öneriler</Text>
          
          {stats.error > 0 && (
            <View style={styles.recommendationCard}>
              <Text style={styles.recommendationIcon}>⚠️</Text>
              <Text style={styles.recommendationText}>
                {stats.error} test hatası bulundu. Bu hataları düzeltmek için Firebase bağlantısını ve AdMob konfigürasyonunu kontrol edin.
              </Text>
            </View>
          )}
          
          {stats.warning > 0 && (
            <View style={styles.recommendationCard}>
              <Text style={styles.recommendationIcon}>ℹ️</Text>
              <Text style={styles.recommendationText}>
                {stats.warning} uyarı bulundu. Bu uyarılar performansı etkileyebilir.
              </Text>
            </View>
          )}
          
          {stats.successRate >= 90 && (
            <View style={styles.recommendationCard}>
              <Text style={styles.recommendationIcon}>🎉</Text>
              <Text style={styles.recommendationText}>
                Mükemmel! Sistem %{stats.successRate} başarı oranıyla çalışıyor. Uygulama production'a hazır.
              </Text>
            </View>
          )}
          
          {stats.successRate < 70 && (
            <View style={styles.recommendationCard}>
              <Text style={styles.recommendationIcon}>🔧</Text>
              <Text style={styles.recommendationText}>
                Düşük başarı oranı (%{stats.successRate}). Kritik hataları düzeltmek için geliştirici ile iletişime geçin.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
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
  closeButton: {
    padding: 10,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  shareButton: {
    padding: 10,
  },
  shareButtonText: {
    color: 'white',
    fontSize: 20,
  },
  summarySection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  successRateCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  successRateText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  successRateNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 10,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#28a745',
    borderRadius: 4,
  },
  resultsSection: {
    padding: 20,
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
  resultTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  resultNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginRight: 8,
  },
  resultName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  resultStatusContainer: {
    alignItems: 'center',
  },
  resultStatus: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultStatusText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  resultMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  detailsContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  detailsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  detailsText: {
    fontSize: 11,
    color: '#666',
    fontFamily: 'monospace',
  },
  resultFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultTimestamp: {
    fontSize: 12,
    color: '#999',
  },
  resultDuration: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
  },
  recommendationsSection: {
    padding: 20,
  },
  recommendationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  recommendationIcon: {
    fontSize: 20,
    marginRight: 10,
    marginTop: 2,
  },
  recommendationText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    lineHeight: 20,
  },
});

export default TestReportComponent; 