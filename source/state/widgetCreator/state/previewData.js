import { objectSet } from 'dr-js/module/common/immutable/ImmutableOperation'
import { fromPoint as widgetFromPoint, fromLine as widgetFromLine } from 'dr-js/module/common/geometry/D2/widget'

import { WIDGET_SHAPE_TYPE } from 'source/widget/type/shape'
import { toEditorSpacePoint } from 'source/widget/math/base'
import { fromPoint as widgetElbowFromPoint } from 'source/widget/math/elbow'
import { WIDGET_SAMPLE_MAP } from 'source/widget/data/sample'

const calcWidgetFromDataAndPoint = (data, pointFrom, pointTo) => {
  switch (data.shape) {
    case WIDGET_SHAPE_TYPE.RECT:
      return widgetFromPoint(pointFrom, pointTo, data)
    case WIDGET_SHAPE_TYPE.LINE:
      return widgetFromLine({ begin: pointFrom, end: pointTo }, data.size.x, data)
    case WIDGET_SHAPE_TYPE.ELBOW:
      return widgetElbowFromPoint(pointFrom, pointTo, data)
  }
  throw new Error(`[calcWidgetFromDataAndPoint] invalid data.shape: ${data.shape}`)
}

const isPointInViewport = ({ x, y }, { left, top, width, height }) =>
  x >= left && x <= (left + width) &&
  y >= top && y <= (top + height)

const updatePreviewData = (editorState, state) => objectSet(editorState, 'previewData', state)

const initialState = {
  previewWidget: null,
  isValidPlace: false
}

const reducerMap = {
  'reducer:preview-data:reset': (creatorState) => updatePreviewData(creatorState, initialState),
  'reducer:preview-data:update-place': (creatorState, { eventState: { point }, getWidgetLayerBoundingClientRect }) => {
    const {
      externalData: { zoom, viewport },
      selectData: { selectSampleShape }
    } = creatorState

    if (__DEV__ && !selectSampleShape) throw new Error('[reducer:preview-data:update-place] selectSampleShape expected')

    const center = toEditorSpacePoint(point, getWidgetLayerBoundingClientRect(), zoom)
    const previewWidget = { ...WIDGET_SAMPLE_MAP[ selectSampleShape ], center }

    let state = creatorState.previewData
    state = objectSet(state, 'previewWidget', previewWidget)
    state = objectSet(state, 'isValidPlace', isPointInViewport(point, viewport))
    return updatePreviewData(creatorState, state)
  },
  'reducer:preview-data:update-draw': (creatorState, { eventState: { pointStart, point }, getWidgetLayerBoundingClientRect }) => {
    const {
      externalData: { zoom },
      selectData: { selectSampleShape }
    } = creatorState

    if (__DEV__ && !selectSampleShape) throw new Error('[reducer:preview-data:update-draw] selectSampleShape expected')

    const pointFrom = toEditorSpacePoint(pointStart, getWidgetLayerBoundingClientRect(), zoom)
    const pointTo = toEditorSpacePoint(point, getWidgetLayerBoundingClientRect(), zoom)
    const previewWidget = calcWidgetFromDataAndPoint(WIDGET_SAMPLE_MAP[ selectSampleShape ], pointFrom, pointTo)

    let state = creatorState.previewData
    state = objectSet(state, 'previewWidget', previewWidget)
    state = objectSet(state, 'isValidPlace', true)
    return updatePreviewData(creatorState, state)
  }
}

export { initialState, reducerMap }
