const { resolve } = require('path')
const { DefinePlugin, BannerPlugin, optimize: { ModuleConcatenationPlugin } } = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const CSSNextPlugin = require('postcss-cssnext')

const { NODE_ENV = 'production' } = process.env
const IS_PRODUCTION = NODE_ENV === 'production'

const OPTIONS = {
  BABEL_LOADER: {
    babelrc: false,
    cacheDirectory: IS_PRODUCTION,
    presets: [ [ 'env', { targets: { node: 8 }, modules: false } ], [ 'react' ] ],
    plugins: [ [ 'transform-class-properties' ], [ 'transform-object-rest-spread', { useBuiltIns: true } ] ]
  },
  CSS_LOADER: { importLoaders: 1, localIdentName: IS_PRODUCTION ? '[hash:base64:12]' : '[name]_[local]_[hash:base64:5]' },
  POSTCSS_LOADER: { plugins: () => [ CSSNextPlugin ] }
}

module.exports = {
  output: {
    path: resolve(__dirname, './example/source-gitignore/'),
    filename: '[name].js',
    library: 'DR_REACT',
    libraryTarget: 'umd'
  },
  entry: { 'index': 'source/index.example' },
  resolve: { alias: { source: resolve(__dirname, './source/') } },
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, use: [ { loader: 'babel-loader', options: OPTIONS.BABEL_LOADER } ] },
      { test: /\.css$/, use: ExtractTextPlugin.extract({ use: [ { loader: 'css-loader' } ] }) },
      {
        test: /\.pcss$/,
        use: ExtractTextPlugin.extract({
          use: [
            { loader: 'css-loader', options: OPTIONS.CSS_LOADER },
            { loader: 'postcss-loader', options: OPTIONS.POSTCSS_LOADER }
          ]
        })
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin('index.css'),
    new DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
      '__DEV__': !IS_PRODUCTION
    }),
    ...(IS_PRODUCTION ? [
      new ModuleConcatenationPlugin(),
      new BannerPlugin({ banner: '/* eslint-disable */', raw: true, test: /\.js$/, entryOnly: false }),
      new BannerPlugin({ banner: '/* stylelint-disable */', raw: true, test: /\.css$/, entryOnly: false })
    ] : [])
  ]
}
