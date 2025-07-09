import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: '../docs/swagger.json',
  output: './src/client',
});
