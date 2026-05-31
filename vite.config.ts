import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Library build mode
  if (mode === 'lib') {
    return {
      plugins: [
        react(),
        dts({
          include: ['src'],
          exclude: ['src/main.tsx'],
          insertTypesEntry: true,
          tsconfigPath: './tsconfig.app.json',
        }),
      ],
      build: {
        lib: {
          entry: resolve(__dirname, 'src/index.ts'),
          name: 'JsonSchemaFormBuilder',
          fileName: 'json-schema-form-builder',
          formats: ['es', 'umd'] as const,
        },
        rollupOptions: {
          external: ['react', 'react-dom', 'react/jsx-runtime'],
          output: {
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM',
              'react/jsx-runtime': 'jsxRuntime',
            },
          },
        },
        cssCodeSplit: false,
      },
    }
  }

  // Default dev/app build mode
  return {
    base: '/json-schema-form-builder/',
    plugins: [react()],
  }
})
