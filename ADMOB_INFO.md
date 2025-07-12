# AdMob Reklam Birimi Bilgileri

## Uygulama Bilgileri
- **Uygulama Adı**: WordMaster
- **AdMob Uygulama ID**: `ca-app-pub-6780266285395945~3908678547`

## Reklam Birimleri

### 1. Banner Reklam
- **Reklam Birimi ID**: `ca-app-pub-6780266285395945/1372615742`
- **Kullanım Yeri**: 
  - WordListScreen (kelime listesi altında)
  - ProfileScreen (profil sayfası altında)
- **Durum**: ✅ Aktif

### 2. Interstitial Reklam (Quiz Sonrası)
- **Reklam Birimi ID**: `ca-app-pub-6780266285395945/2524564245`
- **Kullanım Yeri**:
  - 5 kelime öğrenildikten sonra otomatik gösterim
  - 3 quiz tamamlandıktan sonra otomatik gösterim
- **Durum**: ✅ Aktif

### 3. Rewarded Reklam (Ödüllü)
- **Reklam Birimi ID**: `ca-app-pub-6780266285395945/2524564245`
- **Kullanım Yeri**:
  - Quiz sonrası otomatik gösterim
  - ProfileScreen'de manuel butonlar
- **Durum**: ✅ Aktif

## Üçüncü Taraf Uyumlulaştırma Platformu Bilgileri

### Gerekli Bilgiler:
- **AdMob Uygulama Kimliği**: `ca-app-pub-6780266285395945~3908678547`
- **AdMob Reklam Birimi Kimliği**: `ca-app-pub-6780266285395945/1372615742`

### Önemli Notlar:
1. Yeni reklam birimlerinin reklam göstermeye başlaması **1 saat** kadar sürebilir
2. Üçüncü taraf uyumlulaştırma platformunda minimum SDK ve bağdaştırıcı sürümlerini kontrol edin
3. İş ortağı teklif verme özelliği için en az **2 hafta** test yapmanız önerilir

## Konfigürasyon Dosyaları

### 1. AdMob Konfigürasyonu
- **Dosya**: `src/config/admob.ts`
- **Durum**: ✅ Güncellenmiş

### 2. App.json Plugin Konfigürasyonu
- **Dosya**: `app.json`
- **Durum**: ✅ Güncellenmiş

### 3. AdMob Servisi
- **Dosya**: `src/services/adService.ts`
- **Durum**: ✅ Production modu aktif

## Test ve Production

### Test Modu
- **Durum**: ❌ Kapalı
- **Açıklama**: Gerçek reklamlar gösteriliyor

### Production Modu
- **Durum**: ✅ Aktif
- **Açıklama**: Gerçek AdMob ID'leri kullanılıyor

## Reklam Yerleşim Stratejisi

### Banner Reklamlar
- **Sıklık**: Sürekli görünür
- **Yerleşim**: Ekran altında
- **Kullanıcı Deneyimi**: Minimal rahatsızlık

### Interstitial Reklamlar
- **Sıklık**: Belirli eylemlerden sonra
- **Yerleşim**: Tam ekran
- **Kullanıcı Deneyimi**: Doğal geçiş noktalarında

### Rewarded Reklamlar
- **Sıklık**: Kullanıcı kontrolünde
- **Yerleşim**: Tam ekran
- **Kullanıcı Deneyimi**: Ödül odaklı

## Gelir Optimizasyonu

### Öneriler:
1. **A/B Testleri**: Farklı reklam yerleşimlerini test edin
2. **Kullanıcı Geri Bildirimi**: Reklam deneyimini izleyin
3. **Performans Takibi**: AdMob Console'da metrikleri takip edin
4. **Politika Uyumluluğu**: AdMob politikalarını düzenli kontrol edin

## Sorun Giderme

### Yaygın Sorunlar:
1. **Reklamlar Yüklenmiyor**: Ağ bağlantısını kontrol edin
2. **Test Reklamları Görünüyor**: Production modunu kontrol edin
3. **Reklamlar Çok Sık**: Gösterim kurallarını ayarlayın

### Destek:
- AdMob Console: https://admob.google.com/
- AdMob Politikaları: https://support.google.com/admob/answer/6129563 