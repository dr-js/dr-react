import { objectSet } from 'dr-js/module/common/immutable/Object'
import { fromWidget } from 'dr-js/module/common/geometry/D2/BoundingRect'
import { fromBoundingRect } from 'dr-js/module/common/geometry/D2/Widget'

import { transformCache } from 'source/function'
import { SNAP_ENABLED_HANDEL_TYPE_SET } from 'source/state/widget/type/snap'
import { calcWidgetResizeHandleDelta } from 'source/state/widget/math/calc'
import { INITIAL_SNAP_INFO, calcSnapDataListOfWidgetList, calcSnapInfo, formatSnapBoundingRect } from 'source/state/widget/math/snap'

// try snap to nearest value
const SNAP_OFFSET_ABS_MAX = 10
const calcSnapData = (state, editorState) => {
  const {
    externalData: { zoom, widgetList },
    selectData: { selectIdList, bindSelectIdList, selectBoundingRect },
    handleData
  } = editorState

  if (!SNAP_ENABLED_HANDEL_TYPE_SET.has(handleData.handleType) || !selectIdList.length) return initialState

  const { snapDataListMapX, snapDataListMapY } = calcSnapDataListCached(widgetList, selectIdList, bindSelectIdList)
  const offsetMax = Math.floor(SNAP_OFFSET_ABS_MAX / zoom)
  const singleSelectId = selectIdList.length === 1 && selectIdList[ 0 ]
  const selectWidgetMerged = singleSelectId
    ? widgetList.find(({ id }) => id === singleSelectId)
    : fromBoundingRect(selectBoundingRect, null)
  const prevBoundingRect = formatSnapBoundingRect(selectBoundingRect)
  const { left, right, top, bottom, centerX, centerY } = formatSnapBoundingRect(fromWidget(calcWidgetResizeHandleDelta(selectWidgetMerged, handleData)))

  const { editSnapInfoX, editSnapInfoY } = calcSnapInfo(
    snapDataListMapX, snapDataListMapY,
    offsetMax,
    prevBoundingRect.left !== left ? left : null,
    prevBoundingRect.right !== right ? right : null,
    prevBoundingRect.top !== top ? top : null,
    prevBoundingRect.bottom !== bottom ? bottom : null,
    prevBoundingRect.centerX !== centerX ? centerX : null,
    prevBoundingRect.centerY !== centerY ? centerY : null
  )
  if (editSnapInfoX === INITIAL_SNAP_INFO && editSnapInfoY === INITIAL_SNAP_INFO) return initialState

  const { offset: offsetX, snapDataList: snapDataListX } = editSnapInfoX
  const { offset: offsetY, snapDataList: snapDataListY } = editSnapInfoY
  return {
    snapPointDelta: {
      x: offsetX !== Infinity ? offsetX : 0,
      y: offsetY !== Infinity ? offsetY : 0
    },
    snapDataList: [
      ...snapDataListX,
      ...snapDataListY
    ]
  }
}
const calcSnapDataListCached = transformCache((widgetList, selectIdList, bindSelectIdList) => { // calc the value to snap to
  const excludeIdSet = new Set([ ...selectIdList, ...bindSelectIdList ])
  return calcSnapDataListOfWidgetList(widgetList.filter((widget) => !excludeIdSet.has(widget.id)))
})

const updateSnapData = (editorState, state) => objectSet(editorState, 'snapData', state)

const initialState = {
  snapPointDelta: null,
  snapDataList: []
}

const reducerMap = {
  'reducer:snap-data:reset': (editorState) => updateSnapData(editorState, initialState),
  'reducer:snap-data:update': (editorState) => {
    let state = editorState.snapData
    state = calcSnapData(state, editorState)
    return updateSnapData(editorState, state)
  }
}

export { initialState, reducerMap }
