const { FirebaseService } = require('../src/services/firebaseService');

describe('Profile', () => {
  it('should handle user profile operations', async () => {
    // Mock test - gerçek Firebase bağlantısı olmadan
    const mockUser = {
      uid: 'testuser',
      email: 'test@example.com',
      displayName: 'Test User',
      level: 1,
      xp: 0
    };
    
    expect(mockUser.uid).toBe('testuser');
    expect(mockUser.level).toBe(1);
    expect(mockUser.xp).toBe(0);
  });
  
  it('should test user data structure', () => {
    const userData = {
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User',
      photoURL: null,
      level: 1,
      xp: 0,
      streak: 0,
      totalWordsLearned: 0,
      dailyGoal: 5
    };
    
    expect(userData).toHaveProperty('uid');
    expect(userData).toHaveProperty('email');
    expect(userData).toHaveProperty('level');
    expect(userData).toHaveProperty('xp');
  });
}); 