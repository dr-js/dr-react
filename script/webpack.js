import { resolve } from 'path'

import { compileWithWebpack, commonFlag } from '@dr-js/dev/module/webpack'
import { getWebpackBabelConfig } from '@dr-js/dev/module/babel'
import { runMain } from '@dr-js/dev/module/main'

const PATH_ROOT = resolve(__dirname, '..')
const fromRoot = (...args) => resolve(PATH_ROOT, ...args)

runMain(async (logger) => {
  const { mode, isWatch, isProduction, profileOutput, getCommonWebpackConfig } = await commonFlag({ fromRoot, logger })

  const config = getCommonWebpackConfig({
    babelOption: getWebpackBabelConfig({
      isProduction,
      extraPresetList: [ [ '@babel/react', { runtime: 'automatic' } ] ], // TODO: later remove at `babel@8`: https://reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html#manual-babel-setup
      extraPluginList: [ [ 'styled-components' ] ]
    }),
    output: { path: fromRoot('example/source-gitignore/'), filename: '[name].js', library: 'DrReact', libraryTarget: 'umd' },
    entry: { 'index': 'source/.example.test/index.webpack-entry' } // TODO: currently output example, not library
  })

  logger.padLog(`compile with webpack mode: ${mode}, isWatch: ${Boolean(isWatch)}`)
  await compileWithWebpack({ config, isWatch, profileOutput, logger })
}, 'webpack')
