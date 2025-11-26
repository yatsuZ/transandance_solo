/** @type {import('jest').Config} */
module.exports = {
  // 🔧 Utilise ts-jest pour compiler automatiquement le TypeScript en JavaScript
  preset: 'ts-jest',

  // 🌍 Environnement d'exécution : 'node' (pas 'jsdom' car on n'a pas besoin du DOM)
  testEnvironment: 'node',

  // 📁 Dossier racine où Jest cherche les tests
  roots: ['<rootDir>/tests'],

  // 🎯 Pattern pour identifier les fichiers de test (tous les *.test.ts)
  testMatch: ['**/*.test.ts'],

  // 📦 Extensions de fichiers supportées (dans l'ordre de priorité)
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // 📊 Active la mesure de couverture de code (code coverage)
  // Montre quel % du code est testé
  collectCoverage: true,

  // 📂 Quels fichiers inclure dans le rapport de couverture
  collectCoverageFrom: [
    'srcs/static/js/pong/**/*.ts',      // Tous les fichiers .ts du dossier pong
    '!srcs/static/js/pong/**/*.d.ts',   // SAUF les fichiers de déclaration TypeScript (.d.ts)
  ],

  // 📁 Dossier de sortie pour les rapports de couverture
  coverageDirectory: 'coverage',

  // 📄 Formats des rapports de couverture
  // - 'text' : affichage dans le terminal
  // - 'lcov' : format pour les outils d'intégration continue
  // - 'html' : rapport HTML navigable (coverage/index.html)
  coverageReporters: ['text', 'lcov', 'html'],

  // 🔄 Configuration de la transformation TypeScript → JavaScript
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: {
        module: 'commonjs',        // Utilise CommonJS (require/module.exports) pour Jest
        target: 'ES2020',          // Compile vers ES2020
        esModuleInterop: true,     // Compatibilité imports ES6/CommonJS
        skipLibCheck: true,        // Ne vérifie pas les types des node_modules (plus rapide)
        allowSyntheticDefaultImports: true,  // Permet les imports par défaut
      }
    }]
  },

  // 🔗 CRUCIAL : Mapper les imports .js vers les fichiers .ts
  // Ton code utilise : import { Ball } from './geometry.js'
  // Mais le fichier est : geometry.ts
  // Ce mapper transforme : './geometry.js' → './geometry' (Jest trouve geometry.ts)
  moduleNameMapper: {
    // Pattern 1 : Imports relatifs avec .js (./file.js, ../file.js, ../../file.js)
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },

  // 🔍 Résolution des modules (ordre de recherche des extensions)
  // Jest cherchera dans cet ordre : .ts, .tsx, .js, .jsx, .json
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // ⚙️ Options de résolution
  // Permet à Jest de résoudre les modules comme TypeScript le fait
  modulePaths: ['<rootDir>'],
};
