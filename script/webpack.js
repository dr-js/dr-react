import { resolve } from 'path'

import { runMain } from '@dr-js/dev/module/main'
import { compileWithWebpack, commonFlag } from '@dr-js/dev/module/webpack'
import { getWebpackBabelConfig } from '@dr-js/dev/module/babel'

const PATH_ROOT = resolve(__dirname, '..')
const fromRoot = (...args) => resolve(PATH_ROOT, ...args)

runMain(async (logger) => {
  const { mode, isWatch, isProduction, profileOutput, getCommonWebpackConfig } = await commonFlag({ fromRoot, logger })

  const config = getCommonWebpackConfig({
    babelOption: getWebpackBabelConfig({
      isProduction,
      extraPresetList: [ [ '@babel/react' ] ],
      extraPluginList: [ [ 'babel-plugin-styled-components' ] ]
    }),
    output: { path: fromRoot('example/source-gitignore/'), filename: '[name].js', library: 'DrReact', libraryTarget: 'umd' },
    entry: { 'index': 'source/index.example' } // TODO: currently output example, not library
  })

  logger.padLog(`compile with webpack mode: ${mode}, isWatch: ${Boolean(isWatch)}`)
  await compileWithWebpack({ config, isWatch, profileOutput, logger })
}, 'webpack')
