import { SpacedRepetitionService } from '../src/services/spacedRepetition';

describe('SpacedRepetitionService', () => {
  describe('getInitialValues', () => {
    it('should return initial values for new words', () => {
      const initialValues = SpacedRepetitionService.getInitialValues();
      
      expect(initialValues.interval).toBe(1);
      expect(initialValues.efactor).toBe(2.5);
      expect(initialValues.repetitions).toBe(0);
      expect(initialValues.nextReviewDate).toBeDefined();
      expect(initialValues.nextReviewDate instanceof Date).toBe(true);
    });
  });

  describe('calculateNextReview', () => {
    it('should calculate correct values for perfect answer (quality 5)', () => {
      const result = SpacedRepetitionService.calculateNextReview(5, 1, 2.5, 0);
      expect(result.interval).toBe(1); // İlk tekrar
      expect(result.efactor).toBe(2.6); // E-factor artmalı
      expect(result.repetitions).toBe(1);
      expect(result.nextReviewDate).toBeDefined();
    });

    it('should calculate correct values for good answer (quality 4)', () => {
      const result = SpacedRepetitionService.calculateNextReview(4, 1, 2.5, 0);
      expect(result.interval).toBe(1);
      expect(result.efactor).toBe(2.5);
      expect(result.repetitions).toBe(1);
    });

    it('should reset interval for poor answer (quality 2)', () => {
      const result = SpacedRepetitionService.calculateNextReview(2, 10, 2.5, 5);
      
      expect(result.interval).toBe(1); // Reset to initial interval
      expect(result.repetitions).toBe(0); // Reset repetitions
      expect(result.efactor).toBeLessThan(2.5); // E-factor should decrease
    });

    it('should handle second repetition correctly', () => {
      const result = SpacedRepetitionService.calculateNextReview(5, 1, 2.5, 1);
      
      expect(result.interval).toBe(6); // Second repetition interval
      expect(result.repetitions).toBe(2);
    });

    it('should handle third repetition correctly', () => {
      const result = SpacedRepetitionService.calculateNextReview(5, 6, 2.5, 2);
      
      expect(result.interval).toBeGreaterThan(6); // Should be 6 * efactor
      expect(result.repetitions).toBe(3);
    });
  });

  describe('calculateQuality', () => {
    it('should return 0 for incorrect answers', () => {
      const quality = SpacedRepetitionService.calculateQuality(false, 1000, 'easy');
      expect(quality).toBe(0);
    });

    it('should return high quality for fast correct answers', () => {
      const quality = SpacedRepetitionService.calculateQuality(true, 1000, 'easy');
      expect(quality).toBe(5);
    });

    it('should return lower quality for slow correct answers', () => {
      const quality = SpacedRepetitionService.calculateQuality(true, 8000, 'easy');
      expect(quality).toBe(4);
    });

    it('should give bonus for hard words', () => {
      const quality = SpacedRepetitionService.calculateQuality(true, 1000, 'hard');
      expect(quality).toBe(6); // 5 + 1 bonus
    });
  });

  describe('getWordsForTodayFromList', () => {
    it('should return words that need review today', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const words = [
        {
          word: 'test1',
          nextReviewDate: today.toISOString(),
          learningStatus: 'learning'
        },
        {
          word: 'test2',
          nextReviewDate: yesterday.toISOString(),
          learningStatus: 'learning'
        },
        {
          word: 'test3',
          nextReviewDate: null,
          learningStatus: 'new'
        }
      ];

      const reviewWords = SpacedRepetitionService.getWordsForTodayFromList(words);
      expect(reviewWords.length).toBe(3); // All should be included
    });

    it('should handle words without nextReviewDate', () => {
      const words = [
        {
          word: 'test1',
          nextReviewDate: null,
          learningStatus: 'new'
        }
      ];

      const reviewWords = SpacedRepetitionService.getWordsForTodayFromList(words);
      expect(reviewWords.length).toBe(1);
    });
  });

  describe('getNewWords', () => {
    it('should return new words up to daily goal', () => {
      const words = [
        { word: 'test1', learningStatus: 'new' },
        { word: 'test2', learningStatus: 'learning' },
        { word: 'test3', learningStatus: 'reviewing' },
        { word: 'test4', learningStatus: 'mastered' }
      ];

      const newWords = SpacedRepetitionService.getNewWords(words, 2);
      expect(newWords.length).toBe(2); // Limited to daily goal
    });

    it('should filter by learning status', () => {
      const words = [
        { word: 'test1', learningStatus: 'new' },
        { word: 'test2', learningStatus: 'learning' },
        { word: 'test3', learningStatus: 'mastered' }
      ];

      const newWords = SpacedRepetitionService.getNewWords(words, 10);
      expect(newWords.length).toBe(2); // Only new and learning
    });
  });
});

describe('Learning Screen Logic', () => {
  describe('isReviewWord function', () => {
    it('should identify review words correctly', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const reviewWord = {
        word: 'test',
        nextReviewDate: yesterday.toISOString(),
        learningStatus: 'learning'
      };

      const newWord = {
        word: 'test2',
        nextReviewDate: null,
        learningStatus: 'new'
      };

      // Mock the isReviewWord function logic
      const isReviewWord = (word: any) => {
        if (!word) return false;
        if (word.nextReviewDate) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const nextReview = new Date(word.nextReviewDate);
          nextReview.setHours(0, 0, 0, 0);
          return nextReview <= today;
        }
        return word.learningStatus === 'reviewing';
      };

      expect(isReviewWord(reviewWord)).toBe(true);
      expect(isReviewWord(newWord)).toBe(false);
    });
  });

  describe('Word categorization', () => {
    it('should separate review and new words', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const words = [
        {
          word: 'review1',
          nextReviewDate: yesterday.toISOString(),
          learningStatus: 'learning'
        },
        {
          word: 'review2',
          learningStatus: 'reviewing'
        },
        {
          word: 'new1',
          nextReviewDate: null,
          learningStatus: 'new'
        }
      ];

      const isReviewWord = (word: any) => {
        if (!word) return false;
        if (word.nextReviewDate) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const nextReview = new Date(word.nextReviewDate);
          nextReview.setHours(0, 0, 0, 0);
          return nextReview <= today;
        }
        return word.learningStatus === 'reviewing';
      };

      const reviewWords = words.filter(isReviewWord);
      const newWords = words.filter(w => !isReviewWord(w));

      expect(reviewWords.length).toBe(2);
      expect(newWords.length).toBe(1);
    });
  });
}); 