import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import nextPlugin from '@next/eslint-plugin-next'
import importPlugin from 'eslint-plugin-import'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import unicorn from 'eslint-plugin-unicorn'
import unusedImports from 'eslint-plugin-unused-imports'
import tseslint from 'typescript-eslint'
import globals from 'globals'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = [
  // Base configs
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // Next.js config
  ...compat.config({
    extends: ['next/core-web-vitals'],
  }),

  // Prettier (cuối cùng)
  ...compat.config({
    extends: ['prettier'],
  }),

  // Global settings
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },

  // Main rules
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    plugins: {
      '@next/next': nextPlugin,
      import: importPlugin,
      'simple-import-sort': simpleImportSort,
      unicorn,
      'unused-imports': unusedImports,
    },
    settings: {
      next: {
        rootDir: '.',
      },
    },
    rules: {
      // SOLID & DRY principles
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'no-duplicate-imports': 'error',
      'no-console': 'warn',
      'prefer-arrow-callback': 'error',

      // Import organization optimized cho Next.js 15 + App Router
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // React core imports
            ['^react$', '^react/'],
            // Next.js imports
            ['^next/', '^@next/'],
            // External packages
            ['^@?\\w'],
            // Internal aliases (@/)
            ['^@/'],
            // Internal relative imports
            ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
            ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
            // Style imports
            ['^.+\\.?(css|scss|sass)$'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',

      // Unused imports cleanup
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],

      // TypeScript rules optimized for Next.js 15
      '@typescript-eslint/no-unused-vars': 'off', // handled by unused-imports
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: false,
        },
      ],
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-empty-interface': 'off',

      // Code quality & complexity (tuân thủ SOLID)
      complexity: ['warn', 12],
      'max-lines-per-function': ['warn', 60],
      'max-depth': ['warn', 4],
      'max-params': ['warn', 4],

      // Modern JS/TS patterns
      'unicorn/filename-case': [
        'error',
        {
          cases: {
            kebabCase: true,
            camelCase: true,
            pascalCase: true,
          },
        },
      ],
      'unicorn/prefer-module': 'error',
      'unicorn/prefer-node-protocol': 'error',
      'unicorn/no-array-for-each': 'error',
      'unicorn/prefer-array-some': 'error',
      'unicorn/prefer-includes': 'error',

      // Next.js specific
      '@next/next/no-html-link-for-pages': 'off',
      '@next/next/no-img-element': 'warn', // Khuyến khích dùng next/image

      // Custom rules cho Tailwind v4
      'no-irregular-whitespace': ['error', { skipStrings: false }],
      'no-magic-numbers': [
        'warn',
        {
          ignore: [0, 1, -1],
          ignoreArrayIndexes: true,
          detectObjects: false,
        },
      ],
    },
  },

  // Server Components specific rules
  {
    files: ['app/**/*.{ts,tsx}', 'src/app/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-globals': [
        'error',
        {
          name: 'localStorage',
          message:
            'localStorage không khả dụng trong Server Components. Sử dụng cookies hoặc database.',
        },
        {
          name: 'sessionStorage',
          message: 'sessionStorage không khả dụng trong Server Components.',
        },
        {
          name: 'document',
          message:
            'document không khả dụng trong Server Components. Sử dụng "use client" directive.',
        },
        {
          name: 'window',
          message:
            'window không khả dụng trong Server Components. Sử dụng "use client" directive.',
        },
      ],
      // Warn về async components không có proper error handling
      'prefer-promise-reject-errors': 'error',
    },
  },

  // Client Components specific rules
  {
    files: ['**/*client*.{ts,tsx}', 'components/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-globals': 'off', // Allow browser APIs
    },
  },

  // API Routes rules (cho cả App Router và Pages Router)
  {
    files: ['app/api/**/*.{ts,tsx}', 'pages/api/**/*.{ts,tsx}'],
    rules: {
      'unicorn/prefer-module': 'off', // API routes có thể dùng CommonJS
      '@typescript-eslint/no-explicit-any': 'off', // API có thể cần any cho request/response
    },
  },

  // Configuration files
  {
    files: ['*.config.{js,mjs,ts}', 'tailwind.config.{js,ts}'],
    rules: {
      'unicorn/prefer-module': 'off',
      '@typescript-eslint/no-var-requires': 'off',
    },
  },

  // Ignore patterns
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'dist/**',
      'build/**',
      '.cache/**',
      'public/**',
      '*.config.{js,mjs}',
      'scripts/**',
    ],
  },
]

export default eslintConfig
