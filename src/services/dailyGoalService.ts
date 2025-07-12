import { DailyStats, Word } from '../types';
import { FirebaseService } from './firebaseService';

export class DailyGoalService {
  /**
   * Bugünkü istatistikleri al
   */
  static async getTodayStats(userId: string): Promise<DailyStats | null> {
    const today = new Date().toISOString().split('T')[0];
    return await FirebaseService.getDailyStats(userId, today);
  }

  /**
   * Bugünkü istatistikleri oluştur veya güncelle
   */
  static async updateTodayStats(
    userId: string, 
    wordsLearned: number = 0, 
    wordsReviewed: number = 0, 
    correctAnswers: number = 0, 
    totalQuestions: number = 0, 
    xpEarned: number = 0
  ): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const existingStats = await this.getTodayStats(userId);
    
    const updatedStats: DailyStats = {
      date: today,
      userId,
      wordsLearned: (existingStats?.wordsLearned || 0) + wordsLearned,
      wordsReviewed: (existingStats?.wordsReviewed || 0) + wordsReviewed,
      correctAnswers: (existingStats?.correctAnswers || 0) + correctAnswers,
      totalQuestions: (existingStats?.totalQuestions || 0) + totalQuestions,
      xpEarned: (existingStats?.xpEarned || 0) + xpEarned
    };
    
    await FirebaseService.saveDailyStats(updatedStats);
  }

  /**
   * Günlük hedefi kontrol et
   */
  static async checkDailyGoal(userId: string, dailyGoal: number): Promise<{
    isCompleted: boolean;
    progress: number;
    remaining: number;
    stats: DailyStats | null;
  }> {
    const stats = await this.getTodayStats(userId);
    const wordsLearned = stats?.wordsLearned || 0;
    const progress = Math.min(wordsLearned, dailyGoal);
    const remaining = Math.max(0, dailyGoal - wordsLearned);
    const isCompleted = wordsLearned >= dailyGoal;
    
    return {
      isCompleted,
      progress,
      remaining,
      stats
    };
  }

  /**
   * Kelime öğrenildiğinde istatistikleri güncelle
   */
  static async onWordLearned(userId: string, word: Word, xpEarned: number = 10): Promise<void> {
    await this.updateTodayStats(userId, 1, 0, 0, 0, xpEarned);
  }

  /**
   * Kelime tekrarlandığında istatistikleri güncelle
   */
  static async onWordReviewed(userId: string, isCorrect: boolean, xpEarned: number = 5): Promise<void> {
    await this.updateTodayStats(
      userId, 
      0, 
      1, 
      isCorrect ? 1 : 0, 
      1, 
      isCorrect ? xpEarned : 0
    );
  }

  /**
   * Quiz tamamlandığında istatistikleri güncelle
   */
  static async onQuizCompleted(
    userId: string, 
    correctAnswers: number, 
    totalQuestions: number, 
    xpEarned: number = 15
  ): Promise<void> {
    await this.updateTodayStats(userId, 0, 0, correctAnswers, totalQuestions, xpEarned);
  }

  /**
   * Haftalık istatistikleri al
   */
  static async getWeeklyStats(userId: string): Promise<DailyStats[]> {
    const stats: DailyStats[] = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      const dayStats = await FirebaseService.getDailyStats(userId, dateString);
      
      if (dayStats) {
        stats.push(dayStats);
      } else {
        // Boş gün için varsayılan istatistik
        stats.push({
          date: dateString,
          userId,
          wordsLearned: 0,
          wordsReviewed: 0,
          correctAnswers: 0,
          totalQuestions: 0,
          xpEarned: 0
        });
      }
    }
    
    return stats;
  }

  /**
   * Başarı rozetlerini kontrol et
   */
  static async checkAchievements(userId: string, stats: DailyStats): Promise<string[]> {
    const achievements: string[] = [];
    
    // Günlük hedef tamamlama
    if (stats.wordsLearned >= 5) {
      achievements.push('daily_goal_complete');
    }
    
    // Mükemmel quiz skoru
    if (stats.totalQuestions > 0 && stats.correctAnswers === stats.totalQuestions) {
      achievements.push('perfect_quiz');
    }
    
    // Yüksek XP kazanma
    if (stats.xpEarned >= 100) {
      achievements.push('high_xp_earner');
    }
    
    return achievements;
  }
} 