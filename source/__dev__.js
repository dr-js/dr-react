import { transformCache, createTransformCacheWithInfo } from 'dr-js/module/common/immutable/function'
import { withDelayArgvQueue } from 'dr-js/module/common/function'
import { throttleByAnimationFrame } from 'dr-js/module/browser/DOM'

const devImmutableTransformCache = __DEV__
  ? createTransformCacheWithInfo()
  : transformCache

const delayArgvQueueByAnimationFrame = (func) => withDelayArgvQueue(func, throttleByAnimationFrame)

export {
  devImmutableTransformCache as transformCache,
  delayArgvQueueByAnimationFrame
}
