#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 WordMaster Production Build Başlatılıyor...\n');

// 1. Test kontrolü
console.log('📋 Testler çalıştırılıyor...');
try {
  execSync('npm test', { stdio: 'inherit' });
  console.log('✅ Tüm testler geçti\n');
} catch (error) {
  console.error('❌ Testler başarısız! Build durduruluyor.');
  process.exit(1);
}

// 2. Production modunu kontrol et
console.log('🔧 Production modu kontrol ediliyor...');
const adServicePath = path.join(__dirname, '../src/services/adService.ts');
const adServiceContent = fs.readFileSync(adServicePath, 'utf8');

if (adServiceContent.includes('isTestMode: boolean = true')) {
  console.error('❌ AdService hala test modunda! Production moduna çevirin.');
  process.exit(1);
}

console.log('✅ Production modu aktif\n');

// 3. Gerekli dosyaları kontrol et
console.log('📁 Gerekli dosyalar kontrol ediliyor...');
const requiredFiles = [
  'PRIVACY_POLICY.md',
  'TERMS_OF_SERVICE.md',
  'app.json',
  'eas.json'
];

for (const file of requiredFiles) {
  const filePath = path.join(__dirname, '..', file);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ ${file} dosyası eksik!`);
    process.exit(1);
  }
}

console.log('✅ Tüm gerekli dosyalar mevcut\n');

// 4. EAS Build başlat
console.log('🏗️ EAS Production Build başlatılıyor...');
console.log('⚠️  Bu işlem 10-15 dakika sürebilir...\n');

try {
  execSync('eas build --platform android --profile production', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  
  console.log('\n🎉 Production build başarıyla tamamlandı!');
  console.log('📱 APK dosyası EAS Dashboard\'da hazır.');
  console.log('📤 Play Store\'a yüklemek için hazır.');
  
} catch (error) {
  console.error('\n❌ Build başarısız!');
  console.error('Hata detayları:', error.message);
  process.exit(1);
}

// 5. Sonraki adımlar
console.log('\n📋 Sonraki Adımlar:');
console.log('1. EAS Dashboard\'dan APK\'yı indirin');
console.log('2. Google Play Console\'a giriş yapın');
console.log('3. Yeni uygulama oluşturun');
console.log('4. APK\'yı yükleyin');
console.log('5. Store listing bilgilerini doldurun');
console.log('6. Privacy Policy ve Terms of Service linklerini ekleyin');
console.log('7. İnceleme için gönderin');

console.log('\n🎯 Başarılar!'); 