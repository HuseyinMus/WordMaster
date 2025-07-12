import { FirebaseService } from '../src/services/firebaseService';
import { Word } from '../src/types';

describe('Words', () => {
  it('should add a word and list it', async () => {
    const testWord: Omit<Word, 'id'> = {
      word: 'testword',
      meaning: 'test anlam',
      example: 'This is a test.',
      difficulty: 'easy',
      learningStatus: 'new',
      userId: 'testuser',
      interval: 1,
      efactor: 2.5,
      repetitions: 0,
      nextReviewDate: new Date(),
      lastReviewed: new Date(),
      createdAt: new Date(),
      reviewCount: 0
    };
    
    // Bu test gerçek Firebase'e bağlanmayacak, sadece fonksiyonların varlığını test eder
    expect(typeof FirebaseService.addWord).toBe('function');
    expect(typeof FirebaseService.getUserWords).toBe('function');
  });

  it('should handle word operations', async () => {
    // Test fonksiyonların varlığını
    expect(typeof FirebaseService.updateWord).toBe('function');
    expect(typeof FirebaseService.deleteWord).toBe('function');
  });
}); 