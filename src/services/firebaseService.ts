import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  addDoc,
  deleteDoc 
} from 'firebase/firestore';
import { 
  GoogleAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import { db, auth } from '../config/firebase';
import { User, Word, DailyStats, Badge } from '../types';

export class FirebaseService {
  // Firebase bağlantısını test et
  static async testConnection(): Promise<boolean> {
    try {
      console.log('Testing Firebase connection...');
      
      // Basit bir test sorgusu yap
      const testRef = collection(db, 'users');
      const testQuery = query(testRef, where('uid', '==', 'test'));
      await getDocs(testQuery);
      
      console.log('Firebase connection successful');
      return true;
    } catch (error) {
      console.error('Firebase connection test failed:', error);
      
      const err = error as { code?: string; message?: string };
      if (err.code === 'permission-denied') {
        console.error('Permission denied - check security rules');
      } else if (err.code === 'unavailable') {
        console.error('Firebase service unavailable');
      } else if (err.code === 'unauthenticated') {
        console.error('User not authenticated');
      }
      
      return false;
    }
  }

  // Kullanıcı işlemleri
  static async createUser(userData: Partial<User>): Promise<void> {
    try {
      const userRef = doc(db, 'users', userData.uid!);
      
      // photoURL undefined ise null olarak ayarla
      const cleanUserData = {
        ...userData,
        photoURL: userData.photoURL || null,
        createdAt: new Date(),
        level: 1,
        xp: 0,
        streak: 0,
        totalWordsLearned: 0,
        dailyGoal: 5
      };
      
      console.log('Creating user with data:', cleanUserData);
      await setDoc(userRef, cleanUserData);
      console.log('User created successfully');
    } catch (error) {
      console.error('Error creating user:', error);
      const err = error as { code?: string; message?: string };
      if (err.code === 'permission-denied') {
        throw new Error('Firebase izin hatası. Kullanıcı oluşturulamadı.');
      }
      throw error;
    }
  }

  static async getUser(uid: string): Promise<User | null> {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return userSnap.data() as User;
      }
      return null;
    } catch (error) {
      console.error('Error getting user:', error);
      const err = error as { code?: string; message?: string };
      if (err.code === 'permission-denied') {
        throw new Error('Firebase izin hatası. Kullanıcı bilgileri alınamadı.');
      }
      throw error;
    }
  }

  static async updateUser(uid: string, updates: Partial<User>): Promise<void> {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, updates);
  }

  static async updateUserXP(uid: string, xpGained: number): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const currentUser = userSnap.data() as User;
        const newXP = (currentUser.xp || 0) + xpGained;
        const newLevel = Math.floor(newXP / 100) + 1; // Her 100 XP'de 1 seviye
        
        await updateDoc(userRef, {
          xp: newXP,
          level: newLevel,
          totalWordsLearned: (currentUser.totalWordsLearned || 0) + 1
        });
        
        console.log(`User XP updated: +${xpGained} XP, Total: ${newXP}, Level: ${newLevel}`);
      }
    } catch (error) {
      console.error('Error updating user XP:', error);
      throw error;
    }
  }

  static async getAllUsers(): Promise<User[]> {
    try {
      const usersRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersRef);
      
      const users = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        uid: doc.id
      })) as User[];
      
      return users;
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  // Kelime işlemleri
  static async addWord(wordData: Omit<Word, 'id'>): Promise<string> {
    console.log('Adding word:', wordData.word);
    
    try {
      // SpacedRepetitionService'ten başlangıç değerlerini al
      const { SpacedRepetitionService } = await import('./spacedRepetition');
      const initialValues = SpacedRepetitionService.getInitialValues();
      
      // Tarih değerlerini kontrol et
      const now = new Date();
      if (isNaN(now.getTime())) {
        throw new Error('Invalid current date');
      }
      
      const safeInitialValues = {
        ...initialValues,
        nextReviewDate: initialValues.nextReviewDate || now,
        createdAt: now,
        lastReviewed: now,
        reviewCount: 0,
        interval: initialValues.interval || 1,
        efactor: initialValues.efactor || 2.5,
        repetitions: initialValues.repetitions || 0
      };
      
      console.log('Adding word with safe values:', {
        word: wordData.word,
        nextReviewDate: safeInitialValues.nextReviewDate,
        createdAt: safeInitialValues.createdAt
      });
      
      const wordRef = await addDoc(collection(db, 'words'), {
        ...wordData,
        ...safeInitialValues
      });
      
      console.log('Word added successfully with ID:', wordRef.id);
      return wordRef.id;
    } catch (error) {
      console.error('Error adding word:', error);
      
      const err = error as { code?: string; message?: string };
      if (err.code === 'permission-denied') {
        throw new Error('Firebase izin hatası. Kelime eklenemedi. Güvenlik kurallarını kontrol edin.');
      } else if (err.code === 'unavailable') {
        throw new Error('Firebase servisi kullanılamıyor. İnternet bağlantınızı kontrol edin.');
      } else if (err.code === 'unauthenticated') {
        throw new Error('Kullanıcı kimlik doğrulaması başarısız. Lütfen tekrar giriş yapın.');
      } else {
        throw new Error(`Kelime eklenirken hata: ${err.message || 'Bilinmeyen hata'}`);
      }
    }
  }

  static async getUserWords(userId: string): Promise<Word[]> {
    console.log('Getting words for user:', userId);

    // userId kontrolü
    if (!userId || typeof userId !== 'string') {
      throw new Error('Geçersiz kullanıcı ID: userId string olmalı ve boş olmamalı.');
    }

    // Çok uzun userId'yi hashle (npm paketi yüklemeden basit bir hash)
    let safeUserId = userId;
    if (userId.length > 100) {
      // Basit hash: ilk 50 + son 50 + ters çevir
      safeUserId = (userId.slice(0, 50) + userId.slice(-50)).split('').reverse().join('');
    }

    try {
      const wordsRef = collection(db, 'words');
      const q = query(
        wordsRef,
        where('userId', '==', safeUserId)
      );
      const querySnapshot = await getDocs(q);

      const words = querySnapshot.docs.map(doc => {
        const data = doc.data();
        // Geçersiz tarihleri düzelt
        try {
          if (data.nextReviewDate) {
            const nextReview = new Date(data.nextReviewDate);
            if (isNaN(nextReview.getTime())) {
              console.warn('Fixing invalid nextReviewDate for word:', data.word);
              const now = new Date();
              now.setDate(now.getDate() + 1);
              data.nextReviewDate = now;
            }
          } else {
            // nextReviewDate eksikse ekle
            console.warn('Missing nextReviewDate for word:', data.word);
            const now = new Date();
            now.setDate(now.getDate() + 1);
            data.nextReviewDate = now;
            
            // Firebase'de de güncelle
            this.fixMissingNextReviewDate(doc.id, now).catch(err => 
              console.warn('Error fixing nextReviewDate in Firebase:', err)
            );
          }
          
          if (data.createdAt) {
            const created = new Date(data.createdAt);
            if (isNaN(created.getTime())) {
              console.warn('Fixing invalid createdAt for word:', data.word);
              data.createdAt = new Date();
            }
          } else {
            // createdAt eksikse ekle
            console.warn('Missing createdAt for word:', data.word);
            data.createdAt = new Date();
          }
          
          if (data.lastReviewed) {
            const lastReviewed = new Date(data.lastReviewed);
            if (isNaN(lastReviewed.getTime())) {
              console.warn('Fixing invalid lastReviewed for word:', data.word);
              data.lastReviewed = new Date();
            }
          } else {
            // lastReviewed eksikse ekle
            console.warn('Missing lastReviewed for word:', data.word);
            data.lastReviewed = new Date();
          }
        } catch (error) {
          console.warn('Error fixing dates for word:', data.word, error);
        }
        
        return {
          id: doc.id,
          ...data
        };
      }) as Word[];
      
      // Sonuçları createdAt'e göre sırala (desc)
      const sortedWords = words.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB.getTime() - dateA.getTime();
      });
      
      console.log('Found words:', sortedWords.length);
      console.log('Words:', sortedWords.map(w => w.word));
      
      return sortedWords;
    } catch (error) {
      console.error('Error getting user words:', error);
      
      const err = error as { code?: string; message?: string };
      if (err.code === 'permission-denied') {
        console.error('Firebase permission error. Check Firestore security rules.');
        throw new Error('Firebase izin hatası. Lütfen Firebase Console\'da güvenlik kurallarını kontrol edin. Hata kodu: permission-denied');
      } else if (err.code === 'unavailable') {
        console.error('Firebase service unavailable.');
        throw new Error('Firebase servisi şu anda kullanılamıyor. Lütfen internet bağlantınızı kontrol edin.');
      } else if (err.code === 'unauthenticated') {
        console.error('User not authenticated.');
        throw new Error('Kullanıcı kimlik doğrulaması başarısız. Lütfen tekrar giriş yapın.');
      } else {
        console.error('Unknown Firebase error:', error);
        throw new Error(`Firebase hatası: ${err.message || 'Bilinmeyen hata'}`);
      }
    }
  }

  static async updateWord(wordId: string, updates: Partial<Word>): Promise<void> {
    const wordRef = doc(db, 'words', wordId);
    
    // Tarih değerlerini güvenli hale getir
    const safeUpdates = { ...updates };
    
    // nextReviewDate varsa kontrol et
    if (safeUpdates.nextReviewDate) {
      try {
        const date = new Date(safeUpdates.nextReviewDate);
        if (isNaN(date.getTime())) {
          console.warn('Invalid nextReviewDate, using current date + 1 day');
          const now = new Date();
          now.setDate(now.getDate() + 1);
          safeUpdates.nextReviewDate = now;
        } else {
          // Tarih çok uzak gelecekte mi kontrol et
          const now = new Date();
          const maxFutureDate = new Date();
          maxFutureDate.setFullYear(now.getFullYear() + 1); // Maksimum 1 yıl sonra
          
          if (date > maxFutureDate) {
            console.warn('nextReviewDate too far in future, limiting to 1 year');
            safeUpdates.nextReviewDate = maxFutureDate;
          }
        }
      } catch (error) {
        console.warn('Error validating nextReviewDate:', error);
        const now = new Date();
        now.setDate(now.getDate() + 1);
        safeUpdates.nextReviewDate = now;
      }
    }
    
    // lastReviewed için güvenli tarih
    const now = new Date();
    if (isNaN(now.getTime())) {
      console.warn('Invalid current date, using fallback');
      safeUpdates.lastReviewed = new Date('2024-01-01');
    } else {
      safeUpdates.lastReviewed = now;
    }
    
    console.log('Updating word with safe dates:', {
      nextReviewDate: safeUpdates.nextReviewDate,
      lastReviewed: safeUpdates.lastReviewed
    });
    
    await updateDoc(wordRef, safeUpdates);
  }

  static async deleteWord(wordId: string): Promise<void> {
    const wordRef = doc(db, 'words', wordId);
    await deleteDoc(wordRef);
  }

  // İstatistik işlemleri
  static async saveDailyStats(stats: DailyStats): Promise<void> {
    const statsRef = doc(db, 'dailyStats', `${stats.date}_${stats.userId}`);
    await setDoc(statsRef, stats);
  }

  static async getDailyStats(userId: string, date: string): Promise<DailyStats | null> {
    const statsRef = doc(db, 'dailyStats', `${date}_${userId}`);
    const statsSnap = await getDoc(statsRef);
    
    if (statsSnap.exists()) {
      return statsSnap.data() as DailyStats;
    }
    return null;
  }

  // Rozet işlemleri
  static async getUserBadges(userId: string): Promise<Badge[]> {
    const badgesRef = collection(db, 'badges');
    const q = query(badgesRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Badge[];
  }

  static async addBadge(badgeData: Omit<Badge, 'id'>): Promise<string> {
    const badgeRef = await addDoc(collection(db, 'badges'), {
      ...badgeData,
      earnedAt: new Date()
    });
    return badgeRef.id;
  }

  // Eksik nextReviewDate'i Firebase'de düzelt
  private static async fixMissingNextReviewDate(wordId: string, nextReviewDate: Date): Promise<void> {
    try {
      const wordRef = doc(db, 'words', wordId);
      await updateDoc(wordRef, {
        nextReviewDate: nextReviewDate
      });
      console.log('Fixed nextReviewDate for word:', wordId);
    } catch (error) {
      console.error('Error fixing nextReviewDate:', error);
    }
  }

  // Tüm eksik alanları düzelt
  static async fixAllMissingFields(userId: string): Promise<void> {
    try {
      console.log('Fixing missing fields for user:', userId);
      const words = await this.getUserWords(userId);
      
      for (const word of words) {
        const updates: any = {};
        let needsUpdate = false;
        
        if (!word.nextReviewDate) {
          const now = new Date();
          now.setDate(now.getDate() + 1);
          updates.nextReviewDate = now;
          needsUpdate = true;
        }
        
        if (!word.createdAt) {
          updates.createdAt = new Date();
          needsUpdate = true;
        }
        
        if (!word.lastReviewed) {
          updates.lastReviewed = new Date();
          needsUpdate = true;
        }
        
        if (word.reviewCount === undefined || word.reviewCount === null) {
          updates.reviewCount = 0;
          needsUpdate = true;
        }
        
        if (word.interval === undefined || word.interval === null) {
          updates.interval = 1;
          needsUpdate = true;
        }
        
        if (word.efactor === undefined || word.efactor === null) {
          updates.efactor = 2.5;
          needsUpdate = true;
        }
        
        if (word.repetitions === undefined || word.repetitions === null) {
          updates.repetitions = 0;
          needsUpdate = true;
        }
        
        if (needsUpdate) {
          await this.updateWord(word.id, updates);
          console.log('Fixed missing fields for word:', word.word);
        }
      }
      
      console.log('All missing fields fixed for user:', userId);
    } catch (error) {
      console.error('Error fixing missing fields:', error);
    }
  }

  // Kullanıcı istatistiklerini getir
  static async getUserStats(userId: string): Promise<{
    totalWords: number;
    learnedWords: number;
    reviewCount: number;
    streakDays: number;
    averageScore: number;
    lastStudyDate: Date | null;
  }> {
    try {
      // Kullanıcı bilgilerini al
      const user = await this.getUser(userId);
      
      // Kullanıcının kelimelerini al
      const words = await this.getUserWords(userId);
      
      // İstatistikleri hesapla
      const totalWords = words.length;
      const learnedWords = words.filter(word => word.learningStatus === 'mastered').length;
      const reviewCount = words.reduce((total, word) => total + (word.reviewCount || 0), 0);
      const streakDays = user?.streak || 0;
      
      // Ortalama puan hesapla (basit bir hesaplama)
      const averageScore = totalWords > 0 ? Math.round((learnedWords / totalWords) * 100) : 0;
      
      // Son çalışma tarihi
      const lastStudyDate = words.length > 0 
        ? words.reduce((latest, word) => {
            try {
              const wordDate = new Date(word.lastReviewed || word.createdAt);
              if (isNaN(wordDate.getTime())) {
                return latest;
              }
              return wordDate > latest ? wordDate : latest;
            } catch (error) {
              console.warn('Error parsing date for word:', word.word, error);
              return latest;
            }
          }, new Date(0))
        : null;
      
      return {
        totalWords,
        learnedWords,
        reviewCount,
        streakDays,
        averageScore,
        lastStudyDate
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return {
        totalWords: 0,
        learnedWords: 0,
        reviewCount: 0,
        streakDays: 0,
        averageScore: 0,
        lastStudyDate: null
      };
    }
  }

  // Örnek kelime verileri
  static async addSampleWords(userId: string): Promise<void> {
    console.log('Adding sample words for user:', userId);
    
    const sampleWords = [
      // Kolay Seviye Kelimeler
      {
        word: 'beautiful',
        meaning: 'güzel',
        example: 'She has a beautiful smile.',
        difficulty: 'easy' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'happy',
        meaning: 'mutlu',
        example: 'I feel happy today.',
        difficulty: 'easy' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'strong',
        meaning: 'güçlü',
        example: 'He is a strong man.',
        difficulty: 'easy' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'smart',
        meaning: 'akıllı',
        example: 'She is a smart student.',
        difficulty: 'easy' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'kind',
        meaning: 'nazik, iyi kalpli',
        example: 'He is very kind to everyone.',
        difficulty: 'easy' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'brave',
        meaning: 'cesur',
        example: 'The brave firefighter saved the child.',
        difficulty: 'easy' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'honest',
        meaning: 'dürüst',
        example: 'Always be honest with your friends.',
        difficulty: 'easy' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'patient',
        meaning: 'sabırlı',
        example: 'Good teachers are patient with their students.',
        difficulty: 'easy' as const,
        learningStatus: 'new' as const,
        userId
      },

      // Orta Seviye Kelimeler
      {
        word: 'resilient',
        meaning: 'dayanıklı, esnek',
        example: 'She is very resilient in the face of adversity.',
        difficulty: 'medium' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'authentic',
        meaning: 'gerçek, orijinal',
        example: 'This restaurant serves authentic Italian food.',
        difficulty: 'medium' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'perseverance',
        meaning: 'azim, sebat',
        example: 'Success comes through perseverance and hard work.',
        difficulty: 'medium' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'ambitious',
        meaning: 'hırslı, tutkulu',
        example: 'She is very ambitious about her career.',
        difficulty: 'medium' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'confident',
        meaning: 'kendinden emin, güvenli',
        example: 'He spoke with confident voice.',
        difficulty: 'medium' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'generous',
        meaning: 'cömert',
        example: 'She is very generous with her time.',
        difficulty: 'medium' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'curious',
        meaning: 'meraklı',
        example: 'Children are naturally curious about the world.',
        difficulty: 'medium' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'creative',
        meaning: 'yaratıcı',
        example: 'She has a very creative mind.',
        difficulty: 'medium' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'determined',
        meaning: 'kararlı',
        example: 'He is determined to succeed.',
        difficulty: 'medium' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'enthusiastic',
        meaning: 'hevesli, coşkulu',
        example: 'She is enthusiastic about learning new things.',
        difficulty: 'medium' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'optimistic',
        meaning: 'iyimser',
        example: 'He has an optimistic view of the future.',
        difficulty: 'medium' as const,
        learningStatus: 'new' as const,
        userId
      },

      // Zor Seviye Kelimeler
      {
        word: 'serendipity',
        meaning: 'beklenmedik güzel şeylerin tesadüfen keşfedilmesi',
        example: 'Finding this book was pure serendipity.',
        difficulty: 'hard' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'ubiquitous',
        meaning: 'her yerde bulunan, yaygın',
        example: 'Smartphones have become ubiquitous in modern society.',
        difficulty: 'hard' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'ephemeral',
        meaning: 'geçici, kısa ömürlü',
        example: 'The beauty of cherry blossoms is ephemeral.',
        difficulty: 'hard' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'mellifluous',
        meaning: 'tatlı sesli, ahenkli',
        example: 'She has a mellifluous voice.',
        difficulty: 'hard' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'quintessential',
        meaning: 'tipik, özün özü',
        example: 'This is the quintessential example of good design.',
        difficulty: 'hard' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'enigmatic',
        meaning: 'gizemli, anlaşılmaz',
        example: 'He has an enigmatic personality.',
        difficulty: 'hard' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'magnanimous',
        meaning: 'yüce gönüllü, cömert',
        example: 'She was magnanimous in victory.',
        difficulty: 'hard' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'perspicacious',
        meaning: 'anlayışlı, zeki',
        example: 'He made a perspicacious observation.',
        difficulty: 'hard' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'eloquent',
        meaning: 'güzel konuşan, belagatli',
        example: 'She gave an eloquent speech.',
        difficulty: 'hard' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'tenacious',
        meaning: 'inatçı, kararlı',
        example: 'He is tenacious in pursuing his goals.',
        difficulty: 'hard' as const,
        learningStatus: 'new' as const,
        userId
      }
    ];

    console.log('Total sample words to add:', sampleWords.length);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const wordData of sampleWords) {
      try {
        console.log('Adding word:', wordData.word);
        await this.addWord(wordData as any);
        console.log('Successfully added word:', wordData.word);
        successCount++;
      } catch (error) {
        console.error('Error adding word:', wordData.word, error);
        errorCount++;
      }
    }
    
    console.log(`Sample words added successfully. Success: ${successCount}, Errors: ${errorCount}`);
    
    if (errorCount > 0) {
      throw new Error(`${errorCount} kelime eklenirken hata oluştu. ${successCount} kelime başarıyla eklendi.`);
    }
  }

  // Ek kelime verileri - daha fazla kelime eklemek için
  static async addExtraWords(userId: string): Promise<void> {
    const extraWords = [
      // Günlük Hayat Kelimeleri
      {
        word: 'accomplish',
        meaning: 'başarmak, tamamlamak',
        example: 'She accomplished all her goals for the year.',
        difficulty: 'medium' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'achieve',
        meaning: 'elde etmek, başarmak',
        example: 'He achieved great success in his career.',
        difficulty: 'medium' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'admire',
        meaning: 'hayran olmak, takdir etmek',
        example: 'I admire her courage and determination.',
        difficulty: 'easy' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'appreciate',
        meaning: 'takdir etmek, değerini bilmek',
        example: 'I really appreciate your help.',
        difficulty: 'medium' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'believe',
        meaning: 'inanmak',
        example: 'I believe in you and your abilities.',
        difficulty: 'easy' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'celebrate',
        meaning: 'kutlamak',
        example: 'We celebrate our anniversary every year.',
        difficulty: 'easy' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'challenge',
        meaning: 'meydan okuma, zorluk',
        example: 'This project presents a great challenge.',
        difficulty: 'medium' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'discover',
        meaning: 'keşfetmek',
        example: 'Scientists discover new things every day.',
        difficulty: 'easy' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'encourage',
        meaning: 'cesaretlendirmek, teşvik etmek',
        example: 'Parents should encourage their children to read.',
        difficulty: 'medium' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'experience',
        meaning: 'deneyim, tecrübe',
        example: 'Traveling gives you valuable life experience.',
        difficulty: 'medium' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'forgive',
        meaning: 'affetmek',
        example: 'It\'s important to learn to forgive others.',
        difficulty: 'easy' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'grateful',
        meaning: 'minnettar, şükran duyan',
        example: 'I am grateful for all the support I received.',
        difficulty: 'medium' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'inspire',
        meaning: 'ilham vermek',
        example: 'Her story inspires many people.',
        difficulty: 'medium' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'journey',
        meaning: 'yolculuk, seyahat',
        example: 'Life is a journey, not a destination.',
        difficulty: 'easy' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'knowledge',
        meaning: 'bilgi',
        example: 'Knowledge is power.',
        difficulty: 'medium' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'leadership',
        meaning: 'liderlik',
        example: 'Good leadership is essential for success.',
        difficulty: 'medium' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'opportunity',
        meaning: 'fırsat',
        example: 'This is a great opportunity for you.',
        difficulty: 'medium' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'passion',
        meaning: 'tutku, aşk',
        example: 'She has a passion for music.',
        difficulty: 'medium' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'respect',
        meaning: 'saygı',
        example: 'Respect must be earned.',
        difficulty: 'easy' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'success',
        meaning: 'başarı',
        example: 'Hard work leads to success.',
        difficulty: 'easy' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'wisdom',
        meaning: 'bilgelik',
        example: 'With age comes wisdom.',
        difficulty: 'medium' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'wonderful',
        meaning: 'harika, muhteşem',
        example: 'It was a wonderful experience.',
        difficulty: 'easy' as const,
        learningStatus: 'new' as const,
        userId
      }
    ];

    for (const wordData of extraWords) {
      await this.addWord(wordData as any);
    }
  }

  // TOEFL Kelimeleri - Zorluk seviyelerine göre kategorize edilmiş
  static async addTOEFLWords(userId: string): Promise<void> {
    console.log('Adding TOEFL words for user:', userId);
    
    const toeflWords = [
      // KOLAY SEVİYE TOEFL KELİMELERİ
      {
        word: 'academic',
        meaning: 'akademik, bilimsel',
        example: 'The academic year starts in September.',
        difficulty: 'easy' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'analyze',
        meaning: 'analiz etmek, incelemek',
        example: 'Scientists analyze data to find patterns.',
        difficulty: 'easy' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'approach',
        meaning: 'yaklaşım, yöntem',
        example: 'We need a different approach to solve this problem.',
        difficulty: 'easy' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'available',
        meaning: 'mevcut, kullanılabilir',
        example: 'The book is available in the library.',
        difficulty: 'easy' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'benefit',
        meaning: 'fayda, yarar',
        example: 'Exercise has many health benefits.',
        difficulty: 'easy' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'concept',
        meaning: 'kavram, fikir',
        example: 'The concept of democracy is important.',
        difficulty: 'easy' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'consider',
        meaning: 'düşünmek, değerlendirmek',
        example: 'Please consider all options before deciding.',
        difficulty: 'easy' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'develop',
        meaning: 'geliştirmek, gelişmek',
        example: 'Children develop language skills early.',
        difficulty: 'easy' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'environment',
        meaning: 'çevre, ortam',
        example: 'We must protect the environment.',
        difficulty: 'easy' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'evidence',
        meaning: 'kanıt, delil',
        example: 'There is strong evidence supporting this theory.',
        difficulty: 'easy' as const,
        learningStatus: 'new' as const,
        userId
      },

      // ORTA SEVİYE TOEFL KELİMELERİ
      {
        word: 'accomplish',
        meaning: 'başarmak, tamamlamak',
        example: 'She accomplished all her goals for the year.',
        difficulty: 'medium' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'adequate',
        meaning: 'yeterli, uygun',
        example: 'The food supply was adequate for the journey.',
        difficulty: 'medium' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'appropriate',
        meaning: 'uygun, münasip',
        example: 'Please wear appropriate clothing for the interview.',
        difficulty: 'medium' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'approximately',
        meaning: 'yaklaşık olarak',
        example: 'The meeting will last approximately two hours.',
        difficulty: 'medium' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'assumption',
        meaning: 'varsayım, tahmin',
        example: 'Don\'t make assumptions about people.',
        difficulty: 'medium' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'authority',
        meaning: 'yetki, otorite',
        example: 'The police have authority to maintain order.',
        difficulty: 'medium' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'capable',
        meaning: 'yetenekli, kabiliyetli',
        example: 'She is capable of handling difficult situations.',
        difficulty: 'medium' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'circumstance',
        meaning: 'durum, koşul',
        example: 'Under normal circumstances, this would work.',
        difficulty: 'medium' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'comprehensive',
        meaning: 'kapsamlı, geniş',
        example: 'The report provides a comprehensive analysis.',
        difficulty: 'medium' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'consequently',
        meaning: 'sonuç olarak, dolayısıyla',
        example: 'He was late; consequently, he missed the meeting.',
        difficulty: 'medium' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'considerable',
        meaning: 'önemli, büyük',
        example: 'The project requires considerable effort.',
        difficulty: 'medium' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'consistent',
        meaning: 'tutarlı, sürekli',
        example: 'Her work is consistently high quality.',
        difficulty: 'medium' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'constitute',
        meaning: 'oluşturmak, meydana getirmek',
        example: 'These factors constitute the main problem.',
        difficulty: 'medium' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'demonstrate',
        meaning: 'göstermek, kanıtlamak',
        example: 'The experiment demonstrates the theory.',
        difficulty: 'medium' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'distinct',
        meaning: 'belirgin, farklı',
        example: 'There are distinct differences between the two.',
        difficulty: 'medium' as const,
        learningStatus: 'new' as const,
        userId
      },

      // ZOR SEVİYE TOEFL KELİMELERİ
      {
        word: 'arbitrary',
        meaning: 'keyfi, rastgele',
        example: 'The decision seemed arbitrary and unfair.',
        difficulty: 'hard' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'authenticate',
        meaning: 'doğrulamak, gerçekliğini kanıtlamak',
        example: 'Experts authenticated the ancient manuscript.',
        difficulty: 'hard' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'benevolent',
        meaning: 'hayırsever, iyi kalpli',
        example: 'The benevolent donor gave millions to charity.',
        difficulty: 'hard' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'catastrophic',
        meaning: 'felaket, yıkıcı',
        example: 'The earthquake had catastrophic consequences.',
        difficulty: 'hard' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'coherent',
        meaning: 'tutarlı, anlaşılır',
        example: 'Her argument was coherent and well-structured.',
        difficulty: 'hard' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'comprehensive',
        meaning: 'kapsamlı, geniş kapsamlı',
        example: 'The study provides a comprehensive analysis.',
        difficulty: 'hard' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'concurrent',
        meaning: 'eşzamanlı, aynı anda olan',
        example: 'The two events occurred concurrently.',
        difficulty: 'hard' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'controversial',
        meaning: 'tartışmalı, çekişmeli',
        example: 'The new policy is highly controversial.',
        difficulty: 'hard' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'credible',
        meaning: 'güvenilir, inandırıcı',
        example: 'The witness provided credible testimony.',
        difficulty: 'hard' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'cumulative',
        meaning: 'birikimli, toplam',
        example: 'The cumulative effect of pollution is concerning.',
        difficulty: 'hard' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'deteriorate',
        meaning: 'kötüleşmek, bozulmak',
        example: 'His health began to deteriorate rapidly.',
        difficulty: 'hard' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'elaborate',
        meaning: 'ayrıntılı, karmaşık',
        example: 'She gave an elaborate explanation of the process.',
        difficulty: 'hard' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'empirical',
        meaning: 'deneysel, gözlemsel',
        example: 'The theory is supported by empirical evidence.',
        difficulty: 'hard' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'enormous',
        meaning: 'muazzam, çok büyük',
        example: 'The project required enormous resources.',
        difficulty: 'hard' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'explicit',
        meaning: 'açık, belirgin',
        example: 'The instructions were explicit and clear.',
        difficulty: 'hard' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'facilitate',
        meaning: 'kolaylaştırmak, yardımcı olmak',
        example: 'Technology facilitates communication.',
        difficulty: 'hard' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'fundamental',
        meaning: 'temel, esas',
        example: 'Education is fundamental to society.',
        difficulty: 'hard' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'hypothesis',
        meaning: 'hipotez, varsayım',
        example: 'Scientists tested their hypothesis.',
        difficulty: 'hard' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'inevitable',
        meaning: 'kaçınılmaz, zorunlu',
        example: 'Change is inevitable in life.',
        difficulty: 'hard' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'innovative',
        meaning: 'yenilikçi, yaratıcı',
        example: 'The company is known for innovative products.',
        difficulty: 'hard' as const,
        learningStatus: 'new' as const,
        userId
      },
      {
        word: 'legitimate',
        meaning: 'meşru, yasal',
        example: 'The concerns raised are legitimate.',
        difficulty: 'hard' as const,
        learningStatus: 'new' as const,
        userId
      }
    ];

    console.log('Total TOEFL words to add:', toeflWords.length);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const wordData of toeflWords) {
      try {
        console.log('Adding TOEFL word:', wordData.word);
        await this.addWord(wordData as any);
        console.log('Successfully added TOEFL word:', wordData.word);
        successCount++;
      } catch (error) {
        console.error('Error adding TOEFL word:', wordData.word, error);
        errorCount++;
      }
    }
    
    console.log(`TOEFL words added successfully. Success: ${successCount}, Errors: ${errorCount}`);
    
    if (errorCount > 0) {
      throw new Error(`${errorCount} TOEFL kelimesi eklenirken hata oluştu. ${successCount} kelime başarıyla eklendi.`);
    }
  }
} 