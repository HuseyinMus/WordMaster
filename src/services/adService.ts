import { Platform } from 'react-native';
import { getAdUnitId, AD_DISPLAY_RULES } from '../config/admob';

// Koşullu import - sadece mobil platformlarda
let BannerAd: any = null;
let BannerAdSize: any = null;
let TestIds: any = null;
let InterstitialAd: any = null;
let AdEventType: any = null;
let RewardedAd: any = null;
let RewardedAdEventType: any = null;
let NativeAdvancedAd: any = null;
let NativeAdvancedAdEventType: any = null;

if (Platform.OS !== 'web') {
  try {
    const mobileAds = require('react-native-google-mobile-ads');
    BannerAd = mobileAds.BannerAd;
    BannerAdSize = mobileAds.BannerAdSize;
    TestIds = mobileAds.TestIds;
    InterstitialAd = mobileAds.InterstitialAd;
    AdEventType = mobileAds.AdEventType;
    RewardedAd = mobileAds.RewardedAd;
    RewardedAdEventType = mobileAds.RewardedAdEventType;
    NativeAdvancedAd = mobileAds.NativeAdvancedAd;
    NativeAdvancedAdEventType = mobileAds.NativeAdvancedAdEventType;
  } catch (error) {
    console.log('AdMob not available:', error);
  }
}

class AdService {
  private static instance: AdService;
  private interstitialAd: InterstitialAd | null = null;
  private rewardedAd: RewardedAd | null = null;
  private nativeAd: NativeAdvancedAd | null = null;
  private wordCount: number = 0;
  private quizCount: number = 0;
  private isTestMode: boolean = false; // Production modu - gerçek reklamlar

  private constructor() {
    this.initializeAds();
  }

  public static getInstance(): AdService {
    if (!AdService.instance) {
      AdService.instance = new AdService();
    }
    return AdService.instance;
  }

  private initializeAds() {
    // Web platformunda reklamları başlatma
    if (Platform.OS === 'web') {
      console.log('AdMob ads disabled on web platform');
      return;
    }

    // Interstitial reklamı başlat
    this.loadInterstitialAd();
    
    // Rewarded reklamı başlat
    this.loadRewardedAd();
    
    // Native advanced reklamı başlat
    this.loadNativeAd();
  }

  // Interstitial Reklam İşlemleri
  private loadInterstitialAd() {
    if (!InterstitialAd || !AdEventType) {
      console.log('InterstitialAd not available');
      return;
    }

    const adUnitId = getAdUnitId('INTERSTITIAL', this.isTestMode);
    this.interstitialAd = InterstitialAd.createForAdRequest(adUnitId);

    this.interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
      console.log('Interstitial ad loaded');
    });

    this.interstitialAd.addAdEventListener(AdEventType.ERROR, (error) => {
      console.error('Interstitial ad error:', error);
    });

    this.interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
      console.log('Interstitial ad closed');
      // Reklam kapandıktan sonra yeni reklam yükle
      this.loadInterstitialAd();
    });

    this.interstitialAd.load();
  }

  public showInterstitialAd(): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.interstitialAd) {
        console.log('Interstitial ad not ready');
        resolve(false);
        return;
      }

      this.interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
        resolve(true);
      }, { once: true });

      this.interstitialAd.show();
    });
  }

  // Rewarded Reklam İşlemleri
  private loadRewardedAd() {
    if (!RewardedAd || !RewardedAdEventType) {
      console.log('RewardedAd not available');
      return;
    }

    const adUnitId = getAdUnitId('REWARDED', this.isTestMode);
    this.rewardedAd = RewardedAd.createForAdRequest(adUnitId);

    this.rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
      console.log('Rewarded ad loaded');
    });

    this.rewardedAd.addAdEventListener(RewardedAdEventType.ERROR, (error) => {
      console.error('Rewarded ad error:', error);
    });

    this.rewardedAd.addAdEventListener(RewardedAdEventType.CLOSED, () => {
      console.log('Rewarded ad closed');
      // Reklam kapandıktan sonra yeni reklam yükle
      this.loadRewardedAd();
    });

    this.rewardedAd.load();
  }

  public showRewardedAd(): Promise<{ rewarded: boolean; type?: string }> {
    return new Promise((resolve) => {
      if (!this.rewardedAd) {
        console.log('Rewarded ad not ready');
        resolve({ rewarded: false });
        return;
      }

      let rewardEarned = false;

      this.rewardedAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (reward) => {
        console.log('User earned reward:', reward);
        rewardEarned = true;
      }, { once: true });

      this.rewardedAd.addAdEventListener(RewardedAdEventType.CLOSED, () => {
        resolve({ rewarded: rewardEarned });
      }, { once: true });

      this.rewardedAd.show();
    });
  }

  // Native Advanced Reklam İşlemleri
  private loadNativeAd() {
    if (!NativeAdvancedAd || !NativeAdvancedAdEventType) {
      console.log('NativeAdvancedAd not available');
      return;
    }

    const adUnitId = getAdUnitId('NATIVE_ADVANCED', this.isTestMode);
    this.nativeAd = NativeAdvancedAd.createForAdRequest(adUnitId);

    this.nativeAd.addAdEventListener(NativeAdvancedAdEventType.LOADED, () => {
      console.log('Native ad loaded');
    });

    this.nativeAd.addAdEventListener(NativeAdvancedAdEventType.ERROR, (error) => {
      console.error('Native ad error:', error);
    });

    this.nativeAd.load();
  }

  public getNativeAd() {
    return this.nativeAd;
  }

  // Kelime öğrenme sayacı
  public incrementWordCount() {
    this.wordCount++;
    console.log(`Word count: ${this.wordCount}`);
    
    // Belirli sayıda kelime öğrenildikten sonra interstitial göster
    if (this.wordCount % AD_DISPLAY_RULES.INTERSTITIAL_AFTER_WORDS === 0) {
      this.showInterstitialAd().then((shown) => {
        if (shown) {
          console.log('Interstitial shown after word learning');
        }
      });
    }
  }

  // Quiz sayacı
  public incrementQuizCount() {
    this.quizCount++;
    console.log(`Quiz count: ${this.quizCount}`);
    
    // Belirli sayıda quiz tamamlandıktan sonra interstitial göster
    if (this.quizCount % AD_DISPLAY_RULES.INTERSTITIAL_AFTER_QUIZ === 0) {
      this.showInterstitialAd().then((shown) => {
        if (shown) {
          console.log('Interstitial shown after quiz completion');
        }
      });
    }
  }

  // Sayaçları sıfırla
  public resetCounters() {
    this.wordCount = 0;
    this.quizCount = 0;
  }

  // Test modunu değiştir
  public setTestMode(isTest: boolean) {
    this.isTestMode = isTest;
    // Test modu değiştiğinde reklamları yeniden yükle
    this.initializeAds();
  }

  // Banner reklam ID'sini al
  public getBannerAdUnitId(): string {
    return getAdUnitId('BANNER', this.isTestMode);
  }
}

export default AdService; 