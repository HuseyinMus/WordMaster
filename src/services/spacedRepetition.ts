export class SpacedRepetitionService {
  // Anki algoritması parametreleri
  private static readonly INITIAL_INTERVAL = 1; // 1 gün
  private static readonly INITIAL_EFACTOR = 2.5;
  private static readonly MIN_EFACTOR = 1.3;
  private static readonly MAX_INTERVAL = 365; // Maksimum 365 gün

  /**
   * Güvenli tarih oluştur
   */
  private static createSafeDate(daysFromNow: number): Date {
    try {
      const now = new Date();
      const futureDate = new Date(now);
      futureDate.setDate(now.getDate() + daysFromNow);
      
      // Tarih geçerli mi kontrol et
      if (isNaN(futureDate.getTime())) {
        console.warn('Invalid date created, using current date + 1 day');
        const fallbackDate = new Date();
        fallbackDate.setDate(fallbackDate.getDate() + 1);
        return fallbackDate;
      }
      
      return futureDate;
    } catch (error) {
      console.warn('Error creating date:', error);
      const fallbackDate = new Date();
      fallbackDate.setDate(fallbackDate.getDate() + 1);
      return fallbackDate;
    }
  }

  /**
   * Yeni kelime için başlangıç değerlerini döndür
   */
  static getInitialValues() {
    return {
      interval: this.INITIAL_INTERVAL,
      efactor: this.INITIAL_EFACTOR,
      repetitions: 0,
      nextReviewDate: this.createSafeDate(this.INITIAL_INTERVAL)
    };
  }

  /**
   * Kelime tekrarı sonrası yeni değerleri hesapla
   * @param quality 0-5 arası kalite puanı (0: hiç hatırlamadı, 5: mükemmel)
   * @param currentInterval mevcut interval
   * @param currentEfactor mevcut efactor
   * @param repetitions mevcut tekrar sayısı
   */
  static calculateNextReview(quality: number, currentInterval: number, currentEfactor: number, repetitions: number) {
    let newEfactor = currentEfactor;
    let newInterval = currentInterval;

    // E-factor hesaplama
    newEfactor = currentEfactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    newEfactor = Math.max(this.MIN_EFACTOR, Math.min(2.6, newEfactor));

    // Interval hesaplama
    if (quality < 3) {
      // Yanlış cevap - interval'i sıfırla
      newInterval = this.INITIAL_INTERVAL;
    } else {
      // Doğru cevap
      if (repetitions === 0) {
        newInterval = 1;
      } else if (repetitions === 1) {
        newInterval = 6;
      } else {
        newInterval = Math.round(newInterval * newEfactor);
      }
    }

    const newRepetitions = quality < 3 ? 0 : repetitions + 1;
    
    // Interval'i güvenli bir aralıkta tut
    const safeInterval = Math.min(Math.max(newInterval, 1), this.MAX_INTERVAL);
    
    return {
      interval: safeInterval,
      efactor: newEfactor,
      repetitions: newRepetitions,
      nextReviewDate: this.createSafeDate(safeInterval)
    };
  }

  /**
   * Kalite puanını kullanıcı cevabından hesapla
   * @param isCorrect doğru mu yanlış mı
   * @param responseTime cevap süresi (ms)
   * @param difficulty kelime zorluğu
   */
  static calculateQuality(isCorrect: boolean, responseTime: number, difficulty: 'easy' | 'medium' | 'hard'): number {
    if (!isCorrect) return 0;

    // Cevap süresine göre kalite hesaplama
    let timeQuality = 5;
    if (responseTime > 10000) timeQuality = 3; // 10 saniyeden fazla
    else if (responseTime > 5000) timeQuality = 4; // 5-10 saniye
    else if (responseTime > 2000) timeQuality = 5; // 2-5 saniye
    else timeQuality = 5; // 2 saniyeden az

    // Zorluk seviyesine göre bonus
    const difficultyBonus = {
      easy: 0,
      medium: 0,
      hard: 1
    };

    return timeQuality + difficultyBonus[difficulty];
  }

  /**
   * Bugün tekrar edilmesi gereken kelimeleri filtrele
   * @param words kelime listesi
   */
  static getWordsForTodayFromList(words: any[]): any[] {
    console.log('Getting words for today from:', words.length, 'total words');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const reviewWords = words.filter(word => {
      if (!word.nextReviewDate) {
        console.log('Word without nextReviewDate:', word.word);
        return true;
      }
      try {
        const nextReview = new Date(word.nextReviewDate);
        if (isNaN(nextReview.getTime())) {
          console.log('Invalid nextReviewDate for word:', word.word);
          return true;
        }
        nextReview.setHours(0, 0, 0, 0);
        return nextReview <= today;
      } catch (error) {
        console.log('Error parsing nextReviewDate for word:', word.word, error);
        return true;
      }
    });
    console.log('Found review words:', reviewWords.length);
    return reviewWords;
  }

  /**
   * Yeni kelimeleri filtrele
   * @param words kelime listesi
   * @param dailyGoal günlük hedef
   */
  static getNewWords(words: any[], dailyGoal: number): any[] {
    console.log('Getting new words from:', words.length, 'total words');
    const newWords = words.filter(word => 
      word.learningStatus === 'new' || 
      word.learningStatus === 'learning' || 
      word.learningStatus === 'reviewing'
    );
    console.log('Found new words:', newWords.length);
    const limitedNewWords = newWords.slice(0, dailyGoal);
    console.log('Limited new words to daily goal:', limitedNewWords.length);
    return limitedNewWords;
  }

  /**
   * Kullanıcı için bugünkü kelimeleri al (userId ile)
   * @param userId kullanıcı ID
   */
  static async getWordsForTodayByUserId(userId: string): Promise<string[]> {
    try {
      const { FirebaseService } = await import('./firebaseService');
      const userWords = await FirebaseService.getUserWords(userId);
      if (userWords.length === 0) {
        return [];
      }
      const reviewWords = this.getWordsForTodayFromList(userWords);
      const newWords = this.getNewWords(userWords, 5); // Günlük 5 yeni kelime
      const wordsForToday = [...reviewWords, ...newWords];
      return wordsForToday.map(word => word.word);
    } catch (error) {
      console.error('Error getting words for today:', error);
      return [];
    }
  }

  /**
   * Kelime ilerlemesini güncelle
   * @param userId kullanıcı ID
   * @param word kelime
   * @param knowledgeLevel 1-5 arası bilgi seviyesi
   */
  static async updateWordProgress(userId: string, word: string, knowledgeLevel: number): Promise<void> {
    try {
      const { FirebaseService } = await import('./firebaseService');
      const userWords = await FirebaseService.getUserWords(userId);
      const wordData = userWords.find(w => w.word === word);
      if (!wordData) {
        console.warn('Word not found:', word);
        return;
      }
      const quality = Math.max(1, Math.min(5, knowledgeLevel));
      const newValues = this.calculateNextReview(
        quality,
        wordData.interval || 1,
        wordData.efactor || 2.5,
        wordData.repetitions || 0
      );
      await FirebaseService.updateWord(wordData.id, {
        ...newValues,
        learningStatus: quality >= 3 ? 'learning' : 'reviewing',
        lastReviewed: new Date()
      });
      const xpGained = quality * 10;
      await FirebaseService.updateUserXP(userId, xpGained);
    } catch (error) {
      console.error('Error updating word progress:', error);
      throw error;
    }
  }
} 