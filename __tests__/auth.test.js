const { FirebaseService } = require('../src/services/firebaseService');

describe('Auth', () => {
  it('should not allow login with wrong credentials', async () => {
    await expect(FirebaseService.login('wrong@example.com', 'wrongpass')).rejects.toBeDefined();
  });
  // Gerçek kullanıcı ile test etmek için aşağıdaki satırı doldurabilirsin
  // it('should login with correct credentials', async () => {
  //   const user = await FirebaseService.login('test@example.com', 'testpass');
  //   expect(user).toBeDefined();
  // });
}); 