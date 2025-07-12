import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

const SettingsScreen = ({ navigation }: { navigation: any }) => {
  const { user, signOut } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [dailyReminder, setDailyReminder] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const handleSignOut = () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkmak istediğinizden emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: signOut,
        },
      ]
    );
  };

  const SettingItem = ({ 
    title, 
    subtitle, 
    onPress, 
    showSwitch = false, 
    switchValue = false, 
    onSwitchChange = () => {},
    showArrow = true 
  }: {
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showSwitch?: boolean;
    switchValue?: boolean;
    onSwitchChange?: (value: boolean) => void;
    showArrow?: boolean;
  }) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={onPress}
      disabled={showSwitch}
    >
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {showSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: '#e9ecef', true: '#667eea' }}
          thumbColor={switchValue ? '#fff' : '#f4f3f4'}
        />
      ) : showArrow ? (
        <Text style={styles.arrow}>›</Text>
      ) : null}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Geri</Text>
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.title}>Ayarlar</Text>
            <Text style={styles.subtitle}>
              Uygulama tercihleriniz
            </Text>
          </View>
        </View>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bildirimler</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              title="Bildirimler"
              subtitle="Günlük hatırlatıcılar ve öğrenme bildirimleri"
              showSwitch={true}
              switchValue={notificationsEnabled}
              onSwitchChange={setNotificationsEnabled}
              showArrow={false}
            />
            <SettingItem
              title="Günlük Hatırlatıcı"
              subtitle="Her gün çalışma hatırlatıcısı"
              showSwitch={true}
              switchValue={dailyReminder}
              onSwitchChange={setDailyReminder}
              showArrow={false}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ses ve Efektler</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              title="Ses Efektleri"
              subtitle="Quiz ve öğrenme sesleri"
              showSwitch={true}
              switchValue={soundEnabled}
              onSwitchChange={setSoundEnabled}
              showArrow={false}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hesap</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              title="Profil Bilgileri"
              subtitle="Ad, email ve diğer bilgiler"
              onPress={() => Alert.alert('Bilgi', 'Profil düzenleme özelliği yakında eklenecek.')}
            />
            <SettingItem
              title="Şifre Değiştir"
              subtitle="Hesap güvenliği"
              onPress={() => Alert.alert('Bilgi', 'Şifre değiştirme özelliği yakında eklenecek.')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Uygulama</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              title="Hakkında"
              subtitle="Uygulama bilgileri ve sürüm"
              onPress={() => Alert.alert('WordMaster', 'Sürüm 1.0.0\nKelime öğrenme uygulaması')}
            />
            <SettingItem
              title="Yardım"
              subtitle="Kullanım kılavuzu"
              onPress={() => Alert.alert('Yardım', 'Yardım içeriği yakında eklenecek.')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Veri</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              title="Verileri Dışa Aktar"
              subtitle="Kelime listesini dışa aktar"
              onPress={() => Alert.alert('Bilgi', 'Veri dışa aktarma özelliği yakında eklenecek.')}
            />
            <SettingItem
              title="Verileri Temizle"
              subtitle="Tüm verileri sil"
              onPress={() => Alert.alert('Dikkat', 'Bu işlem geri alınamaz. Tüm verileriniz silinecek.')}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Çıkış Yap</Text>
        </TouchableOpacity>
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
  content: {
    flex: 1,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  sectionContent: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e9ecef',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  arrow: {
    fontSize: 18,
    color: '#999',
    fontWeight: 'bold',
  },
  signOutButton: {
    backgroundColor: '#e53e3e',
    margin: 20,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  signOutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SettingsScreen; 