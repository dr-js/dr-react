import { objectSet } from 'dr-js/module/common/immutable/Object'
import { getElementAtViewport } from 'dr-js/module/browser/DOM'

import { findKeyInMap } from 'source/__utils__/data'
import { HOVER_ENABLED_HANDLE_TYPE_SET } from 'source/widget/type/hover'

const calcHoverWidgetId = (state, editorState, elementRefData, eventState) => {
  const {
    selectData: { selectIdList },
    handleData: { handleType }
  } = editorState
  const { elementWidgetMap, elementIndicatorLayer } = elementRefData

  if (!HOVER_ENABLED_HANDLE_TYPE_SET.has(handleType)) return null // limit hover detect handle

  const possibleWidgetElement = getElementAtViewport(eventState.point, [ elementIndicatorLayer, ...selectIdList.map((id) => elementWidgetMap[ id ]) ])
  return possibleWidgetElement
    ? findKeyInMap(elementWidgetMap, ([ , element ]) => element.contains(possibleWidgetElement))
    : null
}

const updateHoverData = (editorState, state) => objectSet(editorState, 'hoverData', state)

const initialState = {
  hoverTargetType: null,
  hoverWidgetId: null
}

const reducerMap = {
  'reducer:hover-data:reset': (editorState) => updateHoverData(editorState, initialState),
  'reducer:hover-data:update-pointer-event': (editorState, { elementRefData, eventState, hoverTargetType }) => {
    let state = editorState.hoverData
    state = objectSet(state, 'hoverTargetType', hoverTargetType)
    state = objectSet(state, 'hoverWidgetId', calcHoverWidgetId(state, editorState, elementRefData, eventState))

    return updateHoverData(editorState, state)
  }
}

export { initialState, reducerMap }
