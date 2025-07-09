import { eslintConfig as common } from '@gewis/eslint-config-typescript';
import { eslintConfig as prettier } from '@gewis/prettier-config';

export default [
  ...common,
  prettier,
  {
    ignores: ['src/client/**', 'dist/**', 'test/**', 'openapi-ts.config.ts', 'vitest.config.ts'],
  },
];
