import { resolve as resolvePath } from 'path'
import { loadFlag, checkFlag, runMain } from 'dev-dep-tool/library/__utils__'
import { compileWithWebpack } from 'dev-dep-tool/library/webpack'
import { getLogger } from 'dev-dep-tool/library/logger'
import webpack from 'webpack'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import CSSNextPlugin from 'postcss-cssnext'

const PATH_ROOT = resolvePath(__dirname, '..')
const fromRoot = (...args) => resolvePath(PATH_ROOT, ...args)

runMain(async (logger) => {
  const MODE = checkFlag(loadFlag([ 'development', 'production' ]), [ 'development', 'production' ], 'production')

  logger.padLog(`compile with webpack mode: ${MODE}`)

  const IS_PRODUCTION = MODE === 'production'

  const OPTIONS = {
    BABEL_LOADER: {
      babelrc: false,
      cacheDirectory: IS_PRODUCTION,
      presets: [ [ '@babel/env', { targets: { node: 8 }, modules: false } ], [ '@babel/react' ] ],
      plugins: [ [ 'babel-plugin-styled-components' ], [ '@babel/proposal-class-properties' ], [ '@babel/proposal-object-rest-spread', { useBuiltIns: true } ] ]
    },
    CSS_LOADER: { importLoaders: 1, localIdentName: MODE ? '[hash:base64:12]' : '[name]_[local]_[hash:base64:5]' },
    POSTCSS_LOADER: { plugins: () => [ CSSNextPlugin ] }
  }

  const config = {
    mode: MODE,
    output: { path: fromRoot('example/source-gitignore/'), filename: '[name].js', library: 'DR_REACT', libraryTarget: 'umd' },
    entry: { 'index': 'source/index.example' },
    resolve: { alias: { source: fromRoot('source') } },
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
      new webpack.DefinePlugin({ 'process.env.NODE_ENV': JSON.stringify(MODE), '__DEV__': !IS_PRODUCTION })
    ]
  }

  await compileWithWebpack({ config, isWatch: !IS_PRODUCTION, logger })
}, getLogger(`webpack`))
