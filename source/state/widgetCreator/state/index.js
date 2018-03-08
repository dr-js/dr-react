import { objectMerge, objectSet } from 'dr-js/module/common/immutable/Object'

import { initialState as initialStateSelectData, reducerMap as reducerMapSelectData } from './selectData'
import { initialState as initialStatePreviewData, reducerMap as reducerMapPreviewData } from './previewData'

const initialStateExternalData = {
  isPause: false,
  isLock: false,

  zoom: 1,
  centerOffset: { x: 0, y: 0 }, // offset to point (0, 0), no zoom applied
  viewport: { left: 0, top: 0, width: 0, height: 0 } // from boundingClientRect
}

const initialStateProcessData = {
  selectData: initialStateSelectData,
  previewData: initialStatePreviewData
}

const initialState = {
  ...initialStateProcessData,

  externalData: initialStateExternalData
}

const reducerMap = {
  ...reducerMapSelectData,
  ...reducerMapPreviewData,

  'reducer:reset': (state) => objectMerge(state, initialState),
  'reducer:reset:process-data': (state) => objectMerge(state, initialStateProcessData),
  'reducer:set:external-data': (state, value) => objectSet(state, 'externalData', objectMerge(state.externalData, value))
}

export { initialState, reducerMap }
