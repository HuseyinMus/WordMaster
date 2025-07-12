const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, updateDoc, doc, Timestamp } = require('firebase/firestore');
const firebaseConfig = require('../src/config/firebaseConfig.json');

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixWordDates() {
  const wordsRef = collection(db, 'words');
  const snapshot = await getDocs(wordsRef);

  for (const wordDoc of snapshot.docs) {
    const data = wordDoc.data();
    let updateNeeded = false;
    const updates = {};

    ['nextReviewDate', 'createdAt', 'lastReviewed'].forEach(field => {
      if (data[field] && typeof data[field] === 'string') {
        updates[field] = Timestamp.fromDate(new Date(data[field]));
        updateNeeded = true;
      }
      if (!data[field]) {
        updates[field] = Timestamp.now();
        updateNeeded = true;
      }
    });

    if (!data.userId) {
      // Burada elle doldurman gerekebilir veya logla
      console.warn(`userId eksik: ${wordDoc.id}`);
    }

    if (updateNeeded) {
      await updateDoc(doc(db, 'words', wordDoc.id), updates);
      console.log(`Updated word: ${data.word}`);
    }
  }
  console.log('Tüm kelime tarihleri düzeltildi.');
}

fixWordDates().catch(console.error); 