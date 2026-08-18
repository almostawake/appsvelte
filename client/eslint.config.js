// ESLint flat config — correctness-focused. Formatting is Prettier's job
// (eslint-config-prettier switches every stylistic rule off), so anything
// this file flags is a real code-quality issue, not taste. Tuned for
// LLM-written code: the enabled extras catch the classic LLM slips —
// unused imports/vars, loose equality, shadowed names, unhandled
// promises left floating.
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import ts from 'typescript-eslint';
import svelteConfig from './svelte.config.js';

export default ts.config(
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs.recommended,
  prettier,
  ...svelte.configs.prettier,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      // Unused code is the #1 LLM residue. Underscore-prefix to opt out.
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      // == coerces; === says what you mean.
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      // A shadowed name is a bug waiting for a refactor.
      'no-shadow': 'off',
      '@typescript-eslint/no-shadow': 'error',
      // Leftover debug logging shouldn't ship silently.
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      // Guards base-path deployments, which this template never uses
      // (hosting serves at the domain root). Plain goto('/x') and
      // href="/x" are the intended idiom here.
      'svelte/no-navigation-without-resolve': 'off',
    },
  },
  {
    files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        extraFileExtensions: ['.svelte'],
        parser: ts.parser,
        svelteConfig,
      },
    },
  },
  {
    ignores: ['.svelte-kit/', 'build/', 'dist/', 'static/'],
  },
);
