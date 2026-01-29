#!/usr/bin/env node

/**
 * 🔍 Script de vérification du build Angular
 * Vérifie les erreurs communes qui peuvent causer l'affichage de la page par défaut
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification de la configuration Angular...\n');

// 1. Vérifier angular.json
const angularJsonPath = './angular.json';
if (fs.existsSync(angularJsonPath)) {
  const angularJson = JSON.parse(fs.readFileSync(angularJsonPath, 'utf8'));
  const buildConfig = angularJson.projects.frontend.architect.build;
  
  console.log('✅ angular.json trouvé');
  console.log('📁 Main:', buildConfig.options.main);
  console.log('📄 Index:', buildConfig.options.index);
  console.log('🎨 Styles:', buildConfig.options.styles);
  
  // Vérifier SCSS
  if (buildConfig.options.styles.includes('src/styles.scss')) {
    console.log('✅ SCSS configuré correctement');
  } else {
    console.log('❌ SCSS non configuré');
  }
} else {
  console.log('❌ angular.json non trouvé');
}

// 2. Vérifier les fichiers essentiels
const essentialFiles = [
  'src/main.ts',
  'src/index.html',
  'src/app/app.component.ts',
  'src/app/app.component.html',
  'src/app/app.component.scss',
  'src/app/app.config.ts'
];

console.log('\n📁 Vérification des fichiers essentiels:');
essentialFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} MANQUANT`);
  }
});

// 3. Vérifier package.json
const packageJsonPath = './package.json';
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  console.log('\n📦 Scripts disponibles:');
  Object.keys(packageJson.scripts || {}).forEach(script => {
    console.log(`  - ${script}: ${packageJson.scripts[script]}`);
  });
  
  // Vérifier les dépendances Angular
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  const angularVersion = deps['@angular/core'];
  if (angularVersion) {
    console.log(`\n🅰️ Version Angular: ${angularVersion}`);
  }
}

// 4. Vérifier la structure du composant principal
const appComponentPath = 'src/app/app.component.ts';
if (fs.existsSync(appComponentPath)) {
  const content = fs.readFileSync(appComponentPath, 'utf8');
  
  console.log('\n🔍 Analyse du composant principal:');
  
  if (content.includes('selector: \'app-root\'')) {
    console.log('✅ Selector app-root trouvé');
  } else {
    console.log('❌ Selector app-root manquant');
  }
  
  if (content.includes('templateUrl') || content.includes('template')) {
    console.log('✅ Template configuré');
  } else {
    console.log('❌ Template manquant');
  }
  
  if (content.includes('styleUrl') || content.includes('styleUrls')) {
    console.log('✅ Styles configurés');
  } else {
    console.log('⚠️ Styles non configurés');
  }
}

console.log('\n🎯 Recommandations:');
console.log('1. Vider le cache: rm -rf .angular/cache');
console.log('2. Réinstaller: npm ci');
console.log('3. Build propre: npm run build');
console.log('4. Vérifier la console du navigateur pour les erreurs');

console.log('\n✨ Vérification terminée!');