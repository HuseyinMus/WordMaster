# WordMaster Test Checklist

## 🧪 Manuel Test Kontrol Listesi

### 🔐 Kullanıcı Yönetimi Testleri

#### Kayıt Olma
- [ ] Yeni email ile kayıt olma
- [ ] Geçersiz email formatı kontrolü
- [ ] Kısa şifre kontrolü
- [ ] Şifre eşleşmeme kontrolü
- [ ] Zaten kayıtlı email kontrolü

#### Giriş Yapma
- [ ] Doğru email/şifre ile giriş
- [ ] Yanlış şifre kontrolü
- [ ] Olmayan email kontrolü
- [ ] Boş alan kontrolü

#### Profil Yönetimi
- [ ] Profil bilgilerini görüntüleme
- [ ] Ad soyad düzenleme
- [ ] Günlük hedef değiştirme
- [ ] Değişiklikleri kaydetme
- [ ] İptal etme

### 🏠 Ana Sayfa Testleri

#### Veri Yükleme
- [ ] Kullanıcı bilgileri yükleme
- [ ] Kelime sayıları hesaplama
- [ ] Günlük hedef ilerlemesi
- [ ] İstatistikler gösterimi

#### Butonlar
- [ ] Öğrenmeye başla butonu
- [ ] Quiz yap butonu (kelime varsa)
- [ ] Quiz yap butonu (kelime yoksa)
- [ ] Hızlı erişim butonları

#### Pull-to-Refresh
- [ ] Aşağı çekme ile yenileme
- [ ] Verilerin güncellenmesi

### 📚 Öğrenme Ekranı Testleri

#### Kelime Gösterimi
- [ ] İlk kelimeyi gösterme
- [ ] Kelime telaffuzu
- [ ] Anlamını göster butonu
- [ ] Anlam ve örnek cümle gösterimi

#### Kalite Değerlendirme
- [ ] Çok Zor (1 puan) seçimi
- [ ] Zor (2 puan) seçimi
- [ ] Orta (3 puan) seçimi
- [ ] Kolay (4 puan) seçimi
- [ ] Çok Kolay (5 puan) seçimi

#### Geçişler
- [ ] Diğer kelimeye geçiş
- [ ] Animasyon düzgünlüğü
- [ ] Son kelimede tamamlama mesajı
- [ ] Ana sayfaya dönüş

### 📝 Kelime Listesi Testleri

#### Listeleme
- [ ] Tüm kelimeleri gösterme
- [ ] Kelime detayları
- [ ] Boş liste durumu

#### Arama
- [ ] Kelime adı ile arama
- [ ] Anlam ile arama
- [ ] Boş arama sonucu
- [ ] Arama temizleme

#### Filtreleme
- [ ] Tümü filtresi
- [ ] Yeni filtresi
- [ ] Öğreniliyor filtresi
- [ ] Tekrar filtresi
- [ ] Öğrenildi filtresi

### 🎯 Quiz Testleri

#### Quiz Başlatma
- [ ] Quiz başlatma
- [ ] Kelime yoksa uyarı
- [ ] Soru gösterimi

#### Soru Cevaplama
- [ ] Çoktan seçmeli sorular
- [ ] Metin girişi soruları
- [ ] Doğru cevap kontrolü
- [ ] Yanlış cevap kontrolü

#### Quiz Tamamlama
- [ ] Skor hesaplama
- [ ] Tamamlama ekranı
- [ ] Ana sayfaya dönüş

### 👤 Profil Testleri

#### Kelime Ekleme
- [ ] Temel kelimeler ekleme
- [ ] Ek kelimeler ekleme
- [ ] Eksik alanları düzeltme

#### Navigasyon
- [ ] İstatistikler sayfasına geçiş
- [ ] Ayarlar sayfasına geçiş

### 📊 İstatistikler Testleri

#### Veri Gösterimi
- [ ] Toplam kelime sayısı
- [ ] Öğrenilen kelime sayısı
- [ ] Tekrar sayısı
- [ ] Seri gün sayısı
- [ ] Ortalama puan
- [ ] Son çalışma tarihi

### ⚙️ Ayarlar Testleri

#### Ayarlar
- [ ] Bildirim ayarları
- [ ] Ses efektleri
- [ ] Uygulama bilgileri
- [ ] Çıkış yapma

### 🔧 Teknik Testler

#### Firebase
- [ ] Veri kaydetme
- [ ] Veri okuma
- [ ] Veri güncelleme
- [ ] Hata durumları

#### Navigation
- [ ] Alt bar geçişleri
- [ ] Stack navigasyon
- [ ] Geri butonları

#### Performans
- [ ] Uygulama başlatma süresi
- [ ] Sayfa geçiş hızı
- [ ] Veri yükleme hızı

## 🐛 Hata Testleri

### Firebase Hataları
- [ ] İnternet bağlantısı yok
- [ ] Firebase erişim hatası
- [ ] Veri yazma hatası
- [ ] Veri okuma hatası

### Navigation Hataları
- [ ] Geçersiz sayfa navigasyonu
- [ ] Geri buton çalışmaması
- [ ] Tab geçiş sorunları

### Veri Hataları
- [ ] Eksik kelime verileri
- [ ] Geçersiz tarih değerleri
- [ ] Boş kullanıcı verileri

## 📱 Platform Testleri

### Android
- [ ] Farklı Android sürümleri
- [ ] Farklı ekran boyutları
- [ ] Donanım butonları

### iOS
- [ ] Farklı iOS sürümleri
- [ ] iPhone/iPad uyumluluğu
- [ ] Gesture'lar

### Web
- [ ] Farklı tarayıcılar
- [ ] Responsive tasarım
- [ ] Klavye navigasyonu

## 📊 Test Sonuçları

### Test Tarihi: _______________
### Test Eden: _______________
### Platform: _______________

### Genel Sonuç
- [ ] Tüm testler başarılı
- [ ] Bazı testler başarısız
- [ ] Kritik hatalar var

### Bulunan Hatalar
1. ________________
2. ________________
3. ________________

### Öneriler
1. ________________
2. ________________
3. ________________

---
**Not:** Bu checklist her test sürecinde güncellenmelidir. 