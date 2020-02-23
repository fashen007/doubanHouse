module.exports = {
  // 修改的配置
  publicPath: '/',
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
    host: '127.0.0.1',
    port: 9089,
    proxy: {
      '/api/*': {
        target: 'http://127.0.0.1:2333',
        changeOrigin: true
      }
    }
  }
}