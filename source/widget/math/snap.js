import { ListMap } from 'dr-js/module/common/data/ListMap'
import { fromWidget } from 'dr-js/module/common/geometry/D2/boundingRect'

import { SNAP_TYPE, SNAP_TO_SET_MAP } from '../type/snap'

const calcSnapDataListOfWidgetList = (widgetList) => {
  const snapBoundingRectList = widgetList.map((widget) => formatSnapBoundingRect(fromWidget(widget)))

  const snapDataListMapX = new ListMap()
  const snapDataListMapY = new ListMap()
  for (let pairInitIndex = 0, indexMax = snapBoundingRectList.length; pairInitIndex < indexMax; pairInitIndex++) {
    const boundingRect = snapBoundingRectList[ pairInitIndex ]

    // each single
    const { left, right, top, bottom, centerX, centerY } = boundingRect
    snapDataListMapX.add(left, { boundingRect, type: SNAP_TYPE.X_MIN })
    snapDataListMapX.add(right, { boundingRect, type: SNAP_TYPE.X_MAX })
    snapDataListMapX.add(centerX, { boundingRect, type: SNAP_TYPE.X_MID })
    snapDataListMapY.add(top, { boundingRect, type: SNAP_TYPE.Y_MIN })
    snapDataListMapY.add(bottom, { boundingRect, type: SNAP_TYPE.Y_MAX })
    snapDataListMapY.add(centerY, { boundingRect, type: SNAP_TYPE.Y_MID })

    for (let index = pairInitIndex + 1; index < indexMax; index++) {
      const boundingRectPair = snapBoundingRectList[ index ]

      // each pair
      const isOverlapX = boundingRect.left <= boundingRectPair.right && boundingRect.right >= boundingRectPair.left
      const isOverlapY = boundingRect.top <= boundingRectPair.bottom && boundingRect.bottom >= boundingRectPair.top
      if (!isOverlapX && isOverlapY) { // gap extend X
        const [ boundingRectLeft, boundingRectRight ] = boundingRect.right < boundingRectPair.left ? [ boundingRect, boundingRectPair ] : [ boundingRectPair, boundingRect ]
        const gapSize = boundingRectRight.left - boundingRectLeft.right
        snapDataListMapX.add(boundingRectLeft.left - gapSize, { boundingRectLeft, boundingRectRight, gapSize, type: SNAP_TYPE.GAP_EXT_LEFT })
        snapDataListMapX.add(boundingRectRight.right + gapSize, { boundingRectLeft, boundingRectRight, gapSize, type: SNAP_TYPE.GAP_EXT_RIGHT })
        snapDataListMapX.add(Math.round((boundingRectRight.left + boundingRectLeft.right) * 0.5), { boundingRectLeft, boundingRectRight, gapSize, type: SNAP_TYPE.GAP_MID_X })
      } else if (isOverlapX && !isOverlapY) { // gap extend Y
        const [ boundingRectTop, boundingRectBottom ] = boundingRect.bottom < boundingRectPair.top ? [ boundingRect, boundingRectPair ] : [ boundingRectPair, boundingRect ]
        const gapSize = boundingRectBottom.top - boundingRectTop.bottom
        snapDataListMapY.add(boundingRectTop.top - gapSize, { boundingRectTop, boundingRectBottom, gapSize, type: SNAP_TYPE.GAP_EXT_TOP })
        snapDataListMapY.add(boundingRectBottom.bottom + gapSize, { boundingRectTop, boundingRectBottom, gapSize, type: SNAP_TYPE.GAP_EXT_BOTTOM })
        snapDataListMapY.add(Math.round((boundingRectBottom.top + boundingRectTop.bottom) * 0.5), { boundingRectTop, boundingRectBottom, gapSize, type: SNAP_TYPE.GAP_MID_Y })
      }
    }
  }

  return { snapDataListMapX, snapDataListMapY }
}

// NOTE: set { left, right, top, bottom, centerX, centerY } to null to skip corresponding snap
const INITIAL_SNAP_INFO = { snapDataList: [], offset: Infinity }
const calcSnapInfo = (snapDataListMapX, snapDataListMapY, offsetMax, left, right, top, bottom, centerX, centerY) => {
  // try snap X
  let editSnapInfoX = INITIAL_SNAP_INFO
  if (left !== null) editSnapInfoX = reduceSnapInfoForValue(editSnapInfoX, left, snapDataListMapX, offsetMax, SNAP_TO_SET_MAP.X_MIN)
  if (right !== null) editSnapInfoX = reduceSnapInfoForValue(editSnapInfoX, right, snapDataListMapX, offsetMax, SNAP_TO_SET_MAP.X_MAX)
  if (centerX !== null) editSnapInfoX = reduceSnapInfoForValue(editSnapInfoX, centerX, snapDataListMapX, offsetMax, SNAP_TO_SET_MAP.X_MID)

  // try snap Y
  let editSnapInfoY = INITIAL_SNAP_INFO
  if (top !== null) editSnapInfoY = reduceSnapInfoForValue(editSnapInfoY, top, snapDataListMapY, offsetMax, SNAP_TO_SET_MAP.Y_MIN)
  if (bottom !== null) editSnapInfoY = reduceSnapInfoForValue(editSnapInfoY, bottom, snapDataListMapY, offsetMax, SNAP_TO_SET_MAP.Y_MAX)
  if (centerY !== null) editSnapInfoY = reduceSnapInfoForValue(editSnapInfoY, centerY, snapDataListMapY, offsetMax, SNAP_TO_SET_MAP.Y_MID)

  return { editSnapInfoX, editSnapInfoY }
}
const reduceSnapInfoForValue = (state, value, snapDataListMap, offsetMax, snapToSet) => {
  const offsetAbsMax = Math.min(Math.abs(state.offset), offsetMax)
  const snapListCheck = (v) => snapToSet.has(v.type)

  let offsetAbs = 0
  let offset = 0
  let snapDataList = getSnapDataList(snapDataListMap, value, snapListCheck)
  if (!snapDataList) {
    while (offsetAbs <= offsetAbsMax) {
      offset = -offsetAbs
      snapDataList = getSnapDataList(snapDataListMap, value + offset, snapListCheck)
      if (snapDataList) break
      offset = offsetAbs
      snapDataList = getSnapDataList(snapDataListMap, value + offset, snapListCheck)
      if (snapDataList) break
      offsetAbs++
    }
  }
  if (!snapDataList) return state

  snapDataList = snapDataList.filter(snapListCheck)
  if (state.offset === offset) snapDataList = [ ...state.snapDataList, ...snapDataList ]

  return { offset, snapDataList }
}
const getSnapDataList = (snapDataListMap, value, snapListCheck) => {
  const snapDataList = snapDataListMap.getList(value)
  return snapDataList && snapDataList.some(snapListCheck) && snapDataList
}

const formatSnapBoundingRect = ({ left, right, top, bottom }) => ({
  left: Math.round(left),
  right: Math.round(right),
  top: Math.round(top),
  bottom: Math.round(bottom),
  centerX: Math.round((left + right) * 0.5),
  centerY: Math.round((top + bottom) * 0.5)
})

export {
  INITIAL_SNAP_INFO,
  calcSnapDataListOfWidgetList,
  calcSnapInfo,
  formatSnapBoundingRect
}
