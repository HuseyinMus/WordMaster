import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  SafeAreaView,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { FirebaseService } from '../services/firebaseService';
import BannerAdComponent from '../components/BannerAdComponent';
import RewardedAdComponent from '../components/RewardedAdComponent';

const { width } = Dimensions.get('window');

const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, updateUserProfile, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [dailyGoal, setDailyGoal] = useState(user?.dailyGoal || 5);

  const handleSave = async () => {
    if (!displayName.trim()) {
      Alert.alert('Hata', 'Ad soyad boş olamaz');
      return;
    }

    try {
      await updateUserProfile({
        displayName: displayName.trim(),
        dailyGoal
      });
      setIsEditing(false);
      Alert.alert('Başarılı', 'Profil bilgileri güncellendi');
    } catch (error: any) {
      Alert.alert('Hata', error.message);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkış yapmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Çıkış Yap', style: 'destructive', onPress: signOut }
      ]
    );
  };

  const handleAddInitialWords = async () => {
    if (!user || !user.uid) {
      console.warn('ProfileScreen: user veya user.uid yok');
      return;
    }

    Alert.alert(
      'Temel Kelimeler Ekle',
      'Temel kelime setini eklemek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Ekle', 
          onPress: async () => {
            try {
              console.log('Starting to add sample words for user:', user.uid);
              
              Alert.alert(
                'Kelimeler Ekleniyor',
                'Lütfen bekleyin...',
                [],
                { cancelable: false }
              );
              
              await FirebaseService.addSampleWords(user.uid);
              
              console.log('Sample words added successfully');
              
              Alert.alert(
                'Başarılı!', 
                'Temel kelimeler başarıyla eklendi!',
                [
                  {
                    text: 'Öğrenmeye Başla',
                    onPress: () => navigation.navigate('Learning')
                  },
                  {
                    text: 'Tamam',
                    style: 'default'
                  }
                ]
              );
            } catch (error) {
              console.error('Error adding sample words:', error);
              Alert.alert(
                'Hata', 
                `Kelimeler eklenirken bir hata oluştu: ${error.message}`,
                [
                  {
                    text: 'Tekrar Dene',
                    onPress: () => handleAddInitialWords()
                  },
                  {
                    text: 'İptal',
                    style: 'cancel'
                  }
                ]
              );
            }
          }
        }
      ]
    );
  };

  const handleRewardEarned = async (reward: { type: string; amount: number }) => {
    if (!user?.uid) {
      console.warn('ProfileScreen: user.uid yok, reward güncellenemedi');
      return;
    }
    
    try {
      await FirebaseService.updateUserXP(user.uid, reward.amount);
      
      const updatedUser = await FirebaseService.getUser(user.uid);
      if (updatedUser) {
        // setUser fonksiyonu AuthContext'te tanımlı değil, bu satırı kaldırıyoruz
      }
      
      console.log(`Reward earned: ${reward.amount} ${reward.type}`);
    } catch (error) {
      console.error('Error updating user XP:', error);
    }
  };

  const handleAdClosed = () => {
    console.log('Ad closed');
  };

  const handleAdError = (error: string) => {
    console.error('Ad error:', error);
    Alert.alert('Reklam Hatası', error);
  };

  if (!user) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Profil</Text>
          <View style={styles.profileInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user.displayName?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <Text style={styles.userName}>{user.displayName}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.container}>
        {/* İstatistikler */}
        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{user.level}</Text>
              <Text style={styles.statLabel}>Seviye</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{user.xp}</Text>
              <Text style={styles.statLabel}>XP</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{user.streak}</Text>
              <Text style={styles.statLabel}>Gün</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{user.totalWordsLearned}</Text>
              <Text style={styles.statLabel}>Kelime</Text>
            </View>
          </View>
        </View>

        {/* Profil Düzenleme */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profil Bilgileri</Text>
          
          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Ad Soyad</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="Ad soyad girin"
                />
              ) : (
                <Text style={styles.inputValue}>{user.displayName}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Günlük Hedef</Text>
              {isEditing ? (
                <View style={styles.goalSelector}>
                  {[5, 8, 10].map((goal) => (
                    <TouchableOpacity
                      key={goal}
                      style={[
                        styles.goalButton,
                        dailyGoal === goal && styles.goalButtonActive
                      ]}
                      onPress={() => setDailyGoal(goal)}
                    >
                      <Text style={[
                        styles.goalButtonText,
                        dailyGoal === goal && styles.goalButtonTextActive
                      ]}>
                        {goal}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Text style={styles.inputValue}>{user.dailyGoal} kelime</Text>
              )}
            </View>

            {isEditing ? (
              <View style={styles.editButtons}>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                  <Text style={styles.saveButtonText}>Kaydet</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.cancelButton} 
                  onPress={() => {
                    setIsEditing(false);
                    setDisplayName(user.displayName);
                    setDailyGoal(user.dailyGoal);
                  }}
                >
                  <Text style={styles.cancelButtonText}>İptal</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
                <Text style={styles.editButtonText}>Düzenle</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Hızlı İşlemler */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
          
          <View style={styles.card}>
            <TouchableOpacity style={styles.actionButton} onPress={handleAddInitialWords}>
              <Text style={styles.actionButtonText}>Temel Kelimeler Ekle</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Ödüllü Reklamlar */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bonus XP</Text>
          
          <RewardedAdComponent
            title="Bonus XP Kazan"
            description="Reklam izleyerek 50 XP kazan!"
            rewardText="+50 XP"
            onRewardEarned={handleRewardEarned}
            onAdClosed={handleAdClosed}
            onAdError={handleAdError}
            style={styles.rewardedAd}
          />
        </View>

        {/* Hesap İşlemleri */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hesap</Text>
          
          <View style={styles.card}>
            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
              <Text style={styles.signOutButtonText}>Çıkış Yap</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Banner Reklam */}
        <BannerAdComponent style={styles.bannerAd} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  profileInfo: {
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  statsSection: {
    padding: 20,
    paddingTop: 30,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#f8f9fa',
  },
  inputValue: {
    fontSize: 16,
    color: '#333',
    paddingVertical: 12,
  },
  goalSelector: {
    flexDirection: 'row',
    gap: 10,
  },
  goalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    backgroundColor: '#f8f9fa',
  },
  goalButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  goalButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  goalButtonTextActive: {
    color: 'white',
  },
  editButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  editButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#28a745',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    flex: 1,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    flex: 1,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  signOutButton: {
    backgroundColor: '#dc3545',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  signOutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  bannerAd: {
    marginTop: 10,
    marginBottom: 20,
  },
  rewardedAd: {
    marginBottom: 10,
  },
});

export default ProfileScreen; 