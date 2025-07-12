import { QuizService } from '../src/services/quizService';
import { Word } from '../src/types';

describe('Quiz', () => {
  it('should create a multiple choice question', () => {
    const word: Word = { 
      id: '1', 
      word: 'apple', 
      meaning: 'elma', 
      example: 'I eat an apple.', 
      difficulty: 'easy', 
      learningStatus: 'new', 
      userId: 'test',
      interval: 1,
      efactor: 2.5,
      repetitions: 0,
      nextReviewDate: new Date(),
      lastReviewed: new Date(),
      createdAt: new Date(),
      reviewCount: 0
    };
    
    const allWords: Word[] = [
      word, 
      { 
        id: '2', 
        word: 'banana', 
        meaning: 'muz', 
        example: '', 
        difficulty: 'easy', 
        learningStatus: 'new', 
        userId: 'test',
        interval: 1,
        efactor: 2.5,
        repetitions: 0,
        nextReviewDate: new Date(),
        lastReviewed: new Date(),
        createdAt: new Date(),
        reviewCount: 0
      }
    ];
    
    const question = QuizService.createMultipleChoiceQuestion(word, allWords);
    expect(question.options).toContain('elma');
    expect(question.correctAnswer).toBe('elma');
  });
}); 