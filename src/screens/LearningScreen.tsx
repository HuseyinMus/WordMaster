import React, { useState, useEffect } from 'react';
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

const { width } = Dimensions.get('window');

const LearningScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [wordsForToday, setWordsForToday] = useState<string[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cardAnimation] = useState(new Animated.Value(0));
  const [flipAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    loadWordsForToday();
  }, []);

  const loadWordsForToday = async () => {
    if (!user) return;

    try {
      const words = await SpacedRepetitionService.getWordsForToday(user.uid);
      console.log('Words for today:', words);
      setWordsForToday(words);
    } catch (error) {
      console.error('Error loading words:', error);
      Alert.alert('Hata', 'Kelimeler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleNextWord = () => {
    if (currentWordIndex < wordsForToday.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
      setShowAnswer(false);
      animateCard();
    } else {
      Alert.alert(
        'Tebrikler! 🎉',
        'Bugünkü kelimeleri tamamladınız!',
        [
          {
            text: 'Ana Sayfaya Dön',
            onPress: () => navigation.navigate('MainTabs'),
          },
        ]
      );
    }
  };

  const handlePreviousWord = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(currentWordIndex - 1);
      setShowAnswer(false);
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
    if (!user || !wordsForToday[currentWordIndex]) return;

    try {
      await SpacedRepetitionService.updateWordProgress(
        user.uid,
        wordsForToday[currentWordIndex],
        level
      );

      // XP kazan
      const xpGained = level * 10; // 1-5 seviye * 10 XP
      Alert.alert(
        `+${xpGained} XP Kazandınız! 🎉`,
        `"${wordsForToday[currentWordIndex]}" kelimesini ${level}/5 seviyede bildiğinizi kaydettik.`,
        [
          {
            text: 'Devam Et',
            onPress: handleNextWord,
          },
        ]
      );
    } catch (error) {
      console.error('Error updating word progress:', error);
      Alert.alert('Hata', 'Kelime ilerlemesi kaydedilirken bir hata oluştu.');
    }
  };

  const getWordEmoji = (word: string) => {
    // Kelime türüne göre emoji seç
    const wordEmojis: { [key: string]: string } = {
      'wonderful': '✨',
      'wisdom': '🧠',
      'success': '🏆',
      'respect': '🙏',
      'passion': '🔥',
      'opportunity': '🚀',
      'leadership': '👑',
      'knowledge': '📚',
      'journey': '🗺️',
      'inspire': '💡',
      'grateful': '🙏',
      'forgive': '❤️',
      'experience': '🌟',
      'encourage': '💪',
      'discover': '🔍',
      'challenge': '⚡',
      'celebrate': '🎉',
      'believe': '✨',
      'appreciate': '💝',
      'admire': '👀',
      'achieve': '🎯',
      'accomplish': '✅',
    };

    return wordEmojis[word.toLowerCase()] || '📖';
  };

  const getKnowledgeLevelText = (level: number) => {
    switch (level) {
      case 1: return 'Hiç bilmiyorum 😔';
      case 2: return 'Biraz biliyorum 🤔';
      case 3: return 'Orta seviyede biliyorum 😊';
      case 4: return 'İyi biliyorum 😄';
      case 5: return 'Mükemmel biliyorum 🎉';
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
            <Text style={styles.emptyTitle}>🎉 Tebrikler!</Text>
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
  const wordEmoji = getWordEmoji(currentWord);

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
          <Text style={styles.headerTitle}>📚 Kelime Öğrenme</Text>
          <Text style={styles.progressText}>
            {currentWordIndex + 1} / {wordsForToday.length}
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
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
              <View style={styles.wordContainer}>
                <Text style={styles.wordEmoji}>{wordEmoji}</Text>
                <Text style={styles.wordText}>{currentWord}</Text>
              </View>
              
              <TouchableOpacity style={styles.flipButton} onPress={flipCard}>
                <Text style={styles.flipButtonText}>🔄 Cevabı Göster</Text>
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
              <Text style={styles.definitionTitle}>Kelime Anlamı:</Text>
              <Text style={styles.definitionText}>
                Bu kelimenin anlamını ve kullanımını öğrenmek için çeviri servisi kullanabilirsiniz.
              </Text>
              
              <TouchableOpacity style={styles.flipButton} onPress={flipCard}>
                <Text style={styles.flipButtonText}>🔄 Kelimeyi Göster</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>

        {/* Knowledge Level Buttons */}
        <View style={styles.knowledgeContainer}>
          <Text style={styles.knowledgeTitle}>Bu kelimeyi ne kadar biliyorsun?</Text>
          
          {[1, 2, 3, 4, 5].map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.knowledgeButton,
                { backgroundColor: getKnowledgeLevelColor(level) },
              ]}
              onPress={() => handleKnowledgeLevel(level)}
            >
              <Text style={styles.knowledgeButtonText}>
                {level} - {getKnowledgeLevelText(level)}
              </Text>
            </TouchableOpacity>
          ))}
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
            style={[styles.navButton, styles.nextButton]}
            onPress={handleNextWord}
          >
            <Text style={styles.navButtonText}>Sonraki →</Text>
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
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 4,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: width - 40,
    height: 300,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    backfaceVisibility: 'hidden',
  },
  cardFront: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardBack: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wordContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  wordEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  wordText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  flipButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  flipButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  definitionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  definitionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  knowledgeContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  knowledgeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 15,
  },
  knowledgeButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  knowledgeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  navButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    flex: 0.45,
  },
  nextButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  disabledButton: {
    opacity: 0.5,
  },
  navButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  bannerAd: {
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
});

export default LearningScreen; 