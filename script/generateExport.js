import { resolve, relative, sep } from 'path'
import { writeFileSync } from 'fs'

import { runMain } from 'dev-dep-tool/library/__utils__'
import { getLogger } from 'dev-dep-tool/library/logger'
import { createExportParser } from 'dev-dep-tool/library/ExportIndex/parseExport'
import { EXPORT_LIST_KEY, generateExportInfo } from 'dev-dep-tool/library/ExportIndex/generateInfo'

import { getDirectoryContent, walkDirectoryContent } from 'dr-js/module/node/file/Directory'

const PATH_ROOT = resolve(__dirname, '..')
const fromRoot = (...args) => resolve(PATH_ROOT, ...args)

const BABYLON_PLUGIN_LIST = [
  'objectRestSpread',
  'classProperties',
  'exportDefaultFrom',
  'exportNamespaceFrom',
  'jsx'
]

const collectSourceRouteMap = async ({ logger }) => {
  const { parseExport, getSourceRouteMap } = createExportParser({ babylonPluginList: BABYLON_PLUGIN_LIST, logger })
  await walkDirectoryContent(await getDirectoryContent(fromRoot('source')), (path, name) => name !== 'index.example.js' && parseExport(resolve(path, name)))
  return getSourceRouteMap()
}

const renderExportPath = (exportInfoMap) => Object.entries(exportInfoMap).reduce((textList, [ path, value ]) => {
  path = relative(PATH_ROOT, path).split(sep).join('/')
  value[ EXPORT_LIST_KEY ] && textList.push(
    `+ 📄 [${path.replace(/_/g, '\\_')}.js](${path}.js)`,
    `  - ${value[ EXPORT_LIST_KEY ].map((text) => `\`${text}\``).join(', ')}`
  )
  return textList
}, [])

runMain(async (logger) => {
  logger.log(`collect sourceRouteMap`)
  const sourceRouteMap = await collectSourceRouteMap({ logger })

  logger.log(`generate exportInfo`)
  const exportInfoMap = generateExportInfo({ sourceRouteMap })

  logger.log(`output: EXPORT_INFO.md`)
  writeFileSync(fromRoot('EXPORT_INFO.md'), [
    '# Export Info',
    '',
    '#### Export Path',
    ...renderExportPath(exportInfoMap)
  ].join('\n'))
}, getLogger('generate-export'))
