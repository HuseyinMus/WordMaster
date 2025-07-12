const { FirebaseService } = require('../src/services/firebaseService');

describe('Profile', () => {
  it('should get user profile', async () => {
    const user = await FirebaseService.getUser('testuser');
    expect(user).toBeDefined();
  });
}); 