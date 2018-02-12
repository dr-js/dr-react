import { objectMerge, objectSet } from 'dr-js/module/common/immutable/ImmutableOperation'

import { initialState as initialStateSelectData, reducerMap as reducerMapSelectData } from './selectData'
import { initialState as initialStateHoverData, reducerMap as reducerMapHoverData } from './hoverData'
import { initialState as initialStateHandleData, reducerMap as reducerMapHandleData } from './handleData'
import { initialState as initialStateSnapData, reducerMap as reducerMapSnapData } from './snapData'
import { initialState as initialStatePreviewData, reducerMap as reducerMapPreviewData } from './previewData'

const initialStateExternalData = {
  isPause: false,
  isLock: false,

  widgetList: [],
  lockWidgetId: null, // TODO: check better name or usage

  zoom: 1,
  centerOffset: { x: 0, y: 0 }, // offset to point (0, 0), no zoom applied
  viewport: { left: 0, top: 0, width: 0, height: 0 } // from boundingClientRect
}

const initialStateProcessData = {
  selectData: initialStateSelectData,
  hoverData: initialStateHoverData,
  handleData: initialStateHandleData,
  snapData: initialStateSnapData,
  previewData: initialStatePreviewData
}

const initialState = {
  ...initialStateProcessData,

  externalData: initialStateExternalData
}

const reducerMap = {
  ...reducerMapSelectData,
  ...reducerMapHoverData,
  ...reducerMapHandleData,
  ...reducerMapSnapData,
  ...reducerMapPreviewData,

  'reducer:reset': (state) => objectMerge(state, initialState),
  'reducer:reset:process-data': (state) => objectMerge(state, initialStateProcessData),
  'reducer:set:external-data': (state, value) => objectSet(state, 'externalData', objectMerge(state.externalData, value))
}

export { initialState, reducerMap }
