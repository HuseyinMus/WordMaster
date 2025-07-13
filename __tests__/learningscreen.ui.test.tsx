import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LearningScreen from '../src/screens/LearningScreen';
import { AuthContext } from '../src/contexts/AuthContext';

const mockUser = { uid: 'testuser', email: 'test@test.com' };

jest.mock('../src/services/spacedRepetition', () => ({
  SpacedRepetitionService: {
    updateWordProgress: jest.fn(),
    getWordsForTodayFromList: jest.fn(() => []),
    getNewWords: jest.fn(() => []),
  },
}));

jest.mock('../src/services/firebaseService', () => ({
  FirebaseService: {
    getUserWords: jest.fn(async () => [
      {
        id: '1',
        word: 'apple',
        meaning: 'elma',
        example: 'I eat an apple.',
        difficulty: 'easy',
        learningStatus: 'new',
        interval: 1,
        efactor: 2.5,
        repetitions: 0,
        nextReviewDate: null,
        lastReviewed: null,
        createdAt: new Date(),
        userId: 'testuser',
      },
    ]),
    updateWord: jest.fn(),
    updateUserXP: jest.fn(),
  },
}));

describe('LearningScreen UI', () => {
  it('ekran render edilir ve kelime görünür', async () => {
    const navigation = { navigate: jest.fn(), goBack: jest.fn() };
    const route = {};
    const { getByText, findByText } = render(
      <AuthContext.Provider value={{ user: mockUser }}>
        <LearningScreen navigation={navigation} route={route} />
      </AuthContext.Provider>
    );

    // Yükleniyor yazısı gelir
    expect(getByText(/Kelimeler yükleniyor/i)).toBeTruthy();

    // Elma kelimesi ekranda görünür
    const word = await findByText('apple');
    expect(word).toBeTruthy();
    // Türkçe anlamı kart arkasında, kartı çevirince görünür
  });

  it('Tekrar Dinle butonu çalışır', async () => {
    const navigation = { navigate: jest.fn(), goBack: jest.fn() };
    const route = {};
    const { findByText } = render(
      <AuthContext.Provider value={{ user: mockUser }}>
        <LearningScreen navigation={navigation} route={route} />
      </AuthContext.Provider>
    );
    const btn = await findByText(/Tekrar Dinle/i);
    expect(btn).toBeTruthy();
    fireEvent.press(btn);
    // Burada gerçek ses çalınmaz, sadece butonun tıklanabilir olduğu test edilir
  });
}); 