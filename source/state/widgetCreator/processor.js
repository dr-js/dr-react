import { createMultiKeySwitch } from 'dr-js/module/common/module/KeySelector'

import { POINTER_EVENT_TYPE, applyPointerEventListener } from 'source/state/event'

import { EVENT_TARGET_TYPE, getEventTargetData } from './eventTarget'
import { reducerMap } from './state'

const CREATE_METHOD_TYPE = {
  NULL: 'NULL',
  DRAG: 'DRAG',
  DRAW: 'DRAW'
}

const PROCESSOR_TYPE = {
  SKIP: 'SKIP',
  RESET: 'RESET',

  PLACE: 'PLACE',

  DRAW: 'DRAW',
  DRAW_END: 'DRAW_END',

  DRAG: 'DRAG',
  DRAG_END: 'DRAG_END'
}

const processorMap = {
  [ PROCESSOR_TYPE.SKIP ]: (state) => {
    __DEV__ && console.log('# CREATOR_SKIP_KEY_LIST')
    return state
  },
  [ PROCESSOR_TYPE.RESET ]: (state) => {
    __DEV__ && console.log('# CREATOR_RESET_KEY_LIST')
    state = reducerMap[ 'reducer:reset:process-data' ](state)
    return state
  },
  [ PROCESSOR_TYPE.PLACE ]: (state, { eventState, getWidgetLayerBoundingClientRect, requestAppendWidget }) => {
    state = reducerMap[ 'reducer:preview-data:update-place' ](state, { eventState, getWidgetLayerBoundingClientRect })

    const { previewWidget, isValidPlace } = state.previewData
    isValidPlace && previewWidget && requestAppendWidget(previewWidget)

    state = reducerMap[ 'reducer:reset:process-data' ](state)
    return state
  },
  [ PROCESSOR_TYPE.DRAW ]: (state, { eventState, getWidgetLayerBoundingClientRect }) => {
    state = reducerMap[ 'reducer:preview-data:update-draw' ](state, { eventState, getWidgetLayerBoundingClientRect })
    return state
  },
  [ PROCESSOR_TYPE.DRAW_END ]: (state, { eventState, getWidgetLayerBoundingClientRect, requestAppendWidget }) => {
    state = reducerMap[ 'reducer:preview-data:update-draw' ](state, { eventState, getWidgetLayerBoundingClientRect })

    const { previewWidget, isValidPlace } = state.previewData
    isValidPlace && previewWidget && requestAppendWidget(previewWidget)

    state = reducerMap[ 'reducer:reset:process-data' ](state)
    return state
  },
  [ PROCESSOR_TYPE.DRAG ]: (state, { eventTargetData: { targetSampleShape }, eventState, getWidgetLayerBoundingClientRect }) => {
    state = reducerMap[ 'reducer:select-data:set-sample-shape' ](state, { targetSampleShape })
    state = reducerMap[ 'reducer:preview-data:update-place' ](state, { eventState, getWidgetLayerBoundingClientRect })
    return state
  },
  [ PROCESSOR_TYPE.DRAG_END ]: (state, { eventTargetData: { targetSampleShape }, eventState, getWidgetLayerBoundingClientRect, requestAppendWidget }) => {
    state = reducerMap[ 'reducer:select-data:set-sample-shape' ](state, { targetSampleShape })
    state = reducerMap[ 'reducer:preview-data:update-place' ](state, { eventState, getWidgetLayerBoundingClientRect })

    const { previewWidget, isValidPlace } = state.previewData
    isValidPlace && previewWidget && requestAppendWidget(previewWidget)

    state = reducerMap[ 'reducer:reset:process-data' ](state)
    return state
  }
}

const ANY_POINTER_EVENT_TYPE = Object.values(POINTER_EVENT_TYPE)
const ANY_CREATE_METHOD_TYPE = Object.values(CREATE_METHOD_TYPE)

const keySwitch = createMultiKeySwitch({ keyCount: 2 })

keySwitch.set(PROCESSOR_TYPE.SKIP, [
  [ ANY_POINTER_EVENT_TYPE, CREATE_METHOD_TYPE.NULL ],
  [ [ POINTER_EVENT_TYPE.TAP, POINTER_EVENT_TYPE.HOLD ], CREATE_METHOD_TYPE.DRAG ]
])
keySwitch.set(PROCESSOR_TYPE.RESET, [])
keySwitch.set(PROCESSOR_TYPE.PLACE, [
  [ [ POINTER_EVENT_TYPE.TAP, POINTER_EVENT_TYPE.HOLD ], CREATE_METHOD_TYPE.DRAW ]
])
keySwitch.set(PROCESSOR_TYPE.DRAW, [
  [ POINTER_EVENT_TYPE.DRAG_MOVE, CREATE_METHOD_TYPE.DRAW ]
])
keySwitch.set(PROCESSOR_TYPE.DRAW_END, [
  [ POINTER_EVENT_TYPE.DRAG_END, CREATE_METHOD_TYPE.DRAW ]
])
keySwitch.set(PROCESSOR_TYPE.DRAG, [
  [ POINTER_EVENT_TYPE.DRAG_MOVE, CREATE_METHOD_TYPE.DRAG ]
])
keySwitch.set(PROCESSOR_TYPE.DRAG_END, [
  [ POINTER_EVENT_TYPE.DRAG_END, CREATE_METHOD_TYPE.DRAG ]
])

__DEV__ && keySwitch.verifyFull(Object.values(POINTER_EVENT_TYPE), ANY_CREATE_METHOD_TYPE)

const applyWidgetCreatorStateProcessor = ({ stateStore: { getState, setState }, elementRefData, appendExternalWidgetList, getWidgetLayerBoundingClientRect }) => {
  const { elementCreatorLayer } = elementRefData
  if (!elementCreatorLayer) throw new Error('[applyWidgetCreatorStateProcessor] elementCreatorLayer expected in elementRefData')

  const eventProcessor = (pointerEventType, eventState) => {
    const state = getState()

    if (state.externalData.isLock) return

    const eventTargetData = getEventTargetData(state, elementRefData, eventState)
    const createMethodType = state.selectData.selectSampleShape && eventTargetData.type === EVENT_TARGET_TYPE.INDICATOR_LAYER ? CREATE_METHOD_TYPE.DRAW
      : eventTargetData.type === EVENT_TARGET_TYPE.SAMPLE ? CREATE_METHOD_TYPE.DRAG
        : CREATE_METHOD_TYPE.NULL
    const processorType = keySwitch.get(pointerEventType, createMethodType)
    __DEV__ && console.log(`[applyWidgetCreatorStateProcessor] ${processorType} - ${JSON.stringify(eventTargetData)}`)

    let nextAppendWidget
    const nextState = processorMap[ processorType ](state, {
      eventTargetData,
      eventState,
      getWidgetLayerBoundingClientRect,
      requestAppendWidget: (widget) => { nextAppendWidget = widget }
    })
    setState(nextState) // may cause update
    nextAppendWidget && appendExternalWidgetList(nextAppendWidget) // delay update externalData after setState
  }

  return applyPointerEventListener(elementCreatorLayer, eventProcessor)
}

export { applyWidgetCreatorStateProcessor }
