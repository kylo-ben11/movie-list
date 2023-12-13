const { defineConfig } = require('@vue/cli-service');
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: process.env.NODE_ENV === 'production' ? '/movie-list/' : '/',
  css: {
    loaderOptions: {
      sass: {
        additionalData: `@import "@/css/_styles.scss";`,
      },
    },
  },
});
