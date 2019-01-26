import { createTransformCacheWithInfo } from 'dr-dev/module/common/dev'

import { transformCache as transformCacheDefault } from 'dr-js/module/common/immutable/function'
import { withDelayArgvQueue } from 'dr-js/module/common/function'
import { throttleByAnimationFrame } from 'dr-js/module/browser/DOM'

const transformCache = __DEV__
  ? createTransformCacheWithInfo() // more info on cache hit/miss
  : transformCacheDefault

const delayArgvQueue = (func) => withDelayArgvQueue(func, throttleByAnimationFrame)

export {
  transformCache,
  delayArgvQueue
}
