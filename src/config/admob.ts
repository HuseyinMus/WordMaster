import { Platform } from 'react-native';

// AdMob Konfigürasyonu
export const ADMOB_CONFIG = {
  // Test ID'leri (geliştirme aşamasında kullan)
  TEST_IDS: {
    BANNER: Platform.select({
      ios: 'ca-app-pub-3940256099942544/2934735716',
      android: 'ca-app-pub-3940256099942544/6300978111',
      default: 'ca-app-pub-3940256099942544/6300978111',
    }),
    INTERSTITIAL: Platform.select({
      ios: 'ca-app-pub-3940256099942544/4411468910',
      android: 'ca-app-pub-3940256099942544/1033173712',
      default: 'ca-app-pub-3940256099942544/1033173712',
    }),
    REWARDED: Platform.select({
      ios: 'ca-app-pub-3940256099942544/1712485313',
      android: 'ca-app-pub-3940256099942544/5224354917',
      default: 'ca-app-pub-3940256099942544/5224354917',
    }),
    NATIVE_ADVANCED: Platform.select({
      ios: 'ca-app-pub-3940256099942544/3985214517',
      android: 'ca-app-pub-3940256099942544/2247696110',
      default: 'ca-app-pub-3940256099942544/2247696110',
    }),
  },

  // Gerçek ID'ler (production'da kullan)
  PRODUCTION_IDS: {
    BANNER: Platform.select({
      ios: 'ca-app-pub-6780266285395945/1372615742', // iOS banner ID
      android: 'ca-app-pub-6780266285395945/1372615742', // Android banner ID
      default: 'ca-app-pub-6780266285395945/1372615742',
    }),
    INTERSTITIAL: Platform.select({
      ios: 'ca-app-pub-6780266285395945/2524564245', // iOS interstitial ID - Quiz sonrası
      android: 'ca-app-pub-6780266285395945/2524564245', // Android interstitial ID - Quiz sonrası
      default: 'ca-app-pub-6780266285395945/2524564245',
    }),
    REWARDED: Platform.select({
      ios: 'ca-app-pub-6780266285395945/3175300934', // iOS rewarded ID - Ödüllü reklam
      android: 'ca-app-pub-6780266285395945/3175300934', // Android rewarded ID - Ödüllü reklam
      default: 'ca-app-pub-6780266285395945/3175300934',
    }),
    NATIVE_ADVANCED: Platform.select({
      ios: 'ca-app-pub-6780266285395945/2524564245', // iOS native advanced ID - Gelecekte kullanım için
      android: 'ca-app-pub-6780266285395945/2524564245', // Android native advanced ID - Gelecekte kullanım için
      default: 'ca-app-pub-6780266285395945/2524564245',
    }),
  },

  // Uygulama ID'si
  APP_ID: Platform.select({
    ios: 'ca-app-pub-6780266285395945~3908678547', // Gerçek iOS app ID
    android: 'ca-app-pub-6780266285395945~3908678547', // Gerçek Android app ID
    default: 'ca-app-pub-6780266285395945~3908678547',
  }),
};

// Geliştirme modunda test ID'lerini, production'da gerçek ID'leri kullan
export const getAdUnitId = (adType: 'BANNER' | 'INTERSTITIAL' | 'REWARDED' | 'NATIVE_ADVANCED', isTest: boolean = true) => {
  if (isTest) {
    return ADMOB_CONFIG.TEST_IDS[adType];
  }
  return ADMOB_CONFIG.PRODUCTION_IDS[adType];
};

// Reklam gösterim kuralları
export const AD_DISPLAY_RULES = {
  // Kaç kelime öğrenildikten sonra interstitial göster
  INTERSTITIAL_AFTER_WORDS: 5,
  
  // Kaç quiz tamamlandıktan sonra interstitial göster
  INTERSTITIAL_AFTER_QUIZ: 3,
  
  // Banner reklamları hangi ekranlarda göster
  BANNER_SCREENS: ['WordList', 'Profile', 'Stats'],
  
  // Rewarded reklamlar hangi durumlarda göster
  REWARDED_SCENARIOS: ['extra_words', 'hint', 'skip_wait'],
}; 