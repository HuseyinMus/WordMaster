import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Switch,
  SafeAreaView
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { FirebaseService } from '../services/firebaseService';
import BannerAdComponent from '../components/BannerAdComponent';
import RewardedAdComponent from '../components/RewardedAdComponent';
import RewardedAdButton from '../components/RewardedAdButton';

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
      Alert.alert('✅ Başarılı', 'Profil bilgileri güncellendi');
    } catch (error: any) {
      Alert.alert('❌ Hata', error.message);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      '🚪 Çıkış Yap',
      'Hesabınızdan çıkış yapmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Çıkış Yap', style: 'destructive', onPress: signOut }
      ]
    );
  };

  const handleAddInitialWords = async () => {
    if (!user) return;

    Alert.alert(
      '📚 Temel Kelimeler Ekle',
      'Temel kelime setini eklemek istediğinizden emin misiniz? Bu işlem birkaç saniye sürebilir.',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Ekle', 
          onPress: async () => {
            try {
              console.log('Starting to add sample words for user:', user.uid);
              
              // Loading mesajı göster
              Alert.alert(
                '⏳ Kelimeler Ekleniyor',
                'Lütfen bekleyin...',
                [],
                { cancelable: false }
              );
              
              await FirebaseService.addSampleWords(user.uid);
              
              console.log('Sample words added successfully');
              
              Alert.alert(
                '🎉 Başarılı!', 
                'Temel kelimeler başarıyla eklendi! Şimdi öğrenmeye başlayabilirsiniz.',
                [
                  {
                    text: '📖 Öğrenmeye Başla',
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
                '❌ Hata', 
                `Kelimeler eklenirken bir hata oluştu: ${error.message}`,
                [
                  {
                    text: '🔄 Tekrar Dene',
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

  const handleTestFirebase = async () => {
    try {
      const isConnected = await FirebaseService.testConnection();
      if (isConnected) {
        Alert.alert('✅ Başarılı', 'Firebase bağlantısı çalışıyor!');
      } else {
        Alert.alert('❌ Hata', 'Firebase bağlantısında sorun var. Güvenlik kurallarını kontrol edin.');
      }
    } catch (error) {
      Alert.alert('❌ Hata', `Firebase test hatası: ${error.message}`);
    }
  };

  const handleAddTOEFLWords = async () => {
    if (!user) return;

    Alert.alert(
      '📚 TOEFL Kelimeleri Ekle',
      'TOEFL kelime setini eklemek istediğinizden emin misiniz? Bu set kolay, orta ve zor seviye kelimeler içerir.',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Ekle', 
          onPress: async () => {
            try {
              console.log('Starting to add TOEFL words for user:', user.uid);
              
              // Loading mesajı göster
              Alert.alert(
                '⏳ TOEFL Kelimeleri Ekleniyor',
                'Lütfen bekleyin...',
                [],
                { cancelable: false }
              );
              
              await FirebaseService.addTOEFLWords(user.uid);
              
              console.log('TOEFL words added successfully');
              
              Alert.alert(
                '🎉 Başarılı!', 
                'TOEFL kelimeleri başarıyla eklendi! Şimdi TOEFL kelimelerini öğrenmeye başlayabilirsiniz.',
                [
                  {
                    text: '📖 Öğrenmeye Başla',
                    onPress: () => navigation.navigate('Learning')
                  },
                  {
                    text: 'Tamam',
                    style: 'default'
                  }
                ]
              );
            } catch (error) {
              console.error('Error adding TOEFL words:', error);
              Alert.alert(
                '❌ Hata', 
                `TOEFL kelimeleri eklenirken bir hata oluştu: ${error.message}`,
                [
                  {
                    text: '🔄 Tekrar Dene',
                    onPress: () => handleAddTOEFLWords()
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
    try {
      // Kullanıcının XP'sini güncelle
      await FirebaseService.updateUserXP(user.uid, reward.amount);
      
      // Kullanıcı bilgilerini yenile
      const updatedUser = await FirebaseService.getUser(user.uid);
      if (updatedUser) {
        setUser(updatedUser);
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
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profil</Text>
        </View>

        {/* Profil Bilgileri */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Kişisel Bilgiler</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>👤 Ad Soyad:</Text>
              {isEditing ? (
                <TextInput
                  style={styles.editInput}
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="Ad soyad girin"
                />
              ) : (
                <Text style={styles.infoValue}>{user.displayName}</Text>
              )}
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📧 E-posta:</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>🎯 Günlük Hedef:</Text>
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
                <Text style={styles.infoValue}>{user.dailyGoal} kelime</Text>
              )}
            </View>
          </View>

          {isEditing ? (
            <View style={styles.editButtons}>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>💾 Kaydet</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => {
                  setIsEditing(false);
                  setDisplayName(user.displayName);
                  setDailyGoal(user.dailyGoal);
                }}
              >
                <Text style={styles.cancelButtonText}>❌ İptal</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
              <Text style={styles.editButtonText}>✏️ Düzenle</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* İstatistikler */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 İstatistikler</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>⭐</Text>
              <Text style={styles.statNumber}>{user.level}</Text>
              <Text style={styles.statLabel}>Seviye</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>🔥</Text>
              <Text style={styles.statNumber}>{user.xp}</Text>
              <Text style={styles.statLabel}>XP</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>📅</Text>
              <Text style={styles.statNumber}>{user.streak}</Text>
              <Text style={styles.statLabel}>Gün</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>📚</Text>
              <Text style={styles.statNumber}>{user.totalWordsLearned}</Text>
              <Text style={styles.statLabel}>Kelime</Text>
            </View>
          </View>
        </View>

        {/* Hızlı İşlemler */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Hızlı İşlemler</Text>
          
          <View style={styles.actionCard}>
            <TouchableOpacity style={styles.actionButton} onPress={handleAddInitialWords}>
              <Text style={styles.actionButtonText}>📚 Temel Kelimeler Ekle</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#28a745' }]} onPress={handleAddTOEFLWords}>
              <Text style={styles.actionButtonText}>🎯 TOEFL Kelimeleri Ekle</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#007bff' }]} onPress={handleTestFirebase}>
              <Text style={styles.actionButtonText}>🔧 Firebase Bağlantı Testi</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#ff6b6b' }]} onPress={() => navigation.navigate('AdTest')}>
              <Text style={styles.actionButtonText}>🧪 Reklam Test Merkezi</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Ödüllü Reklamlar */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎁 Ödüllü Reklamlar</Text>
          
          <RewardedAdComponent
            title="🎁 Bonus XP Kazan"
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
          <Text style={styles.sectionTitle}>⚙️ Hesap İşlemleri</Text>
          
          <View style={styles.actionCard}>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#dc3545' }]} onPress={handleSignOut}>
              <Text style={styles.actionButtonText}>🚪 Çıkış Yap</Text>
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
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#667eea',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  backButton: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  infoValue: {
    fontSize: 16,
    color: '#666',
  },
  editInput: {
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    minWidth: 120,
  },
  goalSelector: {
    flexDirection: 'row',
    gap: 10,
  },
  goalButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  goalButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  goalButtonText: {
    fontSize: 14,
    color: '#666',
  },
  goalButtonTextActive: {
    color: 'white',
  },
  editButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 15,
  },
  editButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginTop: 15,
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
  statIcon: {
    fontSize: 30,
    marginBottom: 8,
  },
  actionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  secondaryButton: {
    backgroundColor: '#28a745',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  bannerAd: {
    marginTop: 10,
    marginBottom: 10,
  },
  rewardedButton: {
    marginBottom: 10,
  },
  rewardedAd: {
    marginBottom: 10,
  },
});

export default ProfileScreen; 