import { transformCache as transformCacheDefault } from '@dr-js/core/module/common/immutable/function'
import { withDelayArgvQueue } from '@dr-js/core/module/common/function'
import { throttleByAnimationFrame } from '@dr-js/core/module/browser/DOM'

const transformCache = __DEV__
  ? require('@dr-js/dev/module/common/dev').createTransformCacheWithInfo() // more info on cache hit/miss
  : transformCacheDefault

const delayArgvQueue = (func) => withDelayArgvQueue(func, throttleByAnimationFrame)

export {
  transformCache,
  delayArgvQueue
}
