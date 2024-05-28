import eslint from '@eslint/js';
import {configs as tseslintConfigs} from 'typescript-eslint';

const {configs: eslintConfigs} = eslint;

export default [
  {
    ...eslintConfigs.recommended,
    files: ['src/**/*.ts'],
    settings: {
      jsdoc: {
        tagNamePreference: {
          returns: "return"
        }
      }
    }
  },
  ...tseslintConfigs.strict,
  {
    files: ['src/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off'
    }
  },
  {
    files: ['src/test/**/*.ts'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unused-vars': 'off'
    }
  }
];
