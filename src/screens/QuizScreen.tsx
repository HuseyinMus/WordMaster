import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  Animated,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { FirebaseService } from '../services/firebaseService';
import { QuizService } from '../services/quizService';
import { DailyGoalService } from '../services/dailyGoalService';
import { Word, QuizQuestion } from '../types';
import AdService from '../services/adService';
import RewardedAdComponent from '../components/RewardedAdComponent';

const { width, height } = Dimensions.get('window');

const QuizScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const [words, setWords] = useState<Word[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(1));
  const adService = AdService.getInstance();

  useEffect(() => {
    loadQuiz();
  }, []);

  const loadQuiz = async () => {
    if (!user) return;

    try {
      const userWords = await FirebaseService.getUserWords(user.uid);
      const learningWords = userWords.filter(word => 
        word.learningStatus === 'learning' || 
        word.learningStatus === 'reviewing' ||
        word.learningStatus === 'mastered'
      );
      
      if (learningWords.length === 0) {
        Alert.alert(
          'Quiz Yok',
          'Henüz öğrenmeye başladığınız kelime bulunmuyor. Önce kelime öğrenmeye başlayın!',
          [{ text: 'Ana Sayfaya Dön', onPress: () => navigation.navigate('Home') }]
        );
        return;
      }

      // Quiz sorularını oluştur
      const questions: QuizQuestion[] = [];
      const shuffledWords = learningWords.sort(() => Math.random() - 0.5);
      
      // Her kelime için bir soru oluştur
      shuffledWords.slice(0, Math.min(10, learningWords.length)).forEach(word => {
        const question = QuizService.createRandomQuiz(word, learningWords);
        questions.push(question);
      });

      setWords(shuffledWords);
      setCurrentQuestion(questions[0]);
      setTotalQuestions(questions.length);
      setLoading(false);
    } catch (error) {
      console.error('Quiz yüklenirken hata:', error);
      setLoading(false);
    }
  };

  const handleAnswer = (answer: string) => {
    if (!currentQuestion || isAnswered) return;

    const correct = QuizService.evaluateQuiz(currentQuestion, answer);
    setIsCorrect(correct);
    setIsAnswered(true);
    setUserAnswer(answer);
    
    if (correct) {
      setScore(score + 1);
    }
  };

  const handleOptionSelect = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
    handleAnswer(option);
  };

  const handleTextAnswer = () => {
    if (!userAnswer.trim() || isAnswered) return;
    handleAnswer(userAnswer);
  };

  const handleNext = async () => {
    if (!currentQuestion || !user) return;

    console.log('handleNext called');
    console.log('Current question index:', currentQuestionIndex);
    console.log('Total questions:', totalQuestions);

    // Kelimeyi güncelle
    const word = words.find(w => w.id === currentQuestion.wordId);
    if (word) {
      try {
        await DailyGoalService.onWordReviewed(user.uid, isCorrect, isCorrect ? 10 : 0);
      } catch (error) {
        console.warn('Error updating daily stats:', error);
      }
    }

    // Sonraki soruya geç
    const nextIndex = currentQuestionIndex + 1;
    console.log('Next index:', nextIndex);
    
    if (nextIndex < totalQuestions) {
      console.log('Moving to next question');
      setCurrentQuestionIndex(nextIndex);
      
      // Yeni soru oluştur
      const nextWord = words[nextIndex];
      console.log('Next word:', nextWord?.word);
      
      if (nextWord) {
        const nextQuestion = QuizService.createRandomQuiz(nextWord, words);
        console.log('Next question created:', nextQuestion.question);
        setCurrentQuestion(nextQuestion);
      }
      
      setUserAnswer('');
      setSelectedOption(null);
      setIsAnswered(false);
      setIsCorrect(false);
      
      // Animasyon
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      console.log('Quiz completed');
      // Quiz tamamlandı
      try {
        await DailyGoalService.onQuizCompleted(user.uid, score, totalQuestions, score * 15);
      } catch (error) {
        console.warn('Error completing quiz:', error);
      }
      
      const accuracy = Math.round((score / totalQuestions) * 100);
      
      // Quiz tamamlandığında reklam sayacını artır
      adService.incrementQuizCount();
      
      // Quiz sonrası özel reklam göster
      try {
        const result = await adService.showRewardedAd();
        if (result.rewarded) {
          Alert.alert(
            '🎉 Quiz Tamamlandı! + Bonus XP!',
            `Skorunuz: ${score}/${totalQuestions} (${accuracy}%)\n\nKazandığınız XP: ${score * 15}\n\nBonus XP: +25 (Reklam izlediğiniz için!)`,
            [
              {
                text: 'Ana Sayfaya Dön',
                onPress: () => navigation.navigate('MainTabs')
              }
            ]
          );
        } else {
          Alert.alert(
            'Quiz Tamamlandı!',
            `Skorunuz: ${score}/${totalQuestions} (${accuracy}%)\n\nKazandığınız XP: ${score * 15}`,
            [
              {
                text: 'Ana Sayfaya Dön',
                onPress: () => navigation.navigate('MainTabs')
              }
            ]
          );
        }
      } catch (error) {
        console.error('Quiz sonrası reklam hatası:', error);
        
        Alert.alert(
          'Quiz Tamamlandı!',
          `Skorunuz: ${score}/${totalQuestions} (${accuracy}%)\n\nKazandığınız XP: ${score * 15}`,
          [
            {
              text: 'Ana Sayfaya Dön',
              onPress: () => navigation.navigate('MainTabs')
            }
          ]
        );
      }
    }
  };

  const handleRewardEarned = async (reward: { type: string; amount: number }) => {
    try {
      // Kullanıcının XP'sini güncelle
      await FirebaseService.updateUserXP(user.uid, reward.amount);
      console.log(`Quiz bonus reward earned: ${reward.amount} ${reward.type}`);
    } catch (error) {
      console.error('Error updating user XP:', error);
    }
  };

  const handleAdClosed = () => {
    console.log('Quiz ad closed');
  };

  const handleAdError = (error: string) => {
    console.error('Quiz ad error:', error);
    Alert.alert('Reklam Hatası', error);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Quiz yükleniyor...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (!currentQuestion) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Soru yükleniyor...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {currentQuestionIndex + 1} / {totalQuestions}
        </Text>
        <Text style={styles.scoreText}>
          Skor: {score}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View style={[styles.questionContainer, { opacity: fadeAnim }]}>
          {/* Question */}
          <View style={styles.questionCard}>
            <Text style={styles.questionText}>{currentQuestion.question}</Text>
          </View>

          {/* Answer Section */}
          {currentQuestion.type === 'multiple_choice' ? (
            <View style={styles.optionsContainer}>
              {currentQuestion.options?.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    selectedOption === option && styles.selectedOption,
                    isAnswered && option === currentQuestion.correctAnswer && styles.correctOption,
                    isAnswered && selectedOption === option && option !== currentQuestion.correctAnswer && styles.wrongOption
                  ]}
                  onPress={() => handleOptionSelect(option)}
                  disabled={isAnswered}
                >
                  <Text style={[
                    styles.optionText,
                    selectedOption === option && styles.selectedOptionText,
                    isAnswered && option === currentQuestion.correctAnswer && styles.correctOptionText,
                    isAnswered && selectedOption === option && option !== currentQuestion.correctAnswer && styles.wrongOptionText
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.textInput}
                value={userAnswer}
                onChangeText={setUserAnswer}
                placeholder="Cevabınızı yazın..."
                placeholderTextColor="#999"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isAnswered}
              />
              <TouchableOpacity
                style={[styles.submitButton, !userAnswer.trim() && styles.disabledButton]}
                onPress={handleTextAnswer}
                disabled={!userAnswer.trim() || isAnswered}
              >
                <Text style={styles.submitButtonText}>Cevapla</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Result */}
          {isAnswered && (
            <View style={styles.resultContainer}>
              <Text style={[
                styles.resultText,
                isCorrect ? styles.correctResult : styles.wrongResult
              ]}>
                {isCorrect ? 'Doğru!' : 'Yanlış!'}
              </Text>
              <Text style={styles.correctAnswerText}>
                Doğru cevap: {currentQuestion.correctAnswer}
              </Text>
            </View>
          )}

          {/* Next Button */}
          {isAnswered && (
            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNext}
            >
              <Text style={styles.nextButtonText}>
                {currentQuestionIndex < totalQuestions - 1 ? 'Sonraki Soru' : 'Quiz\'i Bitir'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Rewarded Ad */}
          <RewardedAdComponent
            title="🎁 Quiz Bonus XP"
            description="Reklam izleyerek ekstra 25 XP kazan!"
            rewardText="+25 XP"
            onRewardEarned={handleRewardEarned}
            onAdClosed={handleAdClosed}
            onAdError={handleAdError}
            style={styles.rewardedAd}
          />
        </Animated.View>
      </ScrollView>
    </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: 'white',
  },
  progressContainer: {
    marginTop: 60,
    marginBottom: 20,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 3,
  },
  progressText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  scoreText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 14,
    marginTop: 5,
  },
  scrollContent: {
    flexGrow: 1,
  },
  questionContainer: {
    flex: 1,
  },
  questionCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  questionText: {
    fontSize: 18,
    color: '#333',
    lineHeight: 26,
    textAlign: 'center',
  },
  optionsContainer: {
    marginBottom: 30,
  },
  optionButton: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedOption: {
    backgroundColor: '#667eea',
  },
  correctOption: {
    backgroundColor: '#28a745',
  },
  wrongOption: {
    backgroundColor: '#dc3545',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  selectedOptionText: {
    color: 'white',
  },
  correctOptionText: {
    color: 'white',
  },
  wrongOptionText: {
    color: 'white',
  },
  textInputContainer: {
    marginBottom: 30,
  },
  textInput: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    fontSize: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  submitButton: {
    backgroundColor: '#667eea',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  resultText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  correctResult: {
    color: '#28a745',
  },
  wrongResult: {
    color: '#dc3545',
  },
  correctAnswerText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  nextButton: {
    backgroundColor: '#28a745',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  rewardedAd: {
    marginTop: 20,
    marginBottom: 20,
  },
});

export default QuizScreen; 