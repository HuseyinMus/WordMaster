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
    if (!user || !user.uid) {
      console.warn('HomeScreen: user veya user.uid yok');
      return;
    }

    try {
      const userWords = await FirebaseService.getUserWords(user.uid);
      setWords(userWords);

      const today = new Date().toISOString().split('T')[0];
      const stats = await FirebaseService.getDailyStats(user.uid, today);
      setTodayStats(stats);

      const goalProgress = await DailyGoalService.checkDailyGoal(user.uid, user.dailyGoal);
      setDailyGoalProgress(goalProgress);

      await loadLeaderboard();
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
    }
  };

  const loadLeaderboard = async () => {
    try {
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
    const reviewWords = SpacedRepetitionService.getWordsForTodayFromList(words);
    const newWords = SpacedRepetitionService.getNewWords(words, user?.dailyGoal || 5);
    return { reviewWords, newWords };
  };

  const { reviewWords, newWords } = getWordsForToday();
  const totalWordsForToday = reviewWords.length + newWords.length;

  const handleStartLearning = () => {
    if (totalWordsForToday === 0) {
      Alert.alert('Tebrikler!', 'Bugün için tüm kelimeleri tamamladınız!');
      return;
    }
    navigation.navigate('Learning');
  };

  const handleQuiz = () => {
    navigation.navigate('Quiz');
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
        <LinearGradient colors={['#e0e7ef', '#f5f7fa']} style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>Hoş geldin, {user.displayName}</Text>
              <Text style={styles.level}>Seviye {user.level} • {user.xp} XP</Text>
            </View>
            <TouchableOpacity style={styles.profileButton} onPress={handleSignOut}>
              <Text style={styles.profileButtonText}>Çıkış</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Günlük İstatistikler */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Bugünkü İstatistikler</Text>
          <View style={styles.statsGridModern}>
            <View style={styles.statModernCard}>
              <Text style={styles.statModernLabel}>Toplam</Text>
              <Text style={styles.statModernValue}>{totalWordsForToday}</Text>
              <Text style={styles.statModernSub}>Kelime</Text>
            </View>
            <View style={styles.statModernCard}>
              <Text style={styles.statModernLabel}>Tekrar</Text>
              <Text style={styles.statModernValue}>{reviewWords.length}</Text>
              <Text style={styles.statModernSub}>Bugün</Text>
            </View>
            <View style={styles.statModernCard}>
              <Text style={styles.statModernLabel}>Yeni</Text>
              <Text style={styles.statModernValue}>{newWords.length}</Text>
              <Text style={styles.statModernSub}>Kelime</Text>
            </View>
            <View style={styles.statModernCard}>
              <Text style={styles.statModernLabel}>Seri</Text>
              <Text style={styles.statModernValue}>{user.streak}</Text>
              <Text style={styles.statModernSub}>Gün</Text>
            </View>
          </View>
        </View>

        {/* Günlük Hedef */}
        <View style={styles.goalContainer}>
          <Text style={styles.sectionTitle}>Günlük Hedef</Text>
          <View style={styles.goalCardModern}>
            <View style={styles.progressBarModern}>
              <View 
                style={[
                  styles.progressFillModern, 
                  { width: `${Math.min(100, (dailyGoalProgress.progress / user.dailyGoal) * 100)}%` }
                ]} 
              />
            </View>
            <Text style={styles.goalTextModern}>
              {dailyGoalProgress.progress} / {user.dailyGoal} kelime öğrenildi
            </Text>
            {dailyGoalProgress.remaining > 0 && (
              <Text style={styles.remainingTextModern}>
                {dailyGoalProgress.remaining} kelime kaldı
              </Text>
            )}
          </View>
        </View>

        {/* Ana Aksiyonlar */}
        <View style={styles.actionButtonsModern}>
          <TouchableOpacity style={styles.learnButtonModern} onPress={handleStartLearning}>
            <Text style={styles.learnButtonTextModern}>Öğrenmeye Başla</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quizButtonModern} onPress={handleQuiz}>
            <Text style={styles.quizButtonTextModern}>Quiz</Text>
          </TouchableOpacity>
        </View>

        {/* Liderlik Tablosu */}
        <View style={styles.leaderboardContainerModern}>
          <Text style={styles.sectionTitle}>Liderlik Tablosu</Text>
          <View style={styles.leaderboardTableModern}>
            <View style={styles.leaderboardHeaderModern}>
              <Text style={styles.leaderboardHeaderTextModern}>Sıra</Text>
              <Text style={styles.leaderboardHeaderTextModern}>Kullanıcı</Text>
              <Text style={styles.leaderboardHeaderTextModern}>Kelime</Text>
              <Text style={styles.leaderboardHeaderTextModern}>Seviye</Text>
            </View>
            {leaderboard.map((item) => (
              <View key={item.uid} style={styles.leaderboardRowModern}>
                <Text style={styles.leaderboardCellModern}>{item.rank}</Text>
                <Text style={styles.leaderboardCellModern}>{item.displayName}</Text>
                <Text style={styles.leaderboardCellModern}>{item.totalWordsLearned}</Text>
                <Text style={styles.leaderboardCellModern}>{item.level}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#22223b',
    marginBottom: 4,
  },
  level: {
    fontSize: 16,
    color: '#4a4e69',
    fontWeight: '500',
  },
  profileButton: {
    backgroundColor: '#e0e7ef',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  profileButtonText: {
    color: '#4a4e69',
    fontWeight: 'bold',
    fontSize: 16,
  },
  statsContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#22223b',
    marginBottom: 12,
  },
  statsGridModern: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statModernCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
    marginHorizontal: 4,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  statModernLabel: {
    fontSize: 14,
    color: '#4a4e69',
    marginBottom: 2,
  },
  statModernValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#22223b',
  },
  statModernSub: {
    fontSize: 12,
    color: '#9a8c98',
    marginTop: 2,
  },
  goalContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  goalCardModern: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  progressBarModern: {
    width: '100%',
    height: 12,
    backgroundColor: '#e0e7ef',
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFillModern: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 8,
  },
  goalTextModern: {
    fontSize: 15,
    color: '#22223b',
    marginTop: 4,
    fontWeight: '500',
  },
  remainingTextModern: {
    fontSize: 13,
    color: '#9a8c98',
    marginTop: 2,
  },
  actionButtonsModern: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  learnButtonModern: {
    flex: 1,
    backgroundColor: '#667eea',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginRight: 8,
  },
  learnButtonTextModern: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quizButtonModern: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#667eea',
    marginLeft: 8,
  },
  quizButtonTextModern: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: 'bold',
  },
  leaderboardContainerModern: {
    marginHorizontal: 16,
    marginBottom: 32,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  leaderboardTableModern: {
    marginTop: 8,
  },
  leaderboardHeaderModern: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e7ef',
    paddingBottom: 6,
    marginBottom: 4,
  },
  leaderboardHeaderTextModern: {
    flex: 1,
    fontWeight: 'bold',
    color: '#4a4e69',
    fontSize: 14,
    textAlign: 'center',
  },
  leaderboardRowModern: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f7fa',
  },
  leaderboardCellModern: {
    flex: 1,
    color: '#22223b',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default HomeScreen; 