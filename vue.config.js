module.exports = {
  // 修改的配置
  baseUrl: '/',
  configureWebpack: {
    resolve: {
      alias: {
        'src': '@/api',
        'components': '@/components',
        'views': '@/views',
      }
    }
  },
  devServer: {
    proxy: {
      '/api/*': {
        target: 'http://127.0.0.1:2333',
        changeOrigin: true
      }
    }
  }
}