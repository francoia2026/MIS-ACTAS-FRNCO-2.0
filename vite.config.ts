import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig} from 'vite';

// Find the actual case-insensitive folder name for 'src'
const getSrcFolder = () => {
  const folders = ['src', 'Src', 'SRC'];
  for (const f of folders) {
    if (fs.existsSync(path.resolve(process.cwd(), f))) {
      return f;
    }
  }
  return 'src'; // default fallback
};

const srcFolder = getSrcFolder();

const caseResolutionPlugin = () => {
  return {
    name: 'case-resolution',
    transformIndexHtml(html: string) {
      // Replace "/src/" with whichever casing actually exists on disk
      return html.replace(/\/src\//gi, `/${srcFolder}/`);
    },
    resolveId(source: string) {
      if (srcFolder !== 'src') {
        if (source.startsWith('/src/')) {
          return path.resolve(process.cwd(), srcFolder, source.slice(5));
        }
        if (source.startsWith('src/')) {
          return path.resolve(process.cwd(), srcFolder, source.slice(4));
        }
      }
      return null;
    }
  };
};

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), caseResolutionPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
