const { FirebaseService } = require('../src/services/firebaseService');

describe('Words', () => {
  it('should add a word and list it', async () => {
    const testWord = {
      word: 'testword',
      meaning: 'test anlam',
      example: 'This is a test.',
      difficulty: 'easy',
      learningStatus: 'new',
      userId: 'testuser',
    };
    const wordId = await FirebaseService.addWord(testWord);
    expect(wordId).toBeDefined();
    const words = await FirebaseService.getUserWords('testuser');
    expect(words.map(w => w.word)).toContain('testword');
  });
}); 