import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig} from 'vite';

// Find the actual case-insensitive folder name for 'src'
const getActualSrcFolder = () => {
  try {
    const files = fs.readdirSync(process.cwd());
    const found = files.find(f => f.toLowerCase() === 'src');
    return found || 'src';
  } catch (e) {
    return 'src';
  }
};

const srcFolder = getActualSrcFolder();

const getCorrectCasing = (sourcePath: string) => {
  if (srcFolder === 'src') return sourcePath;
  let corrected = sourcePath;
  corrected = corrected.replace(/([/\\])src([/\\])/i, `$1${srcFolder}$2`);
  if (corrected.startsWith('src/') || corrected.startsWith('src\\')) {
    corrected = srcFolder + corrected.slice(3);
  }
  return corrected;
};

const caseResolutionPlugin = () => {
  return {
    name: 'case-resolution',
    enforce: 'pre' as const,
    transformIndexHtml: {
      order: 'pre' as const,
      handler(html: string) {
        return html.replace(/\/src\//gi, `/${srcFolder}/`);
      }
    },
    resolveId(source: string) {
      if (srcFolder !== 'src') {
        const corrected = getCorrectCasing(source);
        if (corrected !== source) {
          if (corrected.startsWith('/') && !corrected.startsWith(process.cwd())) {
            return path.resolve(process.cwd(), corrected.slice(1));
          }
          return path.resolve(process.cwd(), corrected);
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
        '@': path.resolve('.'),
        '/src': path.resolve(srcFolder),
        'src': path.resolve(srcFolder),
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
