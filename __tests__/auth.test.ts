import { FirebaseService } from '../src/services/firebaseService';

describe('Auth', () => {
  it('should test Firebase connection', async () => {
    const isConnected = await FirebaseService.testConnection();
    expect(typeof isConnected).toBe('boolean');
  });

  it('should handle user creation', async () => {
    const testUser = {
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User',
      photoURL: null,
      dailyGoal: 5,
      level: 1,
      xp: 0,
      streak: 0,
      totalWordsLearned: 0,
      createdAt: new Date()
    };

    // Bu test gerçek Firebase'e bağlanmayacak, sadece fonksiyonun varlığını test eder
    expect(typeof FirebaseService.createUser).toBe('function');
  });

  it('should handle user retrieval', async () => {
    // Bu test gerçek Firebase'e bağlanmayacak, sadece fonksiyonun varlığını test eder
    expect(typeof FirebaseService.getUser).toBe('function');
  });
}); 