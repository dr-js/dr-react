import { objectMerge, objectSet } from 'dr-js/module/common/immutable/ImmutableOperation'
import { getRotateDelta, sub, scale } from 'dr-js/module/common/geometry/D2/vector'
import { getCenter } from 'dr-js/module/common/geometry/D2/boundingRect'

import { HANDLE_TYPE } from 'source/widget/type/handle'
import { toClientSpacePoint } from 'source/widget/math/base'

const calcRotateDelta = (zoom, elementWidgetLayer, selectBoundingRect, pointStart, point) => {
  const clientCenter = toClientSpacePoint(getCenter(selectBoundingRect), elementWidgetLayer.getBoundingClientRect(), zoom)
  return getRotateDelta(clientCenter, pointStart, point)
}

const calcHandleData = (state, editorState, elementRefData, eventState, handleType) => {
  const { externalData: { zoom }, selectData: { selectBoundingRect } } = editorState
  const { elementWidgetLayer } = elementRefData
  const { pointStart, point } = eventState
  const isRotateHandle = handleType === HANDLE_TYPE.ROTATE
  return objectMerge(state, {
    handleType,
    pointDelta: handleType && !isRotateHandle
      ? scale(sub(point, pointStart), 1 / zoom)
      : null,
    rotateDelta: handleType && isRotateHandle
      ? calcRotateDelta(zoom, elementWidgetLayer, selectBoundingRect, pointStart, point)
      : null
  })
}

const updateHandleData = (editorState, state) => objectSet(editorState, 'handleData', state)

const initialState = {
  handleType: null,
  pointDelta: null,
  rotateDelta: null
}

const reducerMap = {
  'reducer:handle-data:reset': (editorState) => updateHandleData(editorState, initialState),
  'reducer:handle-data:update-pointer-event': (editorState, { elementRefData, eventState, handleType }) => {
    let state = editorState.handleData
    state = calcHandleData(state, editorState, elementRefData, eventState, handleType)
    return updateHandleData(editorState, objectMerge(editorState.handleData, state))
  }
}

export { initialState, reducerMap }
