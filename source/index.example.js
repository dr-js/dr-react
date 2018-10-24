import React from 'react'
import ReactDOM from 'react-dom'

import { objectMerge, objectSet } from 'dr-js/module/common/immutable/Object'
import { arrayPush } from 'dr-js/module/common/immutable/Array'
import { createStateStore } from 'dr-js/module/common/immutable/StateStore'

import { transformCache, delayArgvQueueByAnimationFrame } from 'source/__dev__'

// TODO: move form `source/component/` to directory `WidgetComponent/`
import { WidgetCreator } from 'source/component/WidgetCreator'
import { WidgetEditor } from 'source/component/WidgetEditor'
import { initialState as initialWidgetCreatorState, reducerMap as reducerWidgetCreatorMap } from 'source/state/widgetCreator/state'
import { initialState as initialWidgetEditorState, reducerMap as reducerWidgetEditorMap } from 'source/state/widgetEditor/state'
import { duplicateWidget } from 'source/widget/data/duplicate'

const mapWidgetCreatorStateCached = transformCache((isLock, zoom, centerOffset, viewport) => ({
  isLock, zoom, centerOffset, viewport
}))
const getWidgetCreatorStateCached = ({
  isLock, zoom, centerOffset, viewport
}) => mapWidgetCreatorStateCached(isLock, zoom, centerOffset, viewport)

const mapWidgetEditorStateCached = transformCache((isLock, isLockEvent, widgetList, lockWidgetId, zoom, centerOffset, viewport) => ({
  isLock, isLockEvent, widgetList, lockWidgetId, zoom, centerOffset, viewport
}))
const getWidgetEditorStateCached = ({
  isLock, isLockEvent, widgetList, lockWidgetId, zoom, centerOffset, viewport
}) => mapWidgetEditorStateCached(isLock, isLockEvent, widgetList, lockWidgetId, zoom, centerOffset, viewport)

const initReactRender = ({ rootElement, initialState: externalState }) => {
  const creatorStateStore = createStateStore({ ...initialWidgetCreatorState, externalData: getWidgetCreatorStateCached(externalState) })
  const editorStateStore = createStateStore({ ...initialWidgetEditorState, externalData: getWidgetEditorStateCached(externalState) })

  // TODO: better option to share element boundingClientRect between Components?
  let elementWidgetLayer = null
  const setElementWidgetLayer = (element) => { elementWidgetLayer = element }
  const getWidgetLayerBoundingClientRect = () => elementWidgetLayer.getBoundingClientRect()

  // TODO: simple store, upgrade to Redux
  const getState = () => externalState
  const updateStateDelayed = delayArgvQueueByAnimationFrame((argvQueue) => {
    const [ externalData ] = argvQueue[ argvQueue.length - 1 ]
    __DEV__ && console.time('[Root] updateState')
    creatorStateStore.setState(reducerWidgetCreatorMap[ 'reducer:set:external-data' ](creatorStateStore.getState(), getWidgetCreatorStateCached(externalData)))
    editorStateStore.setState(reducerWidgetEditorMap[ 'reducer:set:external-data' ](editorStateStore.getState(), getWidgetEditorStateCached(externalData)))
    __DEV__ && console.timeEnd('[Root] updateState')
  })

  const appendExternalWidgetList = (widget) => {
    widget = duplicateWidget(widget)
    externalState = objectSet(externalState, 'widgetList', arrayPush(externalState.widgetList, widget))
    updateStateDelayed(externalState)
  }
  const updateExternalData = (nextExternalState) => {
    externalState = objectMerge(externalState, nextExternalState)
    updateStateDelayed(externalState)
  }

  // initial render
  ReactDOM.render(<div style={{ display: 'flex', flexFlow: 'row nowrap', width: '100%', height: '100%' }}>
    <div style={{ position: 'relative', width: '80px', borderRight: '1px solid #d9d9d9' }}>
      <WidgetCreator {...{ stateStore: creatorStateStore, getWidgetLayerBoundingClientRect, updateExternalData, appendExternalWidgetList }} />
    </div>
    <div style={{ position: 'relative', flex: 1 }}>
      <WidgetEditor {...{ stateStore: editorStateStore, setElementWidgetLayer, updateExternalData }} />
    </div>
  </div>, rootElement)

  return {
    getState,
    creatorStateStore,
    editorStateStore
  }
}

const initialState = {
  isLock: false,
  isLockEvent: false,

  widgetList: [],
  lockWidgetId: null, // TODO: check better name or usage

  zoom: 1,
  centerOffset: { x: 0, y: 0 }, // offset to point (0, 0), no zoom applied
  viewport: { left: 0, top: 0, width: 0, height: 0 } // from boundingClientRect
}

export {
  initReactRender,
  initialState
}
