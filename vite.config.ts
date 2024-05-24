import { defineConfig, Plugin, ConfigEnv } from 'vite';
import react from '@vitejs/plugin-react';

import { wasm } from '@rollup/plugin-wasm';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import path from 'path';
import fs from 'fs';
import { svgLoader } from './viteSvgLoader';
import buildConfig from './build.config';

const copyFiles = {
  targets: [
    {
      src: 'node_modules/@matrix-org/olm/olm.wasm',
      dest: '',
    },
    {
      src: 'node_modules/pdfjs-dist/build/pdf.worker.min.js',
      dest: '',
    },
    {
      src: 'netlify.toml',
      dest: '',
    },
    {
      src: 'config.json',
      dest: '',
    },
    {
      src: 'public/manifest.json',
      dest: '',
    },
    {
      src: 'public/res/android',
      dest: 'public/',
    },
  ],
};

const particleWasmPlugin: Plugin | undefined = {
  name: 'particle-wasm',
  apply: (_, env: ConfigEnv) => env.mode === 'development',
  buildStart: () => {
    const copiedPath = path.join(
      __dirname,
      'node_modules/@particle-network/thresh-sig/wasm/thresh_sig_wasm_bg.wasm'
    );
    const dir = path.join(__dirname, 'node_modules/.vite/wasm');
    const resultPath = path.join(dir, 'thresh_sig_wasm_bg.wasm');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.copyFileSync(copiedPath, resultPath);
  },
};

export default defineConfig({
  appType: 'spa',
  define: {
    'process.env': process.env,
  },
  publicDir: false,
  base: buildConfig.base,
  server: {
    port: 8080,
    host: true,
  },
  resolve: {
    alias: {
      http: 'stream-http',
      https: 'https-browserify',
      stream: 'stream-browserify',
      zlib: 'browserify-zlib',
      url: 'url',
      assert: 'assert',
    },
  },
  plugins: [
    viteStaticCopy(copyFiles),
    vanillaExtractPlugin(),
    svgLoader(),
    wasm(),
    react(),
    particleWasmPlugin,
  ],
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
      // plugins: [
      //   NodeGlobalsPolyfillPlugin({
      //     process: false,
      //     buffer: true,
      //   }),
      // ]
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    copyPublicDir: false,
    // rollupOptions: {
    //   plugins: [
    //     inject({ Buffer: ['buffer', 'Buffer'] })
    //   ]
    // }
  },
});
