import { transformCache as transformCacheDefault } from 'dr-js/module/common/immutable/function'
import { withDelayArgvQueue } from 'dr-js/module/common/function'
import { throttleByAnimationFrame } from 'dr-js/module/browser/DOM'

const transformCache = __DEV__
  ? require('dr-dev/module/common/dev').createTransformCacheWithInfo() // more info on cache hit/miss
  : transformCacheDefault

const delayArgvQueue = (func) => withDelayArgvQueue(func, throttleByAnimationFrame)

export {
  transformCache,
  delayArgvQueue
}
