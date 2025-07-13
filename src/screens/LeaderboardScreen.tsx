import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { FirebaseService } from '../services/firebaseService';

interface LeaderboardUser {
  id: string;
  displayName: string;
  xp: number;
  level: number;
  totalWordsLearned: number;
  streak: number;
  rank: number;
}

const LeaderboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'weekly' | 'monthly' | 'allTime'>('weekly');

  useEffect(() => {
    loadLeaderboard();
  }, [selectedPeriod]);

  const loadLeaderboard = async () => {
    if (!user || !user.uid) {
      console.warn('LeaderboardScreen: user veya user.uid yok');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log('LeaderboardScreen: Loading leaderboard for user:', user.uid);
      // Gerçek kullanıcı verilerini al
      const allUsers = await FirebaseService.getAllUsers();
      
      // Kullanıcıları sırala
      const sortedUsers = allUsers
        .map((userData, index) => ({
          id: userData.uid,
          displayName: userData.displayName || 'Anonim Kullanıcı',
          xp: userData.xp || 0,
          level: userData.level || 1,
          totalWordsLearned: userData.totalWordsLearned || 0,
          streak: userData.streak || 0,
          rank: index + 1,
        }))
        .sort((a, b) => b.xp - a.xp)
        .slice(0, 50); // İlk 50 kullanıcı

      setLeaderboard(sortedUsers);
    } catch (error) {
      console.error('Liderlik tablosu yüklenirken hata:', error);
      // Mock veriler
      const mockLeaderboard: LeaderboardUser[] = [
        {
          id: '1',
          displayName: '🏆 Kelime Ustası',
          xp: 2847,
          level: 15,
          totalWordsLearned: 156,
          streak: 23,
          rank: 1,
        },
        {
          id: '2',
          displayName: '🚀 Hızlı Öğrenen',
          xp: 2156,
          level: 12,
          totalWordsLearned: 134,
          streak: 18,
          rank: 2,
        },
        {
          id: '3',
          displayName: '⭐ Dil Dehası',
          xp: 1892,
          level: 10,
          totalWordsLearned: 98,
          streak: 15,
          rank: 3,
        },
        {
          id: '4',
          displayName: '📚 Bilgi Avcısı',
          xp: 1654,
          level: 9,
          totalWordsLearned: 87,
          streak: 12,
          rank: 4,
        },
        {
          id: '5',
          displayName: '🎯 Hedef Odaklı',
          xp: 1432,
          level: 8,
          totalWordsLearned: 76,
          streak: 10,
          rank: 5,
        },
        {
          id: '6',
          displayName: '💪 Azimli Öğrenci',
          xp: 1234,
          level: 7,
          totalWordsLearned: 65,
          streak: 8,
          rank: 6,
        },
        {
          id: '7',
          displayName: '🌟 Yükselen Yıldız',
          xp: 1098,
          level: 6,
          totalWordsLearned: 54,
          streak: 7,
          rank: 7,
        },
        {
          id: '8',
          displayName: '🔥 Ateşli Öğrenci',
          xp: 987,
          level: 5,
          totalWordsLearned: 43,
          streak: 6,
          rank: 8,
        },
        {
          id: '9',
          displayName: '🎨 Yaratıcı Öğrenci',
          xp: 876,
          level: 4,
          totalWordsLearned: 32,
          streak: 5,
          rank: 9,
        },
        {
          id: '10',
          displayName: '🌈 Renkli Öğrenci',
          xp: 765,
          level: 3,
          totalWordsLearned: 21,
          streak: 4,
          rank: 10,
        },
      ];
      setLeaderboard(mockLeaderboard);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return '#FFD700';
      case 2: return '#C0C0C0';
      case 3: return '#CD7F32';
      default: return '#666';
    }
  };

  const renderLeaderboardItem = ({ item, index }: { item: LeaderboardUser; index: number }) => {
    const isCurrentUser = item.id === user?.uid;
    
    return (
      <View style={[styles.leaderboardItem, isCurrentUser && styles.currentUserItem]}>
        <View style={styles.rankContainer}>
          <Text style={[styles.rankText, { color: getRankColor(item.rank) }]}>
            {getRankIcon(item.rank)}
          </Text>
        </View>
        
        <View style={styles.userInfo}>
          <Text style={[styles.userName, isCurrentUser && styles.currentUserName]}>
            {item.displayName} {isCurrentUser && '👤'}
          </Text>
          <View style={styles.userStats}>
            <Text style={styles.statText}>Seviye {item.level}</Text>
            <Text style={styles.statText}>•</Text>
            <Text style={styles.statText}>{item.totalWordsLearned} kelime</Text>
            <Text style={styles.statText}>•</Text>
            <Text style={styles.statText}>{item.streak} gün</Text>
          </View>
        </View>
        
        <View style={styles.xpContainer}>
          <Text style={[styles.xpText, isCurrentUser && styles.currentUserXp]}>
            {item.xp.toLocaleString()} XP
          </Text>
        </View>
      </View>
    );
  };

  const renderPeriodSelector = () => (
    <View style={styles.periodSelector}>
      <TouchableOpacity
        style={[styles.periodButton, selectedPeriod === 'weekly' && styles.activePeriodButton]}
        onPress={() => setSelectedPeriod('weekly')}
      >
        <Text style={[styles.periodButtonText, selectedPeriod === 'weekly' && styles.activePeriodButtonText]}>
          📅 Haftalık
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.periodButton, selectedPeriod === 'monthly' && styles.activePeriodButton]}
        onPress={() => setSelectedPeriod('monthly')}
      >
        <Text style={[styles.periodButtonText, selectedPeriod === 'monthly' && styles.activePeriodButtonText]}>
          📊 Aylık
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.periodButton, selectedPeriod === 'allTime' && styles.activePeriodButton]}
        onPress={() => setSelectedPeriod('allTime')}
      >
        <Text style={[styles.periodButtonText, selectedPeriod === 'allTime' && styles.activePeriodButtonText]}>
          🏆 Tüm Zamanlar
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.loadingText}>Liderlik tablosu yükleniyor...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Geri</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>🏆 Liderlik Tablosu</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Period Selector */}
        {renderPeriodSelector()}

        {/* Leaderboard */}
        <FlatList
          data={leaderboard}
          renderItem={renderLeaderboardItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#667eea',
  },
  container: {
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
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  placeholder: {
    width: 60,
  },
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
  },
  activePeriodButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  periodButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  activePeriodButtonText: {
    fontWeight: 'bold',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currentUserItem: {
    backgroundColor: 'rgba(255, 215, 0, 0.95)',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  rankContainer: {
    width: 50,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
    marginLeft: 15,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  currentUserName: {
    color: '#8B4513',
  },
  userStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
  xpContainer: {
    alignItems: 'flex-end',
  },
  xpText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#667eea',
  },
  currentUserXp: {
    color: '#8B4513',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 10,
  },
});

export default LeaderboardScreen; 