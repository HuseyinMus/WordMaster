import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
  SafeAreaView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { FirebaseService } from '../services/firebaseService';
import { SpacedRepetitionService } from '../services/spacedRepetition';
import { DailyGoalService } from '../services/dailyGoalService';
import { Word, DailyStats } from '../types';

interface LeaderboardUser {
  uid: string;
  displayName: string;
  totalWordsLearned: number;
  level: number;
  xp: number;
  rank: number;
}

const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, signOut } = useAuth();
  const [words, setWords] = useState<Word[]>([]);
  const [todayStats, setTodayStats] = useState<DailyStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [dailyGoalProgress, setDailyGoalProgress] = useState({
    isCompleted: false,
    progress: 0,
    remaining: 0
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!user) return;

    try {
      const userWords = await FirebaseService.getUserWords(user.uid);
      console.log('HomeScreen - Total words loaded:', userWords.length);
      setWords(userWords);

      const today = new Date().toISOString().split('T')[0];
      const stats = await FirebaseService.getDailyStats(user.uid, today);
      setTodayStats(stats);

      // Günlük hedef ilerlemesini kontrol et
      const goalProgress = await DailyGoalService.checkDailyGoal(user.uid, user.dailyGoal);
      setDailyGoalProgress(goalProgress);

      // Liderlik tablosunu yükle
      await loadLeaderboard();
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
    }
  };

  const loadLeaderboard = async () => {
    try {
      // Örnek liderlik tablosu (gerçek uygulamada Firebase'den çekilir)
      const mockLeaderboard: LeaderboardUser[] = [
        {
          uid: 'user1',
          displayName: 'Ahmet Yılmaz',
          totalWordsLearned: 150,
          level: 8,
          xp: 1250,
          rank: 1
        },
        {
          uid: 'user2',
          displayName: 'Ayşe Demir',
          totalWordsLearned: 120,
          level: 7,
          xp: 980,
          rank: 2
        },
        {
          uid: 'user3',
          displayName: 'Mehmet Kaya',
          totalWordsLearned: 95,
          level: 6,
          xp: 750,
          rank: 3
        },
        {
          uid: user.uid,
          displayName: user.displayName,
          totalWordsLearned: user.totalWordsLearned,
          level: user.level,
          xp: user.xp,
          rank: 4
        }
      ];

      // Sıralama yap
      mockLeaderboard.sort((a, b) => b.totalWordsLearned - a.totalWordsLearned);
      mockLeaderboard.forEach((user, index) => {
        user.rank = index + 1;
      });

      setLeaderboard(mockLeaderboard);
    } catch (error) {
      console.error('Liderlik tablosu yükleme hatası:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getWordsForToday = () => {
    const reviewWords = SpacedRepetitionService.getWordsForToday(words);
    const newWords = SpacedRepetitionService.getNewWords(words, user?.dailyGoal || 5);
    return { reviewWords, newWords };
  };

  const { reviewWords, newWords } = getWordsForToday();
  const totalWordsForToday = reviewWords.length + newWords.length;
  
  // Öğrenilebilir kelimeler (yeni + tekrar edilecek)
  const learnableWords = words.filter(word => 
    word.learningStatus === 'new' || 
    word.learningStatus === 'learning' || 
    word.learningStatus === 'reviewing'
  );
  
  // Quiz yapılabilir kelimeler (öğrenilmiş kelimeler)
  const quizWords = words.filter(word => 
    word.learningStatus === 'learning' || 
    word.learningStatus === 'reviewing' ||
    word.learningStatus === 'mastered'
  );

  const handleStartLearning = () => {
    if (totalWordsForToday === 0) {
      Alert.alert('🎉 Tebrikler!', 'Bugün için tüm kelimeleri tamamladınız!');
      return;
    }
    navigation.navigate('Learning');
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkış yapmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Çıkış Yap', style: 'destructive', onPress: signOut }
      ]
    );
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  if (!user) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>👋 Merhaba, {user.displayName}!</Text>
              <Text style={styles.level}>⭐ Seviye {user.level} • 🔥 {user.xp} XP</Text>
            </View>
            <TouchableOpacity style={styles.profileButton} onPress={handleSignOut}>
              <Text style={styles.profileButtonText}>🚪</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Günlük İstatistikler */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Bugünkü İlerleme</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>📚</Text>
              <Text style={styles.statNumber}>{totalWordsForToday}</Text>
              <Text style={styles.statLabel}>Kelime</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>🔄</Text>
              <Text style={styles.statNumber}>{reviewWords.length}</Text>
              <Text style={styles.statLabel}>Tekrar</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>🆕</Text>
              <Text style={styles.statNumber}>{newWords.length}</Text>
              <Text style={styles.statLabel}>Yeni</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>📅</Text>
              <Text style={styles.statNumber}>{user.streak}</Text>
              <Text style={styles.statLabel}>Gün</Text>
            </View>
          </View>
        </View>

        {/* Günlük Hedef */}
        <View style={styles.goalContainer}>
          <Text style={styles.sectionTitle}>Günlük Hedef</Text>
          <View style={styles.goalCard}>
            <View style={styles.goalProgress}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${Math.min(100, (dailyGoalProgress.progress / user.dailyGoal) * 100)}%` }
                  ]} 
                />
              </View>
              <Text style={styles.goalText}>
                {dailyGoalProgress.progress} / {user.dailyGoal} kelime öğrenildi
              </Text>
              {dailyGoalProgress.remaining > 0 && (
                <Text style={styles.remainingText}>
                  {dailyGoalProgress.remaining} kelime kaldı
                </Text>
              )}
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.startButton, totalWordsForToday === 0 && styles.startButtonDisabled]}
                onPress={handleStartLearning}
                disabled={totalWordsForToday === 0}
              >
                <Text style={styles.startButtonText}>
                  {totalWordsForToday === 0 ? '✅ Tamamlandı!' : '📖 Öğrenmeye Başla'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.quizButton, quizWords.length === 0 && styles.quizButtonDisabled]}
                onPress={() => navigation.navigate('Quiz')}
                disabled={quizWords.length === 0}
              >
                <Text style={styles.quizButtonText}>
                  {quizWords.length === 0 ? '❌ Quiz Yok' : `🧠 Quiz (${quizWords.length})`}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Liderlik Tablosu */}
        <View style={styles.leaderboardContainer}>
          <Text style={styles.sectionTitle}>Liderlik Tablosu</Text>
          <View style={styles.leaderboardCard}>
            {leaderboard.slice(0, 5).map((leaderUser, index) => (
              <View key={leaderUser.uid} style={[
                styles.leaderboardItem,
                leaderUser.uid === user.uid && styles.currentUserItem
              ]}>
                <View style={styles.rankSection}>
                  <Text style={styles.rankIcon}>{getRankIcon(leaderUser.rank)}</Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={[
                    styles.userName,
                    leaderUser.uid === user.uid && styles.currentUserName
                  ]}>
                    {leaderUser.displayName}
                  </Text>
                  <Text style={styles.userStats}>
                    📚 {leaderUser.totalWordsLearned} kelime • ⭐ Seviye {leaderUser.level}
                  </Text>
                </View>
                <View style={styles.userScore}>
                  <Text style={styles.scoreText}>{leaderUser.totalWordsLearned}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Hızlı İstatistikler */}
        <View style={styles.quickStatsContainer}>
          <Text style={styles.sectionTitle}>Genel İstatistikler</Text>
          <View style={styles.quickStats}>
            <View style={styles.quickStatItem}>
              <Text style={styles.quickStatIcon}>📚</Text>
              <Text style={styles.quickStatNumber}>{words.length}</Text>
              <Text style={styles.quickStatLabel}>Toplam Kelime</Text>
            </View>
            <View style={styles.quickStatItem}>
              <Text style={styles.quickStatIcon}>✅</Text>
              <Text style={styles.quickStatNumber}>
                {words.filter(w => w.learningStatus === 'mastered').length}
              </Text>
              <Text style={styles.quickStatLabel}>Öğrenilen</Text>
            </View>
            <View style={styles.quickStatItem}>
              <Text style={styles.quickStatIcon}>🔄</Text>
              <Text style={styles.quickStatNumber}>
                {words.reduce((sum, w) => sum + (w.reviewCount || 0), 0)}
              </Text>
              <Text style={styles.quickStatLabel}>Toplam Tekrar</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  level: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  profileButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  profileButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  statsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    fontSize: 30,
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  goalContainer: {
    padding: 20,
  },
  goalCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  goalProgress: {
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 4,
  },
  goalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  remainingText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  startButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  startButtonDisabled: {
    backgroundColor: '#28a745',
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  quizButton: {
    backgroundColor: '#28a745',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginLeft: 10,
  },
  quizButtonDisabled: {
    backgroundColor: '#ccc',
  },
  quizButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  leaderboardContainer: {
    padding: 20,
  },
  leaderboardCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  currentUserItem: {
    backgroundColor: '#f0f7fa', // Açık mavi arka plan
    borderRadius: 12,
    padding: 10,
    marginTop: 10,
    marginBottom: 10,
  },
  rankSection: {
    width: 50,
    alignItems: 'center',
  },
  rankIcon: {
    fontSize: 24,
  },
  userInfo: {
    flex: 1,
    marginLeft: 15,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  currentUserName: {
    color: '#667eea',
  },
  userStats: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  userScore: {
    width: 50,
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#667eea',
  },
  quickStatsContainer: {
    padding: 20,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickStatItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickStatIcon: {
    fontSize: 30,
    marginBottom: 10,
  },
  quickStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  quickStatLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});

export default HomeScreen; 