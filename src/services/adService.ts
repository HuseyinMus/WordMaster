import { Platform } from 'react-native';
import { getAdUnitId, AD_DISPLAY_RULES } from '../config/admob';

class AdService {
  private static instance: AdService;
  private interstitialAd: any = null;
  private rewardedAd: any = null;
  private nativeAd: any = null;
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
    const adUnitId = getAdUnitId('INTERSTITIAL', this.isTestMode);
    // AdMobInterstitial.setAdUnitID(adUnitId); // Placeholder
    
    // AdMobInterstitial.addEventListener('interstitialDidLoad', () => { // Placeholder
    //   console.log('Interstitial ad loaded');
    // });

    // AdMobInterstitial.addEventListener('interstitialDidFailToLoad', (error) => { // Placeholder
    //   console.error('Interstitial ad error:', error);
    // });

    // AdMobInterstitial.addEventListener('interstitialDidClose', () => { // Placeholder
    //   console.log('Interstitial ad closed');
    //   // Reklam kapandıktan sonra yeni reklam yükle
    //   this.loadInterstitialAd();
    // });

    // AdMobInterstitial.requestAdAsync(); // Placeholder
  }

  public async showInterstitialAd(): Promise<boolean> {
    try {
      // const isLoaded = await AdMobInterstitial.getIsLoadedAsync(); // Placeholder
      // if (!isLoaded) {
      //   console.log('Interstitial ad not ready');
      //   return false;
      // }

      // await AdMobInterstitial.showAdAsync(); // Placeholder
      return false; // Placeholder
    } catch (error) {
      console.error('Error showing interstitial ad:', error);
      return false;
    }
  }

  // Rewarded Reklam İşlemleri
  private loadRewardedAd() {
    const adUnitId = getAdUnitId('REWARDED', this.isTestMode);
    // AdMobRewarded.setAdUnitID(adUnitId); // Placeholder
    
    // AdMobRewarded.addEventListener('rewardedVideoUserDidEarnReward', () => { // Placeholder
    //   console.log('User earned reward');
    // });

    // AdMobRewarded.addEventListener('rewardedVideoDidLoad', () => { // Placeholder
    //   console.log('Rewarded ad loaded');
    // });

    // AdMobRewarded.addEventListener('rewardedVideoDidFailToLoad', (error) => { // Placeholder
    //   console.error('Rewarded ad error:', error);
    // });

    // AdMobRewarded.addEventListener('rewardedVideoDidClose', () => { // Placeholder
    //   console.log('Rewarded ad closed');
    //   // Reklam kapandıktan sonra yeni reklam yükle
    //   this.loadRewardedAd();
    // });

    // AdMobRewarded.requestAdAsync(); // Placeholder
  }

  public async showRewardedAd(): Promise<{ rewarded: boolean; type?: string }> {
    try {
      // const isLoaded = await AdMobRewarded.getIsLoadedAsync(); // Placeholder
      // if (!isLoaded) {
      //   console.log('Rewarded ad not ready');
      //   return { rewarded: false };
      // }

      // await AdMobRewarded.showAdAsync(); // Placeholder
      return { rewarded: false }; // Placeholder
    } catch (error) {
      console.error('Error showing rewarded ad:', error);
      return { rewarded: false };
    }
  }

  // Native Advanced Reklam İşlemleri - Expo'da desteklenmiyor
  private loadNativeAd() {
    console.log('Native ads not supported in Expo managed workflow');
  }

  public getNativeAd() {
    return null;
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