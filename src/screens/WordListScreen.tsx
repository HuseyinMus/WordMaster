import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { FirebaseService } from '../services/firebaseService';
import { Word } from '../types';
import BannerAdComponent from '../components/BannerAdComponent';

const { width } = Dimensions.get('window');

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  gradient: string[];
  words: Word[];
  description: string;
}

const WordListScreen = ({ navigation }: { navigation: any }) => {
  const { user } = useAuth();
  const [words, setWords] = useState<Word[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [viewMode, setViewMode] = useState<'categories' | 'words'>('categories');

  useEffect(() => {
    loadWords();
  }, []);

  useEffect(() => {
    organizeWordsIntoCategories();
  }, [words]);

  const organizeWordsIntoCategories = () => {
    const categoryMap = new Map<string, Word[]>();
    
    // Kategorileri tanımla
    const categoryDefinitions = [
      { 
        id: 'toefl', 
        name: 'TOEFL', 
        icon: '🎓', 
        color: '#667eea',
        gradient: ['#667eea', '#764ba2'],
        description: 'Akademik İngilizce',
        keywords: ['academic', 'university', 'research', 'study', 'education', 'college']
      },
      { 
        id: 'sat', 
        name: 'SAT', 
        icon: '📚', 
        color: '#28a745',
        gradient: ['#28a745', '#20c997'],
        description: 'Üniversite Sınavı',
        keywords: ['college', 'exam', 'test', 'education', 'university']
      },
      { 
        id: 'ielts', 
        name: 'IELTS', 
        icon: '🌍', 
        color: '#ffc107',
        gradient: ['#ffc107', '#fd7e14'],
        description: 'Uluslararası İngilizce',
        keywords: ['international', 'english', 'language', 'test', 'global']
      },
      { 
        id: 'business', 
        name: 'İş İngilizcesi', 
        icon: '💼', 
        color: '#17a2b8',
        gradient: ['#17a2b8', '#6f42c1'],
        description: 'Profesyonel İş Hayatı',
        keywords: ['business', 'work', 'office', 'career', 'professional', 'company']
      },
      { 
        id: 'daily', 
        name: 'Günlük Hayat', 
        icon: '🏠', 
        color: '#6f42c1',
        gradient: ['#6f42c1', '#e83e8c'],
        description: 'Günlük Konuşma',
        keywords: ['daily', 'home', 'family', 'life', 'personal', 'routine']
      },
      { 
        id: 'travel', 
        name: 'Seyahat', 
        icon: '✈️', 
        color: '#fd7e14',
        gradient: ['#fd7e14', '#dc3545'],
        description: 'Seyahat ve Turizm',
        keywords: ['travel', 'trip', 'vacation', 'tourist', 'hotel', 'airport']
      },
      { 
        id: 'technology', 
        name: 'Teknoloji', 
        icon: '💻', 
        color: '#e83e8c',
        gradient: ['#e83e8c', '#6f42c1'],
        description: 'Teknoloji ve Dijital',
        keywords: ['technology', 'computer', 'software', 'digital', 'internet', 'app']
      },
      { 
        id: 'health', 
        name: 'Sağlık', 
        icon: '🏥', 
        color: '#dc3545',
        gradient: ['#dc3545', '#fd7e14'],
        description: 'Sağlık ve Tıp',
        keywords: ['health', 'medical', 'doctor', 'hospital', 'medicine', 'treatment']
      },
    ];

    // Her kelimeyi kategorilere ayır
    words.forEach(word => {
      let assigned = false;
      
      // Anahtar kelimelere göre kategorilendir
      for (const category of categoryDefinitions) {
        if (category.keywords.some(keyword => 
          word.word.toLowerCase().includes(keyword) || 
          (word.meaning && word.meaning.toLowerCase().includes(keyword)) ||
          (word.example && word.example.toLowerCase().includes(keyword))
        )) {
          if (!categoryMap.has(category.id)) {
            categoryMap.set(category.id, []);
          }
          categoryMap.get(category.id)!.push(word);
          assigned = true;
          break;
        }
      }
      
      // Kategorize edilemeyen kelimeleri "Genel" kategorisine ekle
      if (!assigned) {
        if (!categoryMap.has('general')) {
          categoryMap.set('general', []);
        }
        categoryMap.get('general')!.push(word);
      }
    });

    // Kategori listesini oluştur
    const categoryList: Category[] = [
      {
        id: 'all',
        name: 'Tüm Kelimeler',
        icon: '📖',
        color: '#6c757d',
        gradient: ['#6c757d', '#495057'],
        description: 'Tüm kelimeleriniz',
        words: words
      },
      ...categoryDefinitions.map(cat => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        gradient: cat.gradient,
        description: cat.description,
        words: categoryMap.get(cat.id) || []
      })),
      {
        id: 'general',
        name: 'Genel',
        icon: '📝',
        color: '#adb5bd',
        gradient: ['#adb5bd', '#6c757d'],
        description: 'Genel kelimeler',
        words: categoryMap.get('general') || []
      }
    ];

    setCategories(categoryList);
  };

  const loadWords = async () => {
    if (!user || !user.uid) {
      console.warn('WordListScreen: user veya user.uid yok');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      console.log('WordListScreen: Loading words for user:', user.uid);
      const userWords = await FirebaseService.getUserWords(user.uid);
      console.log('WordList - Loaded words:', userWords.length);
      setWords(userWords);
    } catch (error) {
      console.error('WordList - Error loading words:', error);
      Alert.alert('Hata', 'Kelimeler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentWords = () => {
    let filteredWords = words;
    
    // Kategori filtresi
    if (selectedCategory !== 'all') {
      const category = categories.find(cat => cat.id === selectedCategory);
      if (category) {
        filteredWords = category.words;
      }
    }
    
    // Arama filtresi
    if (searchText) {
      filteredWords = filteredWords.filter(word => 
        word.word.toLowerCase().includes(searchText.toLowerCase()) ||
        (word.meaning && word.meaning.toLowerCase().includes(searchText.toLowerCase()))
      );
    }
    
    return filteredWords;
  };

  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setViewMode('words');
  };

  const handleStartLearning = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (category && category.words.length > 0) {
      // Bu kategoriyi öğrenme moduna geçir
      navigation.navigate('Learning', { 
        categoryId: categoryId,
        words: category.words 
      });
    } else {
      Alert.alert('Uyarı', 'Bu kategoride öğrenilecek kelime bulunmuyor.');
    }
  };

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => handleCategoryPress(item.id)}
    >
      <LinearGradient
        colors={item.gradient}
        style={styles.categoryGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.categoryContent}>
          <Text style={styles.categoryIcon}>{item.icon}</Text>
          <View style={styles.categoryInfo}>
            <Text style={styles.categoryName}>{item.name}</Text>
            <Text style={styles.categoryDescription}>{item.description}</Text>
            <Text style={styles.categoryCount}>{item.words.length} kelime</Text>
          </View>
          
          {item.words.length > 0 && (
            <TouchableOpacity
              style={styles.learnButton}
              onPress={() => handleStartLearning(item.id)}
            >
              <Text style={styles.learnButtonText}>Öğren</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderWord = ({ item }: { item: Word }) => (
    <View style={styles.wordCard}>
      <View style={styles.wordHeader}>
        <View style={styles.wordInfo}>
          <Text style={styles.wordText}>{item.word}</Text>
          <Text style={styles.meaningText}>{item.meaning}</Text>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(item.learningStatus) }
        ]}>
          <Text style={styles.statusText}>
            {getStatusText(item.learningStatus)}
          </Text>
        </View>
      </View>
      
      {item.example && (
        <Text style={styles.exampleText}>{item.example}</Text>
      )}
      
      <View style={styles.wordFooter}>
        <View style={[
          styles.difficultyBadge,
          { backgroundColor: getDifficultyColor(item.difficulty) }
        ]}>
          <Text style={styles.difficultyText}>
            {getDifficultyText(item.difficulty)}
          </Text>
        </View>
        <Text style={styles.reviewText}>
          🔄 {item.reviewCount || 0} tekrar
        </Text>
      </View>
    </View>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return '#6c757d';
      case 'learning': return '#ffc107';
      case 'reviewing': return '#17a2b8';
      case 'mastered': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new': return 'Yeni';
      case 'learning': return 'Öğreniliyor';
      case 'reviewing': return 'Tekrar';
      case 'mastered': return 'Öğrenildi';
      default: return 'Bilinmiyor';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#28a745';
      case 'medium': return '#ffc107';
      case 'hard': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Kolay';
      case 'medium': return 'Orta';
      case 'hard': return 'Zor';
      default: return 'Bilinmiyor';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.loadingText}>Kelimeler yükleniyor...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  const currentWords = getCurrentWords();
  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => {
              if (viewMode === 'words') {
                setViewMode('categories');
                setSelectedCategory('all');
              } else {
                navigation.goBack();
              }
            }} 
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>
              {viewMode === 'words' ? '← Kategoriler' : '← Geri'}
            </Text>
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>
              {viewMode === 'categories' ? 'Kelime Kategorileri' : selectedCategoryData?.name}
            </Text>
            <Text style={styles.headerSubtitle}>
              {viewMode === 'categories' 
                ? `${words.length} toplam kelime` 
                : `${currentWords.length} kelime bulundu`
              }
            </Text>
          </View>
        </View>

        {/* Arama - Sadece kelime görünümünde */}
        {viewMode === 'words' && (
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="🔍 Kelime ara..."
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor="#999"
            />
          </View>
        )}

        {/* İçerik */}
        {viewMode === 'categories' ? (
          // Kategori Görünümü
          <FlatList
            data={categories}
            renderItem={renderCategory}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.categoriesList}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          // Kelime Görünümü
          <>
            {currentWords.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📝</Text>
                <Text style={styles.emptyText}>
                  {words.length === 0 ? 'Henüz kelime eklenmemiş.' : 'Bu kategoride kelime bulunamadı.'}
                </Text>
                <Text style={styles.emptySubtext}>
                  {words.length === 0 ? 'Profil sayfasından kelime ekleyebilirsiniz.' : 'Farklı bir kategori seçin.'}
                </Text>
              </View>
            ) : (
              <FlatList
                data={currentWords}
                renderItem={renderWord}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
              />
            )}
          </>
        )}

        {/* Banner Reklam */}
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
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    padding: 10,
    marginRight: 15,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  searchInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoriesList: {
    padding: 20,
    paddingBottom: 100,
  },
  categoryCard: {
    marginBottom: 15,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  categoryGradient: {
    borderRadius: 16,
    padding: 20,
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  learnButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  learnButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  wordCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  wordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  wordInfo: {
    flex: 1,
    marginRight: 10,
  },
  wordText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  meaningText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  exampleText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  wordFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  reviewText: {
    fontSize: 12,
    color: '#999',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  bannerAd: {
    marginTop: 10,
    marginBottom: 10,
  },
});

export default WordListScreen; 