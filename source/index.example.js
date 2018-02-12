import React from 'react'
import ReactDOM from 'react-dom'

import { objectMerge, objectSet, arrayPush } from 'dr-js/module/common/immutable/ImmutableOperation'
import { createStateStore } from 'dr-js/module/common/immutable/StateStore'

import { immutableTransformCache } from 'source/__dev__'
import { WidgetCreator } from 'source/component/WidgetCreator'
import { WidgetEditor } from 'source/component/WidgetEditor'
import { initialState as initialWidgetCreatorState, reducerMap as reducerWidgetCreatorMap } from 'source/state/widgetCreator/state'
import { initialState as initialWidgetEditorState, reducerMap as reducerWidgetEditorMap } from 'source/state/widgetEditor/state'
import { duplicateWidget } from 'source/widget/data/duplicate'

const mapWidgetCreatorStateCached = immutableTransformCache((isPause, isLock, zoom, centerOffset, viewport) => ({
  isPause, isLock, zoom, centerOffset, viewport
}))
const getWidgetCreatorStateCached = ({ isPause, isLock, zoom, centerOffset, viewport }) => mapWidgetCreatorStateCached(isPause, isLock, zoom, centerOffset, viewport)
const mapWidgetEditorStateCached = immutableTransformCache((isPause, isLock, widgetList, lockWidgetId, zoom, centerOffset, viewport) => ({
  isPause, isLock, widgetList, lockWidgetId, zoom, centerOffset, viewport
}))
const getWidgetEditorStateCached = ({ isPause, isLock, widgetList, lockWidgetId, zoom, centerOffset, viewport }) => mapWidgetEditorStateCached(isPause, isLock, widgetList, lockWidgetId, zoom, centerOffset, viewport)

const initReactRender = ({ rootElement, initialState: externalState }) => {
  const creatorStateStore = createStateStore({ ...initialWidgetCreatorState, externalData: getWidgetCreatorStateCached(externalState) })
  const editorStateStore = createStateStore({ ...initialWidgetEditorState, externalData: getWidgetEditorStateCached(externalState) })

  // TODO: better option to share element boundingClientRect between Components?
  let elementWidgetLayer = null
  const setElementWidgetLayer = (element) => { elementWidgetLayer = element }
  const getWidgetLayerBoundingClientRect = () => elementWidgetLayer.getBoundingClientRect()

  // simple store
  const getState = () => externalState
  const updateState = (externalData) => {
    creatorStateStore.setState(reducerWidgetCreatorMap[ 'reducer:set:external-data' ](creatorStateStore.getState(), getWidgetCreatorStateCached(externalData)))
    editorStateStore.setState(reducerWidgetEditorMap[ 'reducer:set:external-data' ](editorStateStore.getState(), getWidgetEditorStateCached(externalData)))
  }
  const appendExternalWidgetList = (widget) => {
    widget = duplicateWidget(widget)
    externalState = objectSet(externalState, 'widgetList', arrayPush(externalState.widgetList, widget))
    updateState(externalState)
  }
  const updateExternalData = (nextExternalState) => {
    externalState = objectMerge(externalState, nextExternalState)
    updateState(externalState)
  }

  // initial render
  ReactDOM.render(<div style={{ display: 'flex', flexFlow: 'row nowrap', width: '100%', height: '100%' }}>
    <div style={{ position: 'relative', width: '80px', borderRight: '1px solid #d9d9d9' }}>
      <WidgetCreator {...{ stateStore: creatorStateStore, getWidgetLayerBoundingClientRect, appendExternalWidgetList }} />
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
  isPause: false,
  isLock: false,

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
