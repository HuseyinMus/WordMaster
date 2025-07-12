import { Platform } from 'react-native';

// Mock AdMob servisi - Expo Go'da test için
class MockAdService {
  private static instance: MockAdService;
  private wordCount: number = 0;
  private quizCount: number = 0;

  private constructor() {}

  public static getInstance(): MockAdService {
    if (!MockAdService.instance) {
      MockAdService.instance = new MockAdService();
    }
    return MockAdService.instance;
  }

  // Mock banner reklam
  public getBannerAdUnitId(): string {
    return 'mock-banner-ad-id';
  }

  // Mock interstitial reklam
  public showInterstitialAd(): Promise<boolean> {
    return new Promise((resolve) => {
      console.log('Mock Interstitial Ad would show here');
      setTimeout(() => {
        console.log('Mock Interstitial Ad closed');
        resolve(true);
      }, 1000);
    });
  }

  // Mock rewarded reklam
  public showRewardedAd(): Promise<{ rewarded: boolean; type?: string }> {
    return new Promise((resolve) => {
      console.log('Mock Rewarded Ad would show here');
      setTimeout(() => {
        console.log('Mock Rewarded Ad completed - user earned reward');
        resolve({ rewarded: true, type: 'mock_reward' });
      }, 2000);
    });
  }

  // Kelime öğrenme sayacı
  public incrementWordCount() {
    this.wordCount++;
    console.log(`Mock AdService - Word count: ${this.wordCount}`);
    
    // Belirli sayıda kelime öğrenildikten sonra interstitial göster
    if (this.wordCount % 5 === 0) {
      this.showInterstitialAd().then((shown) => {
        if (shown) {
          console.log('Mock Interstitial shown after word learning');
        }
      });
    }
  }

  // Quiz sayacı
  public incrementQuizCount() {
    this.quizCount++;
    console.log(`Mock AdService - Quiz count: ${this.quizCount}`);
    
    // Belirli sayıda quiz tamamlandıktan sonra interstitial göster
    if (this.quizCount % 3 === 0) {
      this.showInterstitialAd().then((shown) => {
        if (shown) {
          console.log('Mock Interstitial shown after quiz completion');
        }
      });
    }
  }

  // Sayaçları sıfırla
  public resetCounters() {
    this.wordCount = 0;
    this.quizCount = 0;
  }
}

export default MockAdService; 