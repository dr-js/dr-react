const BABEL_ENV = process.env.BABEL_ENV || ''
const isDev = BABEL_ENV.includes('dev')
const isModule = BABEL_ENV.includes('module')

module.exports = {
  presets: [
    [ '@babel/env', { targets: { node: '8.8' }, modules: isModule ? false : 'commonjs' } ],
    [ '@babel/react' ]
  ],
  plugins: [
    [ 'babel-plugin-styled-components' ],
    [ '@babel/proposal-class-properties' ],
    !isModule && [ '@babel/plugin-proposal-object-rest-spread', { loose: true, useBuiltIns: true } ], // NOTE: for Edge(17.17134) support check: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax#Spread_in_object_literals
    [ 'minify-replace', { replacements: [ { identifierName: '__DEV__', replacement: { type: 'booleanLiteral', value: isDev } } ] } ],
    [ 'module-resolver', {
      root: [ './' ],
      alias: isModule ? undefined : {
        '^dr-dev/module/(.+)': 'dr-dev/library/\\1',
        '^dr-js/module/(.+)': 'dr-js/library/\\1'
      }
    } ]
  ].filter(Boolean),
  comments: false
}
