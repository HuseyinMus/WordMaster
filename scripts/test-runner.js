#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Renkli console output için
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const logHeader = (title) => {
  log('\n' + '='.repeat(60), 'cyan');
  log(`  ${title}`, 'bright');
  log('='.repeat(60), 'cyan');
};

const logSection = (title) => {
  log('\n' + '-'.repeat(40), 'yellow');
  log(`  ${title}`, 'yellow');
  log('-'.repeat(40), 'yellow');
};

const logSuccess = (message) => log(`✅ ${message}`, 'green');
const logError = (message) => log(`❌ ${message}`, 'red');
const logWarning = (message) => log(`⚠️  ${message}`, 'yellow');
const logInfo = (message) => log(`ℹ️  ${message}`, 'blue');

// Test sonuçları
let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  warnings: 0,
  details: []
};

const addResult = (testName, status, message, details = null) => {
  testResults.total++;
  
  switch (status) {
    case 'success':
      testResults.passed++;
      logSuccess(`${testName}: ${message}`);
      break;
    case 'error':
      testResults.failed++;
      logError(`${testName}: ${message}`);
      break;
    case 'warning':
      testResults.warnings++;
      logWarning(`${testName}: ${message}`);
      break;
  }
  
  testResults.details.push({
    name: testName,
    status,
    message,
    details
  });
};

// Dosya varlık testleri
const testFileExists = (filePath, description) => {
  const fullPath = path.join(__dirname, '..', filePath);
  if (fs.existsSync(fullPath)) {
    addResult(description, 'success', 'Dosya mevcut');
    return true;
  } else {
    addResult(description, 'error', 'Dosya bulunamadı');
    return false;
  }
};

// Package.json testleri
const testPackageJson = () => {
  logSection('Package.json Testleri');
  
  const packagePath = path.join(__dirname, '..', 'package.json');
  if (!fs.existsSync(packagePath)) {
    addResult('Package.json', 'error', 'package.json dosyası bulunamadı');
    return;
  }
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Gerekli dependencies kontrolü
    const requiredDeps = [
      'react-native-google-mobile-ads',
      '@react-native-firebase/app',
      '@react-native-firebase/firestore',
      '@react-native-firebase/auth',
      'expo-linear-gradient'
    ];
    
    requiredDeps.forEach(dep => {
      if (packageJson.dependencies && packageJson.dependencies[dep]) {
        addResult(`Dependency: ${dep}`, 'success', `Versiyon: ${packageJson.dependencies[dep]}`);
      } else if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
        addResult(`Dependency: ${dep}`, 'success', `Versiyon: ${packageJson.devDependencies[dep]} (dev)`);
      } else {
        addResult(`Dependency: ${dep}`, 'error', 'Eksik');
      }
    });
    
    // Scripts kontrolü
    if (packageJson.scripts && packageJson.scripts.start) {
      addResult('Start Script', 'success', 'Mevcut');
    } else {
      addResult('Start Script', 'warning', 'Eksik');
    }
    
  } catch (error) {
    addResult('Package.json Parse', 'error', `JSON parse hatası: ${error.message}`);
  }
};

// Firebase konfigürasyon testleri
const testFirebaseConfig = () => {
  logSection('Firebase Konfigürasyon Testleri');
  
  const configPath = path.join(__dirname, '..', 'src', 'config', 'firebase.ts');
  if (!testFileExists('src/config/firebase.ts', 'Firebase Config')) {
    return;
  }
  
  try {
    const configContent = fs.readFileSync(configPath, 'utf8');
    
    // Firebase import kontrolü
    if (configContent.includes('initializeApp')) {
      addResult('Firebase Initialize', 'success', 'initializeApp kullanılıyor');
    } else {
      addResult('Firebase Initialize', 'error', 'initializeApp bulunamadı');
    }
    
    // Firestore kontrolü
    if (configContent.includes('getFirestore')) {
      addResult('Firestore Config', 'success', 'getFirestore kullanılıyor');
    } else {
      addResult('Firestore Config', 'error', 'getFirestore bulunamadı');
    }
    
    // Auth kontrolü
    if (configContent.includes('getAuth')) {
      addResult('Auth Config', 'success', 'getAuth kullanılıyor');
    } else {
      addResult('Auth Config', 'error', 'getAuth bulunamadı');
    }
    
  } catch (error) {
    addResult('Firebase Config Read', 'error', `Dosya okuma hatası: ${error.message}`);
  }
};

// AdMob konfigürasyon testleri
const testAdMobConfig = () => {
  logSection('AdMob Konfigürasyon Testleri');
  
  const configPath = path.join(__dirname, '..', 'src', 'config', 'admob.ts');
  if (!testFileExists('src/config/admob.ts', 'AdMob Config')) {
    return;
  }
  
  try {
    const configContent = fs.readFileSync(configPath, 'utf8');
    
    // AdMob import kontrolü
    if (configContent.includes('mobileAds')) {
      addResult('AdMob Import', 'success', 'mobileAds import edilmiş');
    } else {
      addResult('AdMob Import', 'error', 'mobileAds import edilmemiş');
    }
    
    // Test ID kontrolü
    if (configContent.includes('ca-app-pub-3940256099942544')) {
      addResult('Test IDs', 'success', 'Test reklam ID\'leri mevcut');
    } else {
      addResult('Test IDs', 'warning', 'Test reklam ID\'leri bulunamadı');
    }
    
    // Production ID kontrolü
    if (configContent.includes('ca-app-pub-')) {
      addResult('Production IDs', 'success', 'Production reklam ID\'leri mevcut');
    } else {
      addResult('Production IDs', 'warning', 'Production reklam ID\'leri bulunamadı');
    }
    
  } catch (error) {
    addResult('AdMob Config Read', 'error', `Dosya okuma hatası: ${error.message}`);
  }
};

// Servis dosyaları testleri
const testServices = () => {
  logSection('Servis Dosyaları Testleri');
  
  const services = [
    'src/services/firebaseService.ts',
    'src/services/adService.ts',
    'src/services/quizService.ts',
    'src/services/spacedRepetition.ts'
  ];
  
  services.forEach(service => {
    testFileExists(service, `Service: ${path.basename(service)}`);
  });
};

// Komponent dosyaları testleri
const testComponents = () => {
  logSection('Komponent Dosyaları Testleri');
  
  const components = [
    'src/components/BannerAdComponent.tsx',
    'src/components/RewardedAdComponent.tsx',
    'src/components/AdTestComponent.tsx',
    'src/components/TestReportComponent.tsx'
  ];
  
  components.forEach(component => {
    testFileExists(component, `Component: ${path.basename(component)}`);
  });
};

// Screen dosyaları testleri
const testScreens = () => {
  logSection('Screen Dosyaları Testleri');
  
  const screens = [
    'src/screens/HomeScreen.tsx',
    'src/screens/LearningScreen.tsx',
    'src/screens/QuizScreen.tsx',
    'src/screens/ProfileScreen.tsx',
    'src/screens/WordListScreen.tsx'
  ];
  
  screens.forEach(screen => {
    testFileExists(screen, `Screen: ${path.basename(screen)}`);
  });
};

// TypeScript konfigürasyon testleri
const testTypeScriptConfig = () => {
  logSection('TypeScript Konfigürasyon Testleri');
  
  const tsConfigPath = path.join(__dirname, '..', 'tsconfig.json');
  if (!testFileExists('tsconfig.json', 'TypeScript Config')) {
    return;
  }
  
  try {
    const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));
    
    if (tsConfig.compilerOptions) {
      addResult('Compiler Options', 'success', 'TypeScript compiler options mevcut');
    } else {
      addResult('Compiler Options', 'warning', 'Compiler options eksik');
    }
    
    if (tsConfig.include && tsConfig.include.length > 0) {
      addResult('Include Paths', 'success', `${tsConfig.include.length} include path tanımlı`);
    } else {
      addResult('Include Paths', 'warning', 'Include paths eksik');
    }
    
  } catch (error) {
    addResult('TypeScript Config Parse', 'error', `JSON parse hatası: ${error.message}`);
  }
};

// Expo konfigürasyon testleri
const testExpoConfig = () => {
  logSection('Expo Konfigürasyon Testleri');
  
  const appJsonPath = path.join(__dirname, '..', 'app.json');
  if (!testFileExists('app.json', 'Expo Config')) {
    return;
  }
  
  try {
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
    
    if (appJson.expo && appJson.expo.name) {
      addResult('App Name', 'success', `Uygulama adı: ${appJson.expo.name}`);
    } else {
      addResult('App Name', 'warning', 'Uygulama adı tanımlanmamış');
    }
    
    if (appJson.expo && appJson.expo.plugins) {
      const hasAdMobPlugin = appJson.expo.plugins.some(plugin => 
        typeof plugin === 'string' ? plugin.includes('admob') : 
        (Array.isArray(plugin) && plugin[0] && plugin[0].includes('admob'))
      );
      
      if (hasAdMobPlugin) {
        addResult('AdMob Plugin', 'success', 'AdMob plugin tanımlı');
      } else {
        addResult('AdMob Plugin', 'warning', 'AdMob plugin tanımlanmamış');
      }
    } else {
      addResult('AdMob Plugin', 'warning', 'Plugins bölümü bulunamadı');
    }
    
  } catch (error) {
    addResult('Expo Config Parse', 'error', `JSON parse hatası: ${error.message}`);
  }
};

// Node modules kontrolü
const testNodeModules = () => {
  logSection('Node Modules Testleri');
  
  const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
  if (fs.existsSync(nodeModulesPath)) {
    addResult('Node Modules', 'success', 'node_modules klasörü mevcut');
    
    // Önemli paketlerin kontrolü
    const importantPackages = [
      'react-native-google-mobile-ads',
      '@react-native-firebase',
      'expo'
    ];
    
    importantPackages.forEach(pkg => {
      const pkgPath = path.join(nodeModulesPath, pkg);
      if (fs.existsSync(pkgPath)) {
        addResult(`Package: ${pkg}`, 'success', 'Yüklü');
      } else {
        addResult(`Package: ${pkg}`, 'error', 'Yüklü değil');
      }
    });
    
  } else {
    addResult('Node Modules', 'error', 'node_modules klasörü bulunamadı. npm install çalıştırın.');
  }
};

// Özet rapor
const printSummary = () => {
  logHeader('Test Özeti');
  
  const successRate = testResults.total > 0 ? (testResults.passed / testResults.total * 100).toFixed(1) : 0;
  
  log(`📊 Toplam Test: ${testResults.total}`, 'bright');
  log(`✅ Başarılı: ${testResults.passed}`, 'green');
  log(`❌ Başarısız: ${testResults.failed}`, 'red');
  log(`⚠️  Uyarı: ${testResults.warnings}`, 'yellow');
  log(`📈 Başarı Oranı: ${successRate}%`, 'cyan');
  
  if (testResults.failed > 0) {
    log('\n🔧 Öneriler:', 'yellow');
    log('1. Eksik dosyaları oluşturun', 'yellow');
    log('2. npm install çalıştırın', 'yellow');
    log('3. Firebase ve AdMob konfigürasyonlarını kontrol edin', 'yellow');
    log('4. TypeScript hatalarını düzeltin', 'yellow');
  } else if (testResults.warnings > 0) {
    log('\n💡 İyileştirme Önerileri:', 'blue');
    log('1. Eksik konfigürasyonları tamamlayın', 'blue');
    log('2. Test ID\'leri ekleyin', 'blue');
    log('3. Plugin konfigürasyonlarını kontrol edin', 'blue');
  } else {
    log('\n🎉 Tüm testler başarılı! Uygulama hazır.', 'green');
  }
  
  // Detaylı sonuçları dosyaya kaydet
  const reportPath = path.join(__dirname, '..', 'test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
  log(`\n📄 Detaylı rapor: ${reportPath}`, 'cyan');
};

// Ana test fonksiyonu
const runTests = () => {
  logHeader('WordMaster Uygulama Testleri');
  logInfo('Testler başlatılıyor...\n');
  
  testPackageJson();
  testFirebaseConfig();
  testAdMobConfig();
  testServices();
  testComponents();
  testScreens();
  testTypeScriptConfig();
  testExpoConfig();
  testNodeModules();
  
  printSummary();
};

// Script çalıştırma
if (require.main === module) {
  runTests();
}

module.exports = { runTests, testResults }; 