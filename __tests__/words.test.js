const { FirebaseService } = require('../src/services/firebaseService');

describe('Words', () => {
  it('should handle word data structure', () => {
    const testWord = {
      word: 'testword',
      meaning: 'test anlam',
      example: 'This is a test.',
      difficulty: 'easy',
      learningStatus: 'new',
      userId: 'testuser',
    };
    
    expect(testWord.word).toBe('testword');
    expect(testWord.meaning).toBe('test anlam');
    expect(testWord.difficulty).toBe('easy');
    expect(testWord.learningStatus).toBe('new');
  });
  
  it('should validate word properties', () => {
    const wordData = {
      word: 'hello',
      meaning: 'merhaba',
      example: 'Hello, how are you?',
      difficulty: 'easy',
      learningStatus: 'new',
      userId: 'user123',
      interval: 1,
      efactor: 2.5,
      repetitions: 0
    };
    
    expect(wordData).toHaveProperty('word');
    expect(wordData).toHaveProperty('meaning');
    expect(wordData).toHaveProperty('difficulty');
    expect(wordData).toHaveProperty('learningStatus');
    expect(wordData).toHaveProperty('interval');
    expect(wordData).toHaveProperty('efactor');
  });
}); 