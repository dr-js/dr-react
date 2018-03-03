import { objectMerge, objectSet, arrayPush, arrayDelete, arrayMatchPush, arrayMatchDelete } from 'dr-js/module/common/immutable/ImmutableOperation'
import { fromPoint, fromWidgetList, isIntersect } from 'dr-js/module/common/geometry/D2/BoundingRect'

import { immutableTransformCache } from 'source/__dev__'
import { SELECT_MODE_TYPE } from 'source/state/event'

const reducerSelectIdList = (state, editorState, getIsSelect) => {
  const { externalData: { widgetList } } = editorState
  let nextSelectIdList = state.selectIdList
  widgetList.forEach(({ id }) => {
    const index = nextSelectIdList.indexOf(id)
    const isPrevSelect = Boolean(~index)
    const isSelect = Boolean(getIsSelect(id, isPrevSelect))
    if (isPrevSelect === isSelect) return
    nextSelectIdList = isSelect
      ? arrayPush(nextSelectIdList, id)
      : arrayDelete(nextSelectIdList, index)
  })
  return objectSet(state, 'selectIdList', nextSelectIdList)
}

const reducerBindSelectIdList = (state, editorState) => {
  const { externalData: { widgetList } } = editorState
  let nextBindSelectIdList = state.bindSelectIdList
  if (state.selectIdList.length) {
    widgetList.forEach(({ id, bindData }) => {
      const idList = bindData && Object.keys(bindData)
      const isBindSelect = idList && idList.length && state.selectIdList.some((id) => idList.includes(id))
      nextBindSelectIdList = isBindSelect
        ? arrayMatchPush(nextBindSelectIdList, id)
        : arrayMatchDelete(nextBindSelectIdList, id)
    })
  } else {
    if (nextBindSelectIdList.length) nextBindSelectIdList = []
  }
  return objectSet(state, 'bindSelectIdList', nextBindSelectIdList)
}

const reducerRangeBoundingRect = (state, elementRefData, eventState) => {
  const { elementWidgetLayer } = elementRefData
  const boundingRect = fromPoint(eventState.pointStart, eventState.point)
  const layerBoundingRect = elementWidgetLayer.getBoundingClientRect()
  const nextRangeBoundingRect = objectMerge(
    state.rangeBoundingRect || {},
    getEditorSpaceBoundingRect(boundingRect, layerBoundingRect)
  )
  return objectSet(state, 'rangeBoundingRect', nextRangeBoundingRect)
}
const getEditorSpaceBoundingRect = ({ left, right, top, bottom }, { left: offsetX, top: offsetY }) => ({
  left: left - offsetX,
  right: right - offsetX,
  top: top - offsetY,
  bottom: bottom - offsetY
})

const reducerSelectBoundingRect = (state, editorState) => {
  const { widgetList } = editorState.externalData
  return objectSet(state, 'selectBoundingRect', calcSelectBoundingRectCached(widgetList, state.selectIdList))
}
const calcSelectBoundingRectCached = immutableTransformCache((widgetList, selectIdList) => selectIdList.length
  ? fromWidgetList(widgetList.filter(({ id }) => selectIdList.includes(id)))
  : null
)

const updateSelectData = (editorState, state) => objectSet(editorState, 'selectData', state)

const initialState = {
  selectIdList: [],
  bindSelectIdList: [],
  selectBoundingRect: null, // from merge select widget
  rangeBoundingRect: null // from event
}

const reducerMap = {
  'reducer:select-data:reset': (editorState) => updateSelectData(editorState, initialState),
  'reducer:select-data:reset:range-bound': (editorState) => updateSelectData(editorState, objectSet(editorState.selectData, 'rangeBoundingRect', null)),
  'reducer:select-data:tap': (editorState, { eventState, targetWidgetId }) => {
    const getIsSelect = eventState.selectModeType === SELECT_MODE_TYPE.ALTER
      ? (id, isPrevSelect) => id === targetWidgetId ? !isPrevSelect : isPrevSelect // toggle
      : (id) => id === targetWidgetId // exclusive

    let state = editorState.selectData
    state = reducerSelectIdList(state, editorState, getIsSelect)
    state = reducerBindSelectIdList(state, editorState)
    state = reducerSelectBoundingRect(state, editorState)
    return updateSelectData(editorState, state)
  },
  'reducer:select-data:pan': (editorState, { elementRefData, eventState }) => {
    const { elementWidgetMap } = elementRefData
    const boundingRect = fromPoint(eventState.pointStart, eventState.point)
    const getIsSelect = eventState.selectModeType === SELECT_MODE_TYPE.ALTER // NOTE: change to isContain for fewer selection
      ? (id, isPrevSelect) => isPrevSelect || isIntersect(boundingRect, elementWidgetMap[ id ].getBoundingClientRect()) // inclusive
      : (id) => isIntersect(boundingRect, elementWidgetMap[ id ].getBoundingClientRect()) // exclusive

    let state = editorState.selectData
    state = reducerSelectIdList(state, editorState, getIsSelect)
    state = reducerBindSelectIdList(state, editorState)
    state = reducerSelectBoundingRect(state, editorState)
    state = reducerRangeBoundingRect(state, elementRefData, eventState)
    return updateSelectData(editorState, state)
  },
  'reducer:select-data:update-bound': (editorState) => {
    let state = editorState.selectData
    state = reducerSelectBoundingRect(state, editorState)
    return updateSelectData(editorState, state)
  }
}

export { initialState, reducerMap }
