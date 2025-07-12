# Firebase Kurulum ve Güvenlik Kuralları

## 🔥 Firebase Console'da Yapılması Gerekenler

### 1. Firebase Console'a Giriş
1. [Firebase Console](https://console.firebase.google.com/) adresine gidin
2. Projenizi seçin veya yeni proje oluşturun

### 2. Firestore Database Kurulumu
1. Sol menüden "Firestore Database" seçin
2. "Create database" butonuna tıklayın
3. "Start in test mode" seçin (güvenlik kurallarını daha sonra ayarlayacağız)
4. Lokasyon seçin (örn: europe-west3)

### 3. Güvenlik Kurallarını Ayarlama
1. Firestore Database sayfasında "Rules" sekmesine tıklayın
2. Mevcut kuralları silin
3. `firebase-rules.txt` dosyasındaki kuralları kopyalayın
4. "Publish" butonuna tıklayın

### 4. Authentication Kurulumu
1. Sol menüden "Authentication" seçin
2. "Get started" butonuna tıklayın
3. "Sign-in method" sekmesinde:
   - Email/Password'ü etkinleştirin
   - Google Sign-in'i etkinleştirin (opsiyonel)

### 5. Proje Ayarları
1. Sol menüden "Project settings" seçin
2. "General" sekmesinde:
   - Proje ID'sini not edin
   - Web uygulaması ekleyin (gerekirse)

## 📋 Güvenlik Kuralları Açıklaması

### Kullanıcı Erişimi
- Kullanıcılar sadece kendi verilerine erişebilir
- Kimlik doğrulaması zorunludur
- Her kullanıcı sadece kendi userId'sine sahip verileri görebilir

### Koleksiyonlar
- `users`: Kullanıcı profilleri
- `words`: Kelime verileri
- `dailyStats`: Günlük istatistikler
- `badges`: Rozetler

## 🚨 Hata Kodları ve Çözümleri

### permission-denied
- Güvenlik kurallarını kontrol edin
- Kullanıcının kimlik doğrulaması yapıldığından emin olun

### unauthenticated
- Kullanıcı giriş yapmamış
- AuthContext'i kontrol edin

### unavailable
- İnternet bağlantısı sorunu
- Firebase servisi geçici olarak kullanılamıyor

## 🧪 Test Etme

1. Uygulamayı çalıştırın
2. Profil sayfasına gidin
3. "Firebase Bağlantı Testi" butonuna tıklayın
4. Sonucu kontrol edin

## 📝 Önemli Notlar

- Güvenlik kuralları değişiklikleri anında etkili olur
- Test modunda tüm erişim açıktır (güvenlik yok)
- Production'da mutlaka güvenlik kurallarını ayarlayın
- Hata mesajlarını console'da kontrol edin

## 🔧 Sorun Giderme

### Kelimeler Yüklenmiyor
1. Firebase bağlantı testini yapın
2. Console loglarını kontrol edin
3. Güvenlik kurallarını doğrulayın
4. Kullanıcı kimlik doğrulamasını kontrol edin

### Veri Yazma Hatası
1. Güvenlik kurallarında create/update izinlerini kontrol edin
2. userId alanının doğru ayarlandığından emin olun
3. Firebase Console'da verileri manuel kontrol edin 