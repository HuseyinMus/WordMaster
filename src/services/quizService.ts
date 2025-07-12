import { Word, QuizQuestion } from '../types';

export class QuizService {
  /**
   * Çoktan seçmeli soru oluştur
   */
  static createMultipleChoiceQuestion(word: Word, allWords: Word[]): QuizQuestion {
    // Doğru cevap
    const correctAnswer = word.meaning;
    
    // Yanlış cevaplar için diğer kelimelerden rastgele seç
    const otherWords = allWords.filter(w => w.id !== word.id);
    const wrongAnswers = this.shuffleArray(otherWords)
      .slice(0, 3)
      .map(w => w.meaning);
    
    // Tüm seçenekleri karıştır
    const options = this.shuffleArray([correctAnswer, ...wrongAnswers]);
    
    // Türkçe açıklama ekle
    const turkishHint = this.getTurkishHint(word);
    
    return {
      id: `quiz_${word.id}_${Date.now()}`,
      wordId: word.id,
      type: 'multiple_choice',
      question: `"${word.word}" kelimesinin anlamı nedir?\n\n${turkishHint}`,
      options,
      correctAnswer
    };
  }

  /**
   * Cümle tamamlama sorusu oluştur
   */
  static createFillBlankQuestion(word: Word): QuizQuestion {
    // Örnek cümleyi kelime ile değiştir
    const blankSentence = word.example.replace(
      new RegExp(word.word, 'gi'), 
      '_____'
    );
    
    // Türkçe açıklama ekle
    const turkishHint = this.getTurkishHint(word);
    
    return {
      id: `fill_${word.id}_${Date.now()}`,
      wordId: word.id,
      type: 'fill_blank',
      question: `Aşağıdaki cümledeki boşluğu doldurun:\n\n${blankSentence}\n\n${turkishHint}`,
      correctAnswer: word.word.toLowerCase()
    };
  }

  /**
   * Eşleştirme sorusu oluştur
   */
  static createMatchingQuestion(words: Word[]): QuizQuestion {
    if (words.length < 2) {
      throw new Error('Eşleştirme sorusu için en az 2 kelime gerekli');
    }

    const selectedWords = this.shuffleArray(words).slice(0, 2);
    const question = selectedWords
      .map((word, index) => `${index + 1}. ${word.word}`)
      .join('\n');
    
    const correctAnswer = selectedWords
      .map((word, index) => `${index + 1}-${word.meaning}`)
      .join(', ');

    return {
      id: `match_${Date.now()}`,
      wordId: selectedWords[0].id, // İlk kelimeyi referans al
      type: 'matching',
      question: `Aşağıdaki kelimeleri anlamlarıyla eşleştirin:\n\n${question}`,
      correctAnswer
    };
  }

  /**
   * Kelime için rastgele quiz türü seç
   */
  static createRandomQuiz(word: Word, allWords: Word[]): QuizQuestion {
    const quizTypes = ['multiple_choice', 'fill_blank'];
    const randomType = quizTypes[Math.floor(Math.random() * quizTypes.length)];
    
    switch (randomType) {
      case 'multiple_choice':
        return this.createMultipleChoiceQuestion(word, allWords);
      case 'fill_blank':
        return this.createFillBlankQuestion(word);
      default:
        return this.createMultipleChoiceQuestion(word, allWords);
    }
  }

  /**
   * Quiz sonucunu değerlendir
   */
  static evaluateQuiz(question: QuizQuestion, userAnswer: string): boolean {
    const normalizedUserAnswer = userAnswer.trim().toLowerCase();
    const normalizedCorrectAnswer = question.correctAnswer.trim().toLowerCase();
    
    return normalizedUserAnswer === normalizedCorrectAnswer;
  }

  /**
   * Quiz zorluğunu hesapla
   */
  static calculateQuizDifficulty(question: QuizQuestion, word: Word): 'easy' | 'medium' | 'hard' {
    switch (question.type) {
      case 'multiple_choice':
        return 'easy';
      case 'fill_blank':
        return word.difficulty;
      case 'matching':
        return 'medium';
      default:
        return 'medium';
    }
  }

  /**
   * Türkçe ipucu oluştur
   */
  private static getTurkishHint(word: Word): string {
    const hints = {
      easy: '💡 Bu kelime günlük hayatta sık kullanılır.',
      medium: '💡 Bu kelime orta seviyede bir kelimedir.',
      hard: '💡 Bu kelime ileri seviyede bir kelimedir.'
    };
    
    const difficultyHint = hints[word.difficulty] || hints.medium;
    const exampleHint = `📝 Örnek: ${word.example}`;
    
    return `${difficultyHint}\n${exampleHint}`;
  }

  /**
   * Dizi karıştırma yardımcı fonksiyonu
   */
  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
} 