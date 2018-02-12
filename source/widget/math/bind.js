import { objectSet, objectDelete } from 'dr-js/module/common/immutable/ImmutableOperation'

import { isHoverTargetApplicable } from '../type/hover'
import { BIND_CANCEL_HANDLE_TYPE_SET, BIND_REPLACE_HANDLE_TYPE_SET } from '../type/bind'
import { HOVER_TARGET_CALC_SHIFT_MAP } from './hover'

const deleteBindByHandleType = (bindData, selectIdList, handleType) => {
  if (!handleType) return bindData // keep all bind, should be external change

  const bindIdList = bindData && Object.keys(bindData)
  if (!bindIdList || !bindIdList.length) return null

  if (BIND_CANCEL_HANDLE_TYPE_SET.has(handleType)) { // cancel all bind except the bind target is also selected
    bindIdList.forEach((id) => {
      if (selectIdList.includes(id)) return
      bindData = objectDelete(bindData, id)
    })
  } else if (BIND_REPLACE_HANDLE_TYPE_SET.has(handleType)) { // remove this bind, if has replacement, will add it back later
    bindIdList.forEach((id) => {
      const targetInfo = bindData[ id ]
      if (!targetInfo[ handleType ]) return
      bindData = Object.keys(targetInfo).length > 1
        ? objectSet(bindData, id, objectDelete(targetInfo, handleType)) // delete handle only
        : objectDelete(bindData, id) // delete whole id
    })
  }

  return bindData
}

const addBindByHoverTarget = (bindData, widgetList, elementWidgetMap, hoverTargetType, hoverWidgetId, handleType, eventState) => {
  widgetList.forEach((widget) => {
    const { id, shape } = widget
    if (id !== hoverWidgetId || !isHoverTargetApplicable(shape, hoverTargetType)) return
    const targetShift = HOVER_TARGET_CALC_SHIFT_MAP[ hoverTargetType ](widget, elementWidgetMap[ id ], eventState)

    if (!bindData || !bindData[ id ]) bindData = { ...bindData, [ id ]: { [ handleType ]: targetShift } }
    else bindData = objectSet(bindData, id, objectSet(bindData[ id ], handleType, targetShift))
  })

  return bindData && Object.keys(bindData).length
    ? bindData
    : null
}

export {
  deleteBindByHandleType,
  addBindByHoverTarget
}
