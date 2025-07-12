import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { getUserStats } from '../services/firebaseService';

interface UserStats {
  totalWords: number;
  learnedWords: number;
  reviewCount: number;
  streakDays: number;
  averageScore: number;
  lastStudyDate: Date | null;
}

const StatsScreen = ({ navigation }: { navigation: any }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userStats = await getUserStats(user.uid);
      console.log('Stats - Loaded stats:', userStats);
      setStats(userStats);
    } catch (error) {
      console.error('Stats - Error loading stats:', error);
      Alert.alert('Hata', 'İstatistikler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, subtitle, color = '#667eea' }: {
    title: string;
    value: string | number;
    subtitle?: string;
    color?: string;
  }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>İstatistikler yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Geri</Text>
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.title}>İstatistikler</Text>
            <Text style={styles.subtitle}>
              Öğrenme performansınız
            </Text>
          </View>
        </View>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsGrid}>
          <StatCard
            title="Toplam Kelime"
            value={stats?.totalWords || 0}
            subtitle="Eklenen kelimeler"
            color="#667eea"
          />
          <StatCard
            title="Öğrenilen"
            value={stats?.learnedWords || 0}
            subtitle="Tamamlanan kelimeler"
            color="#48bb78"
          />
          <StatCard
            title="Tekrar Sayısı"
            value={stats?.reviewCount || 0}
            subtitle="Toplam tekrar"
            color="#ed8936"
          />
          <StatCard
            title="Seri Gün"
            value={stats?.streakDays || 0}
            subtitle="Ardışık çalışma"
            color="#e53e3e"
          />
        </View>

        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>İlerleme</Text>
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Öğrenme Oranı</Text>
              <Text style={styles.progressValue}>
                {stats?.totalWords ? Math.round((stats.learnedWords / stats.totalWords) * 100) : 0}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${stats?.totalWords ? (stats.learnedWords / stats.totalWords) * 100 : 0}%` 
                  }
                ]} 
              />
            </View>
          </View>
        </View>

        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Son Aktiviteler</Text>
          <View style={styles.activityCard}>
            <Text style={styles.activityText}>
              Ortalama Puan: {stats?.averageScore ? Math.round(stats.averageScore) : 0}/100
            </Text>
            <Text style={styles.activityText}>
              Son Çalışma: {
                stats?.lastStudyDate 
                  ? new Date(stats.lastStudyDate).toLocaleDateString('tr-TR')
                  : 'Henüz çalışma yok'
              }
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: '600',
    marginRight: 15,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    width: '48%',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#999',
  },
  progressSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  progressCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressLabel: {
    fontSize: 16,
    color: '#333',
  },
  progressValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#667eea',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 4,
  },
  recentSection: {
    marginBottom: 20,
  },
  activityCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  activityText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
});

export default StatsScreen; 