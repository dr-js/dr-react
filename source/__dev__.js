import { immutableTransformCache, createImmutableTransformCacheWithInfo } from 'dr-js/module/common/immutable/__utils__'

const devImmutableTransformCache = __DEV__
  ? createImmutableTransformCacheWithInfo()
  : immutableTransformCache

export {
  devImmutableTransformCache as immutableTransformCache
}