const getReplaceDEV = (value) => ({ replacements: [ { identifierName: '__DEV__', replacement: { type: 'booleanLiteral', value } } ] })

module.exports = {
  env: {
    dev: { // __DEV__ = true, use require()
      presets: [ [ '@babel/env', { targets: { node: 8 } } ], [ '@babel/react' ] ],
      plugins: [
        [ 'babel-plugin-styled-components' ],
        [ '@babel/proposal-class-properties' ],
        [ '@babel/proposal-object-rest-spread', { useBuiltIns: true } ],
        [ 'module-resolver', { root: [ './' ], alias: { 'dr-js/module/(.+)': 'dr-js/library/' } } ],
        [ 'minify-replace', getReplaceDEV(true) ]
      ]
    },
    library: { // __DEV__ = false, use require(), simplify
      presets: [ [ '@babel/env', { targets: { node: 8 } } ], [ '@babel/react' ] ],
      plugins: [
        [ 'babel-plugin-styled-components' ],
        [ '@babel/proposal-class-properties' ],
        [ '@babel/proposal-object-rest-spread', { useBuiltIns: true } ],
        [ 'module-resolver', { root: [ './' ], alias: { 'dr-js/module/(.+)': 'dr-js/library/' } } ],
        [ 'minify-replace', getReplaceDEV(false) ],
        [ 'minify-guarded-expressions' ],
        [ 'minify-dead-code-elimination' ]
      ],
      comments: false
    }
  }
}
