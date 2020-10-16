module.exports = {
  configureWebpack: {
    output: {
      filename: '[name].js',
      chunkFilename: '[name].js'
    }
  },
  chainWebpack: config => {
    if (process.env.NODE_ENV === 'production') {
      config
        .plugin('extract-css')
        .tap((args) => {
          // Flatten .css output: ./css/*.css -> ./*.css
          args[0].filename = '[name].[contenthash:8].css';
          args[0].chunkFilename = '[name].[contenthash:8].css';
          return args;
        })
        .end()
        .module
        .rule('images')
        .use('url-loader')
        .tap((args) => {
          // Flatten bitmap img output: ./img/* -> ./*
          args.fallback.options.name = '[name].[hash:8].[ext]';
          return args;
        })
        .end()
        .end()
        .rule('svg')
        .use('file-loader')
        .tap((args) => {
          // Flatten svg output: ./img/* -> ./*
          args.name = '[name].[hash:8].[ext]';
          return args;
        })
        .end()
        .end()
        .rule('media')
        .use('url-loader')
        .tap((args) => {
          // Flatten AV output: ./media/* -> ./*
          args.fallback.options.name = '[name].[hash:8].[ext]';
          return args;
        })
        .end()
        .end()
        .rule('fonts')
        .use('url-loader')
        .tap((args) => {
          // Flatten fonts output: ./fonts/* -> ./*
          args.fallback.options.name = '[name].[hash:8].[ext]';
          return args;
        })
        .end()
        .end()
        .end();
    }
  },
  devServer: {
    stats: 'errors-only',
    overlay: {
      warnings: false,
      errors: true
    },
    hot: false,
    liveReload: false,
    https: true
  },
  publicPath: './',
  lintOnSave: false
}
