const { QuizService } = require('../src/services/quizService');

describe('Quiz', () => {
  it('should create a multiple choice question', () => {
    const word = { id: '1', word: 'apple', meaning: 'elma', example: 'I eat an apple.', difficulty: 'easy', learningStatus: 'new', userId: 'test' };
    const allWords = [word, { id: '2', word: 'banana', meaning: 'muz', example: '', difficulty: 'easy', learningStatus: 'new', userId: 'test' }];
    const question = QuizService.createMultipleChoiceQuestion(word, allWords);
    expect(question.options).toContain('elma');
    expect(question.correctAnswer).toBe('elma');
  });
}); 