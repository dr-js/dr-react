import { createMultiKeySwitch } from '@dr-js/core/module/common/module/KeySelector'

import { HANDLE_TYPE } from 'source/state/widget/type/handle'
import { POINTER_EVENT_TYPE, SELECT_MODE_TYPE, applyPointerEventListener } from 'source/state/event'

import { EVENT_TARGET_TYPE, getEventTargetData } from './eventTarget'
import { reducerMap } from './state'

const PROCESSOR_TYPE = {
  SKIP: 'SKIP',
  RESET: 'RESET',
  SELECT_TAP: 'SELECT_TAP',
  SELECT_PAN: 'SELECT_PAN',
  SELECT_PAN_END: 'SELECT_PAN_END',
  HANDLE_PAN: 'HANDLE_PAN',
  HANDLE_PAN_END: 'HANDLE_PAN_END'
}

const processorMap = {
  [ PROCESSOR_TYPE.SKIP ]: (state) => {
    __DEV__ && console.log('# EDITOR_SKIP_KEY_LIST')
    return state
  },
  [ PROCESSOR_TYPE.RESET ]: (state) => {
    __DEV__ && console.log('# EDITOR_RESET_KEY_LIST')
    state = reducerMap[ 'reducer:reset:process-data' ](state)
    return state
  },
  [ PROCESSOR_TYPE.SELECT_TAP ]: (state, { eventState, eventTargetData: { targetWidgetId } }) => {
    state = reducerMap[ 'reducer:select-data:tap' ](state, { eventState, targetWidgetId })
    state = reducerMap[ 'reducer:preview-data:update-bound' ](state)
    return state
  },
  [ PROCESSOR_TYPE.SELECT_PAN ]: (state, { elementRefData, eventState }) => {
    state = reducerMap[ 'reducer:select-data:pan' ](state, { elementRefData, eventState })
    state = reducerMap[ 'reducer:preview-data:update-bound' ](state)
    return state
  },
  [ PROCESSOR_TYPE.SELECT_PAN_END ]: (state, { elementRefData, eventState }) => {
    state = reducerMap[ 'reducer:select-data:pan' ](state, { elementRefData, eventState })
    state = reducerMap[ 'reducer:preview-data:update-bound' ](state)

    state = reducerMap[ 'reducer:select-data:reset:range-bound' ](state)
    return state
  },
  [ PROCESSOR_TYPE.HANDLE_PAN ]: (state, { elementRefData, eventState, eventTargetData: { handleType, hoverTargetType } }) => {
    if (!handleType) handleType = HANDLE_TYPE.MOVE
    state = reducerMap[ 'reducer:select-data:update-bound' ](state)
    state = reducerMap[ 'reducer:hover-data:update-pointer-event' ](state, { elementRefData, eventState, hoverTargetType })
    state = reducerMap[ 'reducer:handle-data:update-pointer-event' ](state, { elementRefData, eventState, handleType })
    state = reducerMap[ 'reducer:snap-data:update' ](state)
    state = reducerMap[ 'reducer:preview-data:update-handle' ](state, { elementRefData, eventState })
    return state
  },
  [ PROCESSOR_TYPE.HANDLE_PAN_END ]: (state, { elementRefData, eventState, eventTargetData: { handleType, hoverTargetType }, requestSetWidgetList }) => {
    if (!handleType) handleType = HANDLE_TYPE.MOVE
    state = reducerMap[ 'reducer:select-data:update-bound' ](state)
    state = reducerMap[ 'reducer:hover-data:update-pointer-event' ](state, { elementRefData, eventState, hoverTargetType })
    state = reducerMap[ 'reducer:handle-data:update-pointer-event' ](state, { elementRefData, eventState, handleType })
    state = reducerMap[ 'reducer:snap-data:update' ](state)
    state = reducerMap[ 'reducer:preview-data:update-handle' ](state, { elementRefData, eventState })

    const previewWidgetDataList = Object.values(state.previewData.previewWidgetDataMap)
    if (previewWidgetDataList.length) requestSetWidgetList(previewWidgetDataList.map(({ previewWidget }) => previewWidget))

    state = reducerMap[ 'reducer:hover-data:reset' ](state)
    state = reducerMap[ 'reducer:handle-data:reset' ](state)
    state = reducerMap[ 'reducer:snap-data:reset' ](state)
    state = reducerMap[ 'reducer:preview-data:reset:preview-widget-data' ](state)
    return state
  }
}

const ANY_EVENT_TARGET_TYPE = Object.values(EVENT_TARGET_TYPE)
const ANY_SELECT_MODE_TYPE = Object.values(SELECT_MODE_TYPE)

const keySwitch = createMultiKeySwitch({ keyCount: 3 })

keySwitch.set(PROCESSOR_TYPE.SKIP, [
  [ [ POINTER_EVENT_TYPE.TAP, POINTER_EVENT_TYPE.HOLD ], EVENT_TARGET_TYPE.NULL, SELECT_MODE_TYPE.ALTER ],
  [ [ POINTER_EVENT_TYPE.TAP, POINTER_EVENT_TYPE.HOLD ], EVENT_TARGET_TYPE.HANDLE, ANY_SELECT_MODE_TYPE ]
])
keySwitch.set(PROCESSOR_TYPE.RESET, [
  [ [ POINTER_EVENT_TYPE.TAP, POINTER_EVENT_TYPE.HOLD ], EVENT_TARGET_TYPE.NULL, SELECT_MODE_TYPE.DEFAULT ]
])
keySwitch.set(PROCESSOR_TYPE.SELECT_TAP, [
  [ [ POINTER_EVENT_TYPE.TAP, POINTER_EVENT_TYPE.HOLD ], EVENT_TARGET_TYPE.WIDGET, ANY_SELECT_MODE_TYPE ],
  [ [ POINTER_EVENT_TYPE.TAP, POINTER_EVENT_TYPE.HOLD ], EVENT_TARGET_TYPE.WIDGET_SELECT, ANY_SELECT_MODE_TYPE ]
])
keySwitch.set(PROCESSOR_TYPE.SELECT_PAN, [
  [ POINTER_EVENT_TYPE.DRAG_MOVE, EVENT_TARGET_TYPE.NULL, ANY_SELECT_MODE_TYPE ],
  [ POINTER_EVENT_TYPE.DRAG_MOVE, EVENT_TARGET_TYPE.WIDGET, SELECT_MODE_TYPE.DEFAULT ],
  [ POINTER_EVENT_TYPE.DRAG_MOVE, [ EVENT_TARGET_TYPE.WIDGET, EVENT_TARGET_TYPE.WIDGET_SELECT ], SELECT_MODE_TYPE.ALTER ]
])
keySwitch.set(PROCESSOR_TYPE.SELECT_PAN_END, [
  [ POINTER_EVENT_TYPE.DRAG_END, EVENT_TARGET_TYPE.NULL, ANY_SELECT_MODE_TYPE ],
  [ POINTER_EVENT_TYPE.DRAG_END, EVENT_TARGET_TYPE.WIDGET, SELECT_MODE_TYPE.DEFAULT ],
  [ POINTER_EVENT_TYPE.DRAG_END, [ EVENT_TARGET_TYPE.WIDGET, EVENT_TARGET_TYPE.WIDGET_SELECT ], SELECT_MODE_TYPE.ALTER ]
])
keySwitch.set(PROCESSOR_TYPE.HANDLE_PAN, [
  [ POINTER_EVENT_TYPE.DRAG_MOVE, EVENT_TARGET_TYPE.HANDLE, ANY_SELECT_MODE_TYPE ],
  [ POINTER_EVENT_TYPE.DRAG_MOVE, EVENT_TARGET_TYPE.WIDGET_SELECT, SELECT_MODE_TYPE.DEFAULT ]
])
keySwitch.set(PROCESSOR_TYPE.HANDLE_PAN_END, [
  [ POINTER_EVENT_TYPE.DRAG_END, EVENT_TARGET_TYPE.HANDLE, ANY_SELECT_MODE_TYPE ],
  [ POINTER_EVENT_TYPE.DRAG_END, EVENT_TARGET_TYPE.WIDGET_SELECT, SELECT_MODE_TYPE.DEFAULT ]
])

__DEV__ && keySwitch.verifyFull(Object.values(POINTER_EVENT_TYPE), ANY_EVENT_TARGET_TYPE, ANY_SELECT_MODE_TYPE)

const applyWidgetEditorStateProcessor = ({ stateStore: { getState, setState }, elementRefData, setExternalWidgetList }) => {
  const { elementEditorLayer } = elementRefData
  if (!elementEditorLayer) throw new Error('[applyWidgetEditorStateProcessor] elementEditorLayer expected in elementRefData')

  const eventProcessor = (pointerEventType, eventState) => {
    const state = getState()

    if (
      state.externalData.isLock ||
      (state.externalData.isLockEvent && pointerEventType !== POINTER_EVENT_TYPE.TAP) // lock pan // TODO: check working
    ) return

    const eventTargetData = getEventTargetData(state, elementRefData, eventState)
    const processorType = keySwitch.get(pointerEventType, eventTargetData.type, eventState.selectModeType)
    __DEV__ && console.log(`[applyWidgetEditorStateProcessor] ${processorType} - ${JSON.stringify(eventTargetData)}`)

    let nextWidgetList
    const nextState = processorMap[ processorType ](state, {
      elementRefData,
      eventTargetData,
      eventState,
      requestSetWidgetList: (widgetList) => { nextWidgetList = widgetList }
    })
    setState(nextState) // can cause update
    nextWidgetList && setExternalWidgetList(nextWidgetList) // delay update externalData after setState
  }

  return applyPointerEventListener(elementEditorLayer, eventProcessor)
}

export { applyWidgetEditorStateProcessor }
