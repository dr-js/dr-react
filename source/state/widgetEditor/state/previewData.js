import { objectSet } from '@dr-js/core/module/common/immutable/Object'
import { add } from '@dr-js/core/module/common/geometry/D2/Vector'
import { fromWidget } from '@dr-js/core/module/common/geometry/D2/BoundingRect'
import { fromBoundingRect } from '@dr-js/core/module/common/geometry/D2/Widget'

import { WIDGET_SHAPE_TYPE } from 'source/state/widget/type/shape'
import { calcWidgetResizeHandleDelta, calcWidgetBindShift } from 'source/state/widget/math/calc'
import { deleteBindByHandleType, addBindByHoverTarget } from 'source/state/widget/math/bind'

const calcPreviewWidgetDataMap = (editorState, elementRefData, eventState, resizeHandleData) => {
  const {
    externalData: { widgetList },
    selectData: { selectIdList, bindSelectIdList },
    hoverData: { hoverTargetType, hoverWidgetId },
    handleData: { handleType }
  } = editorState
  const { elementWidgetMap } = elementRefData

  const previewWidgetDataMap = widgetList.reduce((o, widget) => {
    const isSelect = selectIdList.includes(widget.id)
    const isBindSelect = bindSelectIdList.includes(widget.id)

    let previewWidget = isSelect
      ? calcWidgetResizeHandleDelta(widget, resizeHandleData)
      : widget

    if (isSelect) { // calc bindData
      let { bindData } = previewWidget
      bindData = deleteBindByHandleType(bindData, selectIdList, handleType)
      bindData = addBindByHoverTarget(bindData, widgetList, elementWidgetMap, hoverTargetType, hoverWidgetId, handleType, eventState)
      previewWidget = objectSet(previewWidget, 'bindData', bindData)
    }

    o[ widget.id ] = { isSelect, isBindSelect, previewWidget }
    return o
  }, {})

  // NOTE:
  //  - mutate previewWidgetDataMap directly
  //  - this is a one level only bind shift calc
  //  - this assumes all bind target do not have bindData, so their previewData can be used as final destination
  widgetList.forEach(({ id }) => {
    const { previewWidget } = previewWidgetDataMap[ id ]
    if (previewWidget.bindData && bindSelectIdList.includes(previewWidget.id)) previewWidgetDataMap[ id ].previewWidget = calcWidgetBindShift(previewWidget, previewWidgetDataMap)
  })

  return previewWidgetDataMap
}

const WIDGET_RECT_DATA = { shape: WIDGET_SHAPE_TYPE.RECT }
const reducerPreviewBoundingRect = (state, editorState, resizeHandleData) => {
  const { selectData: { selectBoundingRect } } = editorState
  const nextPreviewBoundingRect = selectBoundingRect
    ? fromWidget(calcWidgetResizeHandleDelta(fromBoundingRect(selectBoundingRect, WIDGET_RECT_DATA), resizeHandleData))
    : null

  return objectSet(state, 'previewBoundingRect', nextPreviewBoundingRect)
}

const updatePreviewData = (editorState, state) => objectSet(editorState, 'previewData', state)

const initialState = {
  previewWidgetDataMap: {},
  previewBoundingRect: null // form selectBoundingRect, handleData, snapData
}

const reducerMap = {
  'reducer:preview-data:reset': (editorState) => updatePreviewData(editorState, initialState),
  'reducer:preview-data:reset:preview-widget-data': (editorState) => updatePreviewData(editorState, objectSet(editorState.previewData, 'previewWidgetDataMap', {})),
  'reducer:preview-data:update-handle': (editorState, { elementRefData, eventState }) => {
    const { handleData, snapData: { snapPointDelta } } = editorState
    const resizeHandleData = snapPointDelta
      ? { ...handleData, pointDelta: add(handleData.pointDelta, snapPointDelta) }
      : handleData

    let state = editorState.previewData
    state = objectSet(state, 'previewWidgetDataMap', calcPreviewWidgetDataMap(editorState, elementRefData, eventState, resizeHandleData))
    state = reducerPreviewBoundingRect(state, editorState, resizeHandleData)
    return updatePreviewData(editorState, state)
  },
  'reducer:preview-data:update-bound': (editorState) => {
    const { handleData, snapData: { snapPointDelta } } = editorState
    const resizeHandleData = snapPointDelta
      ? { ...handleData, pointDelta: add(handleData.pointDelta, snapPointDelta) }
      : handleData

    let state = editorState.previewData
    state = reducerPreviewBoundingRect(state, editorState, resizeHandleData)
    return updatePreviewData(editorState, state)
  }
}

export { initialState, reducerMap }
