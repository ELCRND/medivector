export default {
  plugins: {
    // Автопрефиксер для кроссбраузерности
    autoprefixer: {
      overrideBrowserslist: ["last 2 versions", "> 1%", "IE 11"],
    },

    // Минификация CSS
    cssnano: process.env.NODE_ENV === "production" ? {} : false,

    // Современные CSS-функции для старых браузеров
    "postcss-preset-env": {
      stage: 3,
      features: {
        "nesting-rules": true,
        "custom-properties": {
          preserve: false,
        },
      },
    },
  },
};
