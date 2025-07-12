# WordMaster - Kelime Öğrenme Uygulaması

Modern ve etkili bir kelime öğrenme uygulaması. Spaced repetition algoritması ile kelimeleri kalıcı olarak öğrenin.

## 🚀 Özellikler

### 📚 Öğrenme Sistemi
- **Spaced Repetition Algoritması**: Anki benzeri tekrar sistemi
- **Kalite Değerlendirme**: 1-5 puan sistemi ile öğrenme kalitesi
- **Günlük Hedefler**: Kişiselleştirilmiş öğrenme hedefleri
- **İlerleme Takibi**: Detaylı istatistikler ve grafikler

### 🎯 Quiz Sistemi
- **Çoktan Seçmeli**: Farklı soru tipleri
- **Metin Girişi**: Kelime yazma pratiği
- **Skor Sistemi**: XP kazanma ve seviye atlama
- **Adaptif Zorluk**: Öğrenme seviyesine göre ayarlama

### 📱 Kullanıcı Deneyimi
- **Modern Tasarım**: Temiz ve kullanıcı dostu arayüz
- **Responsive**: Tüm cihazlarda mükemmel görünüm
- **Animasyonlar**: Akıcı geçişler ve etkileşimler
- **Ses Telaffuz**: Kelime telaffuzu özelliği

### 🔐 Güvenlik
- **Firebase Authentication**: Güvenli kullanıcı yönetimi
- **Google Sign-In**: Kolay giriş seçeneği
- **Veri Güvenliği**: Şifrelenmiş veri saklama

## 🛠️ Teknolojiler

- **Frontend**: React Native + TypeScript
- **Backend**: Firebase (Authentication + Firestore)
- **UI Framework**: Expo + React Navigation
- **State Management**: React Context API
- **Build Tool**: Expo CLI

## 📦 Kurulum

### Gereksinimler
- Node.js (v16 veya üzeri)
- npm veya yarn
- Expo CLI
- Android Studio (Android için)
- Xcode (iOS için)

### Adımlar

1. **Projeyi klonlayın**
```bash
git clone <repository-url>
cd WordMaster
```

2. **Bağımlılıkları yükleyin**
```bash
npm install
```

3. **Firebase yapılandırması**
- Firebase Console'da yeni proje oluşturun
- Authentication ve Firestore'u etkinleştirin
- `src/config/firebase.ts` dosyasını güncelleyin

4. **Uygulamayı başlatın**
```bash
npm start
```

## Otomatik Testler

Tüm ana özellikler için otomatik testler `__tests__` klasöründe yer alır.

Testleri çalıştırmak için:

```sh
npm install
npm test
```

Testler Jest ile yazılmıştır. Firestore işlemleri için test kullanıcıları ve test verileri kullanılır.

## 🧪 Test

### Otomatik Testler
```bash
npm test
```

### Manuel Testler
```bash
npm run test:manual
```

Detaylı test listesi için `test-checklist.md` dosyasını inceleyin.

## 📁 Proje Yapısı

```
WordMaster/
├── src/
│   ├── components/          # Yeniden kullanılabilir bileşenler
│   ├── config/             # Yapılandırma dosyaları
│   ├── contexts/           # React Context'ler
│   ├── navigation/         # Navigation yapısı
│   ├── screens/            # Ekran bileşenleri
│   ├── services/           # API ve servis fonksiyonları
│   ├── types/              # TypeScript tip tanımları
│   └── utils/              # Yardımcı fonksiyonlar
├── scripts/                # Test ve build script'leri
├── assets/                 # Resimler ve statik dosyalar
├── goal.txt               # Proje hedefleri ve durumu
├── test-checklist.md      # Manuel test listesi
└── README.md              # Bu dosya
```

## 🎯 Kullanım

### İlk Kullanım
1. Uygulamayı açın
2. Yeni hesap oluşturun veya giriş yapın
3. Profil sayfasından "Temel Kelimeler Ekle" butonuna tıklayın
4. Öğrenmeye başlayın!

### Günlük Kullanım
1. Ana sayfada günlük hedefinizi kontrol edin
2. "Öğrenmeye Başla" ile kelime çalışın
3. "Quiz Yap" ile bilgilerinizi test edin
4. İstatistiklerinizi takip edin

## 🔧 Geliştirme

### Yeni Özellik Ekleme
1. Feature branch oluşturun
2. Kodunuzu yazın
3. Testleri çalıştırın
4. Pull request oluşturun

### Kod Standartları
- TypeScript kullanın
- ESLint kurallarına uyun
- Component'leri modüler tutun
- Error handling ekleyin

## 📊 Performans

### Mevcut Metrikler
- **Uygulama Başlatma**: ~5-8 saniye
- **Kelime Yükleme**: ~2-3 saniye
- **Firebase Güncelleme**: ~1-2 saniye

### Optimizasyon Hedefleri
- Uygulama başlatma <3 saniye
- Kelime yükleme <1 saniye
- Firebase güncelleme <500ms

## 🐛 Bilinen Sorunlar

- Google Sign-In henüz aktif değil
- Bildirim sistemi implement edilmedi
- Bazı kelimelerde nextReviewDate eksik (otomatik düzeltme var)

## 🚀 Gelecek Özellikler

### Yakında
- [ ] Google Sign-In aktifleştirme
- [ ] Bildirim sistemi
- [ ] Offline çalışma desteği
- [ ] Ses telaffuz iyileştirmesi

### Gelecek
- [ ] Kelime kategorileri
- [ ] Arkadaş sistemi
- [ ] Liderlik tablosu
- [ ] Çoklu dil desteği

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📞 İletişim

- **Geliştirici**: [Adınız]
- **Email**: [email@example.com]
- **GitHub**: [github.com/username]

## 🙏 Teşekkürler

- Firebase ekibine
- Expo ekibine
- React Native topluluğuna
- Tüm katkıda bulunanlara

---

**Not**: Bu proje geliştirme aşamasındadır. Production kullanımı için ek testler ve optimizasyonlar gerekebilir. 