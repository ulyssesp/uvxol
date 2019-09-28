module.exports = {
  lintOnSave: 'error',
  chainWebpack: config => {
    config.plugins.delete('friendly-errors')
  }
}
