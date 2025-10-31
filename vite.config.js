import { defineConfig } from "vite";
import { resolve } from "path";

// npm install -D sass autoprefixer postcss postcss-preset-env cssnano

export default defineConfig({
  // Базовый путь для продакшена
  base: "./",

  // Настройки сервера разработки
  server: {
    port: 3000,
    open: true, // Автоматически открывать браузер
  },

  // Сборка
  build: {
    // Выходная директория
    outDir: "dist",

    // Оптимизация chunk'ов
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        // Добавьте другие HTML-страницы если нужно
        // about: resolve(__dirname, 'about.html'),
      },
      output: {
        // Имена файлов без хешей для простоты
        entryFileNames: "assets/[name].js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split(".");
          const ext = info[info.length - 1];

          if (/\.(css|scss)$/.test(assetInfo.name)) {
            return "assets/[name].[ext]";
          }

          if (/\.(gif|jpe?g|png|svg|webp|avif)$/.test(assetInfo.name)) {
            return "assets/images/[name].[ext]";
          }

          if (/\.(woff2?|eot|ttf|otf)$/.test(assetInfo.name)) {
            return "assets/fonts/[name].[ext]";
          }

          return "assets/[name].[ext]";
        },
      },
    },

    // Минификация
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true, // Удалить console.log в продакшене
      },
    },

    // Оптимизация исходных карт
    sourcemap: true,
  },

  // Плагины
  plugins: [
    // Vite автоматически обрабатывает SCSS через встроенные возможности
  ],

  // CSS препроцессинг
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
        //   @use "sass:math";
        //   @import "./src/styles/variables.scss";
        //   @import "./src/styles/mixins.scss";
        `,
        charset: false,
      },
    },
    postcss: "./postcss.config.js",
  },

  // Оптимизация зависимостей
  optimizeDeps: {
    include: [], // Добавьте библиотеки если используются
  },
});
