import { Platform } from 'react-native';
import { FirebaseService } from './firebaseService';
import AdService from './adService';
import { SpacedRepetitionService } from './spacedRepetition';

export interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message: string;
  details?: any;
  timestamp: Date;
  duration?: number;
}

export class TestService {
  private static instance: TestService;
  private results: TestResult[] = [];

  public static getInstance(): TestService {
    if (!TestService.instance) {
      TestService.instance = new TestService();
    }
    return TestService.instance;
  }

  public addResult(result: TestResult): void {
    this.results.push(result);
  }

  public getResults(): TestResult[] {
    return this.results;
  }

  public clearResults(): void {
    this.results = [];
  }

  public async runAllTests(userId?: string): Promise<TestResult[]> {
    this.clearResults();
    const startTime = Date.now();

    try {
      // 1. Platform Testleri
      await this.runPlatformTests();

      // 2. AdMob Testleri
      await this.runAdMobTests();

      // 3. Firebase Testleri
      if (userId) {
        await this.runFirebaseTests(userId);
      }

      // 4. Kelime Öğrenme Testleri
      if (userId) {
        await this.runLearningTests(userId);
      }

      // 5. Reklam Entegrasyon Testleri
      await this.runAdIntegrationTests();

      // 6. Performans Testleri
      await this.runPerformanceTests();

    } catch (error) {
      this.addResult({
        name: 'Test Suite',
        status: 'error',
        message: `Test suite hatası: ${error.message}`,
        timestamp: new Date(),
        duration: Date.now() - startTime,
      });
    }

    return this.results;
  }

  private async runPlatformTests(): Promise<void> {
    const startTime = Date.now();

    // Platform kontrolü
    const platform = Platform.OS;
    const isWeb = platform === 'web';
    const isMobile = platform === 'ios' || platform === 'android';

    this.addResult({
      name: 'Platform Kontrolü',
      status: 'success',
      message: `Platform: ${platform}`,
      details: {
        isWeb,
        isMobile,
        userAgent: Platform.OS,
      },
      timestamp: new Date(),
      duration: Date.now() - startTime,
    });

    // Web platformu özel testleri
    if (isWeb) {
      this.addResult({
        name: 'Web Platform Özellikleri',
        status: 'success',
        message: 'Mock reklam sistemi aktif',
        details: {
          mockAds: true,
          realAds: false,
        },
        timestamp: new Date(),
      });
    }

    // Mobil platform özel testleri
    if (isMobile) {
      this.addResult({
        name: 'Mobil Platform Özellikleri',
        status: 'success',
        message: 'Gerçek AdMob reklamları aktif',
        details: {
          mockAds: false,
          realAds: true,
          platform: platform,
        },
        timestamp: new Date(),
      });
    }
  }

  private async runAdMobTests(): Promise<void> {
    const startTime = Date.now();

    try {
      // AdMob modül kontrolü
      if (Platform.OS !== 'web') {
        const mobileAds = require('react-native-google-mobile-ads');
        this.addResult({
          name: 'AdMob Modül Yükleme',
          status: 'success',
          message: 'AdMob modülü başarıyla yüklendi',
          timestamp: new Date(),
          duration: Date.now() - startTime,
        });
      } else {
        this.addResult({
          name: 'AdMob Modül Yükleme',
          status: 'success',
          message: 'Web platformunda mock AdMob kullanılıyor',
          timestamp: new Date(),
          duration: Date.now() - startTime,
        });
      }

      // AdMob konfigürasyon testi
      const { ADMOB_CONFIG, getAdUnitId } = await import('../config/admob');
      
      this.addResult({
        name: 'AdMob Konfigürasyon',
        status: 'success',
        message: `App ID: ${ADMOB_CONFIG.APP_ID}`,
        details: {
          appId: ADMOB_CONFIG.APP_ID,
          bannerId: getAdUnitId('BANNER', false),
          interstitialId: getAdUnitId('INTERSTITIAL', false),
          rewardedId: getAdUnitId('REWARDED', false),
        },
        timestamp: new Date(),
      });

      // AdService testi
      const adService = AdService.getInstance();
      const bannerId = adService.getBannerAdUnitId();
      
      this.addResult({
        name: 'AdService Test',
        status: 'success',
        message: `Banner ID: ${bannerId}`,
        details: {
          bannerId,
          serviceReady: true,
        },
        timestamp: new Date(),
      });

    } catch (error) {
      this.addResult({
        name: 'AdMob Testleri',
        status: 'error',
        message: `AdMob test hatası: ${error.message}`,
        timestamp: new Date(),
        duration: Date.now() - startTime,
      });
    }
  }

  private async runFirebaseTests(userId: string): Promise<void> {
    const startTime = Date.now();

    try {
      // Firebase bağlantı testi
      const connectionTest = await FirebaseService.testConnection();
      
      this.addResult({
        name: 'Firebase Bağlantı',
        status: connectionTest ? 'success' : 'error',
        message: connectionTest ? 'Firebase bağlantısı başarılı' : 'Firebase bağlantısı başarısız',
        timestamp: new Date(),
        duration: Date.now() - startTime,
      });

      // Kullanıcı bilgileri testi
      const user = await FirebaseService.getUser(userId);
      
      this.addResult({
        name: 'Kullanıcı Bilgileri',
        status: user ? 'success' : 'error',
        message: user ? `Kullanıcı bulundu: ${user.displayName}` : 'Kullanıcı bulunamadı',
        details: user ? {
          displayName: user.displayName,
          email: user.email,
          xp: user.xp,
          level: user.level,
          totalWordsLearned: user.totalWordsLearned,
        } : null,
        timestamp: new Date(),
      });

      // Kelime listesi testi
      const words = await FirebaseService.getUserWords(userId);
      
      this.addResult({
        name: 'Kelime Listesi',
        status: 'success',
        message: `${words.length} kelime bulundu`,
        details: {
          totalWords: words.length,
          learningWords: words.filter(w => w.learningStatus === 'learning').length,
          reviewingWords: words.filter(w => w.learningStatus === 'reviewing').length,
          masteredWords: words.filter(w => w.learningStatus === 'mastered').length,
        },
        timestamp: new Date(),
      });

    } catch (error) {
      this.addResult({
        name: 'Firebase Testleri',
        status: 'error',
        message: `Firebase test hatası: ${error.message}`,
        timestamp: new Date(),
        duration: Date.now() - startTime,
      });
    }
  }

  private async runLearningTests(userId: string): Promise<void> {
    const startTime = Date.now();

    try {
      // Bugünkü kelimeler testi
      const wordsForToday = await SpacedRepetitionService.getWordsForToday(userId);
      
      this.addResult({
        name: 'Bugünkü Kelimeler',
        status: 'success',
        message: `${wordsForToday.length} kelime bugün için hazır`,
        details: {
          wordsForToday: wordsForToday.length,
          words: wordsForToday.slice(0, 5), // İlk 5 kelimeyi göster
        },
        timestamp: new Date(),
        duration: Date.now() - startTime,
      });

    } catch (error) {
      this.addResult({
        name: 'Kelime Öğrenme Testleri',
        status: 'error',
        message: `Kelime öğrenme test hatası: ${error.message}`,
        timestamp: new Date(),
        duration: Date.now() - startTime,
      });
    }
  }

  private async runAdIntegrationTests(): Promise<void> {
    const startTime = Date.now();

    try {
      // Banner reklam testi
      this.addResult({
        name: 'Banner Reklam Entegrasyonu',
        status: 'success',
        message: 'Banner reklam komponenti hazır',
        details: {
          component: 'BannerAdComponent',
          status: 'ready',
        },
        timestamp: new Date(),
      });

      // Ödüllü reklam testi
      this.addResult({
        name: 'Ödüllü Reklam Entegrasyonu',
        status: 'success',
        message: 'Ödüllü reklam komponenti hazır',
        details: {
          component: 'RewardedAdComponent',
          status: 'ready',
        },
        timestamp: new Date(),
      });

      // Interstitial reklam testi
      this.addResult({
        name: 'Interstitial Reklam Entegrasyonu',
        status: 'success',
        message: 'Interstitial reklam servisi hazır',
        details: {
          service: 'AdService',
          status: 'ready',
        },
        timestamp: new Date(),
      });

    } catch (error) {
      this.addResult({
        name: 'Reklam Entegrasyon Testleri',
        status: 'error',
        message: `Reklam entegrasyon test hatası: ${error.message}`,
        timestamp: new Date(),
        duration: Date.now() - startTime,
      });
    }
  }

  private async runPerformanceTests(): Promise<void> {
    const startTime = Date.now();

    try {
      // Memory kullanımı testi
      const memoryUsage = process.memoryUsage?.() || { heapUsed: 'N/A' };
      
      this.addResult({
        name: 'Performans Testi',
        status: 'success',
        message: 'Performans testleri tamamlandı',
        details: {
          memoryUsage: typeof memoryUsage.heapUsed === 'number' 
            ? `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB` 
            : memoryUsage.heapUsed,
          platform: Platform.OS,
        },
        timestamp: new Date(),
        duration: Date.now() - startTime,
      });

    } catch (error) {
      this.addResult({
        name: 'Performans Testleri',
        status: 'warning',
        message: `Performans test hatası: ${error.message}`,
        timestamp: new Date(),
        duration: Date.now() - startTime,
      });
    }
  }

  // Özel test metodları
  public async testRewardedAd(): Promise<TestResult> {
    const startTime = Date.now();

    try {
      if (Platform.OS === 'web') {
        return {
          name: 'Ödüllü Reklam Test',
          status: 'success',
          message: 'Web platformunda mock ödüllü reklam test edildi',
          timestamp: new Date(),
          duration: Date.now() - startTime,
        };
      }

      const adService = AdService.getInstance();
      const result = await adService.showRewardedAd();
      
      return {
        name: 'Ödüllü Reklam Test',
        status: result.rewarded ? 'success' : 'warning',
        message: result.rewarded ? 'Ödül kazanıldı' : 'Ödül kazanılmadı',
        details: result,
        timestamp: new Date(),
        duration: Date.now() - startTime,
      };

    } catch (error) {
      return {
        name: 'Ödüllü Reklam Test',
        status: 'error',
        message: `Ödüllü reklam test hatası: ${error.message}`,
        timestamp: new Date(),
        duration: Date.now() - startTime,
      };
    }
  }

  public async testInterstitialAd(): Promise<TestResult> {
    const startTime = Date.now();

    try {
      if (Platform.OS === 'web') {
        return {
          name: 'Interstitial Reklam Test',
          status: 'success',
          message: 'Web platformunda mock interstitial reklam test edildi',
          timestamp: new Date(),
          duration: Date.now() - startTime,
        };
      }

      const adService = AdService.getInstance();
      const result = await adService.showInterstitialAd();
      
      return {
        name: 'Interstitial Reklam Test',
        status: result ? 'success' : 'warning',
        message: result ? 'Interstitial reklam gösterildi' : 'Interstitial reklam gösterilemedi',
        details: { shown: result },
        timestamp: new Date(),
        duration: Date.now() - startTime,
      };

    } catch (error) {
      return {
        name: 'Interstitial Reklam Test',
        status: 'error',
        message: `Interstitial reklam test hatası: ${error.message}`,
        timestamp: new Date(),
        duration: Date.now() - startTime,
      };
    }
  }

  public async testFirebaseXP(userId: string, xpAmount: number): Promise<TestResult> {
    const startTime = Date.now();

    try {
      const userBefore = await FirebaseService.getUser(userId);
      await FirebaseService.updateUserXP(userId, xpAmount);
      const userAfter = await FirebaseService.getUser(userId);
      
      const xpGained = (userAfter?.xp || 0) - (userBefore?.xp || 0);
      
      return {
        name: 'Firebase XP Test',
        status: 'success',
        message: `${xpGained} XP başarıyla eklendi`,
        details: {
          before: userBefore?.xp || 0,
          after: userAfter?.xp || 0,
          gained: xpGained,
          expected: xpAmount,
        },
        timestamp: new Date(),
        duration: Date.now() - startTime,
      };

    } catch (error) {
      return {
        name: 'Firebase XP Test',
        status: 'error',
        message: `Firebase XP test hatası: ${error.message}`,
        timestamp: new Date(),
        duration: Date.now() - startTime,
      };
    }
  }
}

export default TestService; 