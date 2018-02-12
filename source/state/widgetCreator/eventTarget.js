import { findKeyInMap } from 'source/__utils__/data'
import { getBranchElementList } from 'source/__utils__/DOM'

const EVENT_TARGET_TYPE = {
  NULL: 'NULL',
  SAMPLE: 'SAMPLE',
  INDICATOR_LAYER: 'INDICATOR_LAYER'
}

const DEFAULT_EVENT_TARGET_DATA = {
  type: EVENT_TARGET_TYPE.NULL,
  targetSampleShape: null // widget shape
}

const getEventTargetData = (state, elementRefData, eventState) => {
  const {
    elementCreatorLayer,
    elementSampleLayer,
    elementSampleMap,
    elementIndicatorLayer
  } = elementRefData
  const { target: elementTarget } = eventState.eventStart

  if (elementCreatorLayer === elementTarget || !elementCreatorLayer.contains(elementTarget)) return DEFAULT_EVENT_TARGET_DATA

  if (elementSampleLayer.contains(elementTarget)) {
    const [ possibleSampleElement ] = getBranchElementList(elementSampleLayer, elementTarget)
    const targetSampleShape = findKeyInMap(elementSampleMap, ([ , element ]) => element.contains(possibleSampleElement)) || null
    if (targetSampleShape) return { type: EVENT_TARGET_TYPE.SAMPLE, targetSampleShape }
  }

  if (elementIndicatorLayer.contains(elementTarget)) return { type: EVENT_TARGET_TYPE.INDICATOR_LAYER, targetSampleShape: null }

  return DEFAULT_EVENT_TARGET_DATA
}

export {
  EVENT_TARGET_TYPE,
  getEventTargetData
}
