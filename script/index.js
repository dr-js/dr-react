import { resolve } from 'path'
import { execSync } from 'child_process'

import { argvFlag, runMain } from 'dev-dep-tool/module/main'
import { getLogger } from 'dev-dep-tool/module/logger'
import { getScriptFileListFromPathList } from 'dev-dep-tool/module/fileList'
import { initOutput, packOutput, publishOutput } from 'dev-dep-tool/module/commonOutput'
import { processFileList, fileProcessorBabel } from 'dev-dep-tool/module/fileProcessor'
import { getTerserOption, minifyFileListWithTerser } from 'dev-dep-tool/module/minify'

import { binary as formatBinary } from 'dr-js/module/common/format'

const PATH_ROOT = resolve(__dirname, '..')
const PATH_OUTPUT = resolve(__dirname, '../output-gitignore')
const fromRoot = (...args) => resolve(PATH_ROOT, ...args)
const fromOutput = (...args) => resolve(PATH_OUTPUT, ...args)
const execOptionRoot = { cwd: fromRoot(), stdio: argvFlag('quiet') ? [ 'ignore', 'ignore', 'inherit' ] : 'inherit', shell: true }

const buildOutput = async ({ logger: { padLog } }) => {
  padLog('generate export info')
  execSync(`npm run script-generate-spec`, execOptionRoot)

  padLog(`build module`)
  execSync('npm run build-module', execOptionRoot)
}

const processOutput = async ({ packageJSON, logger }) => {
  const fileList = await getScriptFileListFromPathList([ 'module' ], fromOutput)
  let sizeReduce = 0
  sizeReduce += await minifyFileListWithTerser({ fileList, option: getTerserOption({ isModule: true }), rootPath: PATH_OUTPUT, logger })
  sizeReduce += await processFileList({ fileList, processor: fileProcessorBabel, rootPath: PATH_OUTPUT, logger })
  logger.padLog(`module size reduce: ${formatBinary(sizeReduce)}B`)
}

runMain(async (logger) => {
  const packageJSON = await initOutput({ fromRoot, fromOutput, logger })
  if (!argvFlag('pack')) return

  await buildOutput({ logger })
  await processOutput({ packageJSON, logger })

  const pathPackagePack = await packOutput({ fromRoot, fromOutput, logger })
  await publishOutput({ flagList: process.argv, packageJSON, pathPackagePack, logger })
}, getLogger(process.argv.slice(2).join('+'), argvFlag('quiet')))
