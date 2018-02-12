import { ENHANCED_POINTER_EVENT_TYPE, applyPointerEnhancedEventListener } from 'dr-js/module/browser/input'

const { TAP, HOLD, DRAG_MOVE, DRAG_END } = ENHANCED_POINTER_EVENT_TYPE
const POINTER_EVENT_TYPE = { TAP, HOLD, DRAG_MOVE, DRAG_END }

const SELECT_MODE_TYPE = {
  DEFAULT: 'DEFAULT',
  ALTER: 'ALTER'
}

const getEventState = (event, eventState) => {
  eventState.selectModeType = eventState.eventStart.shiftKey
    ? SELECT_MODE_TYPE.ALTER
    : SELECT_MODE_TYPE.DEFAULT
  return eventState
}

const applyPointerEventListener = (element, listener) => applyPointerEnhancedEventListener({
  element,
  onEnhancedEvent: (name, event, eventState) => listener(name, getEventState(event, eventState)),
  isGlobal: true,
  isCancel: false,
  isCancelOnOutOfBound: false
})

export {
  POINTER_EVENT_TYPE,
  SELECT_MODE_TYPE,
  applyPointerEventListener
}
