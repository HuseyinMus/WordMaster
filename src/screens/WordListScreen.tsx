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
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { FirebaseService } from '../services/firebaseService';
import { Word } from '../types';
import BannerAdComponent from '../components/BannerAdComponent';

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  words: Word[];
}

const WordListScreen = () => {
  const { user } = useAuth();
  const [words, setWords] = useState<Word[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

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
      { id: 'toefl', name: 'TOEFL', icon: '🎓', color: '#667eea', keywords: ['academic', 'university', 'research', 'study'] },
      { id: 'sat', name: 'SAT', icon: '📚', color: '#28a745', keywords: ['college', 'exam', 'test', 'education'] },
      { id: 'ielts', name: 'IELTS', icon: '🌍', color: '#ffc107', keywords: ['international', 'english', 'language', 'test'] },
      { id: 'business', name: 'İş İngilizcesi', icon: '💼', color: '#17a2b8', keywords: ['business', 'work', 'office', 'career'] },
      { id: 'daily', name: 'Günlük Hayat', icon: '🏠', color: '#6f42c1', keywords: ['daily', 'home', 'family', 'life'] },
      { id: 'travel', name: 'Seyahat', icon: '✈️', color: '#fd7e14', keywords: ['travel', 'trip', 'vacation', 'tourist'] },
      { id: 'technology', name: 'Teknoloji', icon: '💻', color: '#e83e8c', keywords: ['technology', 'computer', 'software', 'digital'] },
      { id: 'health', name: 'Sağlık', icon: '🏥', color: '#dc3545', keywords: ['health', 'medical', 'doctor', 'hospital'] },
    ];

    // Her kelimeyi kategorilere ayır
    words.forEach(word => {
      let assigned = false;
      
      // Anahtar kelimelere göre kategorilendir
      for (const category of categoryDefinitions) {
        if (category.keywords.some(keyword => 
          word.word.toLowerCase().includes(keyword) || 
          word.meaning.toLowerCase().includes(keyword) ||
          word.example.toLowerCase().includes(keyword)
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
        words: words
      },
      ...categoryDefinitions.map(cat => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        words: categoryMap.get(cat.id) || []
      })),
      {
        id: 'general',
        name: 'Genel',
        icon: '📝',
        color: '#adb5bd',
        words: categoryMap.get('general') || []
      }
    ];

    setCategories(categoryList);
  };

  const loadWords = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
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
    
    // Zorluk seviyesi filtresi
    if (selectedDifficulty !== 'all') {
      filteredWords = filteredWords.filter(word => word.difficulty === selectedDifficulty);
    }
    
    // Arama filtresi
    if (searchText) {
      filteredWords = filteredWords.filter(word => 
        word.word.toLowerCase().includes(searchText.toLowerCase()) ||
        word.meaning.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    return filteredWords;
  };

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
      
      <Text style={styles.exampleText}>{item.example}</Text>
      
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

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[
        styles.categoryCard,
        selectedCategory === item.id && styles.categoryCardActive,
        { borderLeftColor: item.color }
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Text style={styles.categoryIcon}>{item.icon}</Text>
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryName}>{item.name}</Text>
        <Text style={styles.categoryCount}>{item.words.length} kelime</Text>
      </View>
    </TouchableOpacity>
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Kelimeler yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentWords = getCurrentWords();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>📚 Kelime Kütüphanesi</Text>
          <Text style={styles.subtitle}>
            {currentWords.length} kelime bulundu
          </Text>
        </View>

        {/* Arama */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="🔍 Kelime ara..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#999"
          />
        </View>

        {/* Kategoriler */}
        <View style={styles.categoriesContainer}>
          <Text style={styles.categoriesTitle}>📂 Kategoriler</Text>
          <FlatList
            data={categories}
            renderItem={renderCategory}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {/* Zorluk Seviyesi Filtreleri */}
        <View style={styles.difficultyContainer}>
          <Text style={styles.difficultyTitle}>🎯 Zorluk Seviyesi</Text>
          <View style={styles.difficultyButtons}>
            <TouchableOpacity
              style={[
                styles.difficultyButton,
                selectedDifficulty === 'all' && styles.difficultyButtonActive
              ]}
              onPress={() => setSelectedDifficulty('all')}
            >
              <Text style={[
                styles.difficultyButtonText,
                selectedDifficulty === 'all' && styles.difficultyButtonTextActive
              ]}>
                Tümü
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.difficultyButton,
                selectedDifficulty === 'easy' && styles.difficultyButtonActive,
                { backgroundColor: '#28a745' }
              ]}
              onPress={() => setSelectedDifficulty('easy')}
            >
              <Text style={[
                styles.difficultyButtonText,
                selectedDifficulty === 'easy' && styles.difficultyButtonTextActive
              ]}>
                🟢 Kolay
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.difficultyButton,
                selectedDifficulty === 'medium' && styles.difficultyButtonActive,
                { backgroundColor: '#ffc107' }
              ]}
              onPress={() => setSelectedDifficulty('medium')}
            >
              <Text style={[
                styles.difficultyButtonText,
                selectedDifficulty === 'medium' && styles.difficultyButtonTextActive
              ]}>
                🟡 Orta
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.difficultyButton,
                selectedDifficulty === 'hard' && styles.difficultyButtonActive,
                { backgroundColor: '#dc3545' }
              ]}
              onPress={() => setSelectedDifficulty('hard')}
            >
              <Text style={[
                styles.difficultyButtonText,
                selectedDifficulty === 'hard' && styles.difficultyButtonTextActive
              ]}>
                🔴 Zor
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Kelime Listesi */}
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

        {/* Banner Reklam */}
        <BannerAdComponent style={styles.bannerAd} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  searchContainer: {
    marginTop: 15,
    marginBottom: 15,
  },
  searchInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    fontSize: 16,
    color: '#333',
  },
  categoriesContainer: {
    marginBottom: 15,
  },
  categoriesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  categoriesList: {
    paddingVertical: 5,
  },
  difficultyContainer: {
    marginBottom: 15,
  },
  difficultyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  difficultyButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  difficultyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
    backgroundColor: '#f8f9fa',
  },
  difficultyButtonActive: {
    borderColor: '#667eea',
    backgroundColor: '#667eea',
  },
  difficultyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  difficultyButtonTextActive: {
    color: 'white',
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryCardActive: {
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  categoryCount: {
    fontSize: 12,
    color: '#999',
  },
  listContainer: {
    paddingBottom: 20,
  },
  wordCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  wordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  wordInfo: {
    flex: 1,
  },
  wordText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  meaningText: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
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
    marginBottom: 10,
  },
  wordFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
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
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  bannerAd: {
    marginTop: 10,
    marginBottom: 10,
  },
});

export default WordListScreen; 