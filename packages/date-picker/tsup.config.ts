import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  minify: false,
  splitting: false,
  treeshake: true,
  external: ['react', 'react-dom', 'react/jsx-runtime'],
  outExtension({ format }: { format: 'esm' | 'cjs' }) {
    return {
      js: format === 'esm' ? '.mjs' : '.js',
    };
  },
});
