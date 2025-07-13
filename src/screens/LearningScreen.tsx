import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { SpacedRepetitionService } from '../services/spacedRepetition';
import BannerAdComponent from '../components/BannerAdComponent';
import * as Speech from 'expo-speech';

const { width } = Dimensions.get('window');

const LearningScreen: React.FC<{ navigation: any; route?: any }> = ({ navigation, route }) => {
  const { user } = useAuth();
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [wordsForToday, setWordsForToday] = useState<any[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [cardAnimation] = useState(new Animated.Value(0));
  const [flipAnimation] = useState(new Animated.Value(0));
  const [isCategoryMode, setIsCategoryMode] = useState(false);
  const [categoryId, setCategoryId] = useState<string>('');
  const firstSpeech = useRef(true);

  useEffect(() => {
    // Route parametrelerini kontrol et
    if (route?.params?.categoryId && route?.params?.words) {
      setIsCategoryMode(true);
      setCategoryId(route.params.categoryId);
      setWordsForToday(route.params.words);
      setLoading(false);
    } else {
      loadWordsForToday();
    }
  }, [route]);

  useEffect(() => {
    // İlk kelime veya yeni kelime geldiğinde otomatik seslendir
    if (!loading && wordsForToday.length > 0) {
      const currentWord = wordsForToday[currentWordIndex];
      speakWord(currentWord.word);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWordIndex, loading]);

  const speakWord = (word: string) => {
    if (word && word.trim()) {
      try {
        Speech.stop(); // Önceki konuşmayı hemen durdur
        Speech.speak(word.trim(), {
          language: 'en',
          rate: 0.8,
          pitch: 1.1,
        });
      } catch (error) {
        console.error('Speech error:', error);
      }
    }
  };

  const loadWordsForToday = async () => {
    if (!user || !user.uid) {
      console.warn('LearningScreen: user veya user.uid yok');
      setLoading(false);
      return;
    }

    try {
      const { FirebaseService } = await import('../services/firebaseService');
      const userWords = await FirebaseService.getUserWords(user.uid);
      
      // Spaced repetition ile bugün öğrenilecek kelimeleri al
      const reviewWords = SpacedRepetitionService.getWordsForTodayFromList(userWords);
      const newWords = SpacedRepetitionService.getNewWords(userWords, 5); // Günlük 5 yeni kelime
      
      // Önce tekrar edilecek kelimeler, sonra yeni kelimeler
      const todayWords = [...reviewWords, ...newWords];
      
      console.log(`Bugün ${reviewWords.length} tekrar, ${newWords.length} yeni kelime`);
      setWordsForToday(todayWords);
    } catch (error) {
      console.error('Error loading words:', error);
      Alert.alert('Hata', 'Kelimeler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleNextWord = async () => {
    if (!selectedLevel || !user || !wordsForToday[currentWordIndex]) {
      Alert.alert('Uyarı', 'Lütfen önce bir seviye seçin.');
      return;
    }

    try {
      const currentWord = wordsForToday[currentWordIndex];
      await SpacedRepetitionService.updateWordProgress(
        user.uid,
        currentWord.word,
        selectedLevel
      );
      
      const xpGained = selectedLevel * 10;
      Alert.alert(
        `+${xpGained} XP Kazandınız!`,
        `"${currentWord.word}" kelimesini ${selectedLevel}/5 seviyede bildiğinizi kaydettik.`,
        [
          {
            text: 'Devam Et',
            onPress: () => {
              if (currentWordIndex < wordsForToday.length - 1) {
                setCurrentWordIndex(currentWordIndex + 1);
                setShowAnswer(false);
                setSelectedLevel(null);
                animateCard();
              } else {
                Alert.alert(
                  'Tebrikler!',
                  'Bugünkü kelimeleri tamamladınız!',
                  [
                    {
                      text: 'Ana Sayfaya Dön',
                      onPress: () => navigation.navigate('MainTabs'),
                    },
                  ]
                );
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error updating word progress:', error);
      Alert.alert('Hata', 'Kelime ilerlemesi kaydedilirken bir hata oluştu.');
    }
  };

  const handlePreviousWord = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(currentWordIndex - 1);
      setShowAnswer(false);
      setSelectedLevel(null);
      animateCard();
    }
  };

  const animateCard = () => {
    Animated.sequence([
      Animated.timing(cardAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(cardAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const flipCard = () => {
    Animated.spring(flipAnimation, {
      toValue: showAnswer ? 0 : 1,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setShowAnswer(!showAnswer);
  };

  const handleKnowledgeLevel = async (level: number) => {
    setSelectedLevel(level);
  };

  const getKnowledgeLevelText = (level: number) => {
    switch (level) {
      case 1: return 'Zor';
      case 2: return 'Orta';
      case 3: return 'Kolay';
      case 4: return 'Çok Kolay';
      case 5: return 'Biliyorum';
      default: return '';
    }
  };

  const getKnowledgeLevelColor = (level: number) => {
    switch (level) {
      case 1: return '#FF6B6B';
      case 2: return '#FFA726';
      case 3: return '#FFD54F';
      case 4: return '#81C784';
      case 5: return '#4CAF50';
      default: return '#666';
    }
  };

  const getCategoryName = (categoryId: string) => {
    const categoryNames: { [key: string]: string } = {
      'toefl': 'TOEFL',
      'sat': 'SAT',
      'ielts': 'IELTS',
      'business': 'İş İngilizcesi',
      'daily': 'Günlük Hayat',
      'travel': 'Seyahat',
      'technology': 'Teknoloji',
      'health': 'Sağlık',
      'general': 'Genel'
    };
    return categoryNames[categoryId] || 'Kategori';
  };

  const isReviewWord = (word: any) => {
    if (!word) return false;
    // Eğer kelimenin nextReviewDate'si varsa ve bugün veya öncesi ise tekrar kelimesidir
    if (word.nextReviewDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const nextReview = new Date(word.nextReviewDate);
      nextReview.setHours(0, 0, 0, 0);
      return nextReview <= today;
    }
    // Eğer learningStatus reviewing ise tekrar kelimesidir
    return word.learningStatus === 'reviewing';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Kelimeler yükleniyor...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (wordsForToday.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Tebrikler!</Text>
            <Text style={styles.emptyText}>
              Bugün öğrenecek yeni kelimeniz yok. Yarın tekrar gelin!
            </Text>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.navigate('MainTabs')}
            >
              <Text style={styles.backButtonText}>Ana Sayfaya Dön</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  const currentWord = wordsForToday[currentWordIndex];

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Geri</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>
              {isCategoryMode ? `${getCategoryName(categoryId)} Öğrenme` : 'Kelime Öğrenme'}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressText}>
              {currentWordIndex + 1} / {wordsForToday.length}
            </Text>
            <Text style={styles.progressDetail}>
              {wordsForToday.filter(isReviewWord).length} tekrar, {wordsForToday.filter(w => !isReviewWord(w)).length} yeni
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${((currentWordIndex + 1) / wordsForToday.length) * 100}%` },
              ]}
            />
          </View>
        </View>

        {/* Card Container */}
        <View style={styles.cardContainer}>
          <Animated.View
            style={[
              styles.card,
              frontAnimatedStyle,
              {
                transform: [
                  { translateX: cardAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -10],
                  })},
                ],
              },
            ]}
          >
            {/* Front of Card */}
            <View style={styles.cardFront}>
              {/* Kelime Tipi Göstergesi */}
              <View style={styles.wordTypeIndicator}>
                <View style={[
                  styles.wordTypeBadge,
                  { backgroundColor: isReviewWord(currentWord) ? '#FF6B6B' : '#4CAF50' }
                ]}>
                  <Text style={styles.wordTypeText}>
                    {isReviewWord(currentWord) ? '🔄 Tekrar' : '🆕 Yeni'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.wordContainer}>
                <Text style={styles.wordText}>{currentWord?.word}</Text>
                <TouchableOpacity 
                  style={styles.speakerButton} 
                  onPress={() => {
                    if (currentWord?.word) {
                      speakWord(currentWord.word);
                    }
                  }}
                >
                  <Text style={styles.speakerButtonText}>🔊 Tekrar Dinle</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.flipButton} onPress={flipCard}>
                <Text style={styles.flipButtonText}>Cevabı Göster</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.card,
              styles.cardBack,
              backAnimatedStyle,
            ]}
          >
            {/* Back of Card */}
            <View style={styles.cardBack}>
              <Text style={styles.definitionTitle}>Türkçe Anlamı:</Text>
              <Text style={styles.definitionText}>
                {currentWord?.meaning || 'Anlam yükleniyor...'}
              </Text>
              
              {currentWord?.example && (
                <>
                  <Text style={styles.exampleTitle}>Örnek Cümle:</Text>
                  <Text style={styles.exampleText}>
                    {currentWord.example}
                  </Text>
                </>
              )}
              
              <TouchableOpacity style={styles.flipButton} onPress={flipCard}>
                <Text style={styles.flipButtonText}>Kelimeyi Göster</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>

        {/* Knowledge Level Buttons */}
        <View style={styles.knowledgeContainer}>
          <Text style={styles.knowledgeTitle}>Bu kelimeyi ne kadar biliyorsun?</Text>
          <View style={styles.knowledgeButtonsRow}>
            {[1, 2, 3, 4, 5].map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.knowledgeButton,
                  { backgroundColor: getKnowledgeLevelColor(level) },
                  selectedLevel === level && styles.selectedKnowledgeButton,
                ]}
                onPress={() => handleKnowledgeLevel(level)}
              >
                <Text style={[
                  styles.knowledgeButtonText,
                  selectedLevel === level && styles.selectedKnowledgeButtonText,
                ]}>
                  {getKnowledgeLevelText(level)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Navigation Buttons */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity
            style={[styles.navButton, currentWordIndex === 0 && styles.disabledButton]}
            onPress={handlePreviousWord}
            disabled={currentWordIndex === 0}
          >
            <Text style={styles.navButtonText}>← Önceki</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navButton, 
              styles.nextButton,
              !selectedLevel && styles.disabledButton
            ]}
            onPress={handleNextWord}
            disabled={!selectedLevel}
          >
            <Text style={[
              styles.navButtonText,
              styles.nextButtonText,
              !selectedLevel && styles.disabledButtonText
            ]}>Sonraki →</Text>
          </TouchableOpacity>
        </View>

        {/* Banner Ad */}
        <BannerAdComponent style={styles.bannerAd} />
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#667eea',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    padding: 10,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  progressText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressDetail: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: width * 0.85,
    minHeight: 220,
    backgroundColor: 'white',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backfaceVisibility: 'hidden',
  },
  cardFront: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  wordTypeIndicator: {
    position: 'absolute',
    top: 15,
    right: 15,
  },
  wordTypeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  wordTypeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  cardBack: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    backfaceVisibility: 'hidden',
  },
  wordContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  wordText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 12,
  },
  speakerButton: {
    backgroundColor: '#e1e5ea',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginTop: 4,
  },
  speakerButtonText: {
    color: '#333',
    fontSize: 15,
    fontWeight: '600',
  },
  flipButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    padding: 12,
    marginTop: 18,
    alignItems: 'center',
  },
  flipButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  definitionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 8,
  },
  definitionText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  exampleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#667eea',
    marginTop: 12,
    marginBottom: 4,
  },
  exampleText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  knowledgeContainer: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  knowledgeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  knowledgeButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  knowledgeButton: {
    borderRadius: 6,
    padding: 6,
    marginBottom: 6,
    alignItems: 'center',
    minHeight: 30,
    marginHorizontal: 2,
    flex: 1,
    maxWidth: 60,
  },
  knowledgeButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  selectedKnowledgeButton: {
    borderWidth: 2,
    borderColor: '#fff',
  },
  selectedKnowledgeButtonText: {
    color: '#fff',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  navButton: {
    backgroundColor: '#e1e5ea',
    borderRadius: 12,
    padding: 14,
    minWidth: 120,
    alignItems: 'center',
  },
  navButtonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#667eea',
  },
  nextButtonText: {
    color: 'white',
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledButtonText: {
    color: '#ccc',
  },
  bannerAd: {
    marginTop: 10,
    marginBottom: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default LearningScreen; 