import React, { PureComponent, Fragment } from 'react'
import PropTypes from 'prop-types'
import { createGlobalStyle } from 'styled-components'
import { arrayFindSet } from 'dr-js/module/common/immutable/Array'

import { transformCache } from 'source/function'

import { applyWidgetEditorStateProcessor } from 'source/state/widgetEditor/processor'

import { WidgetGlobalStyle } from 'source/component/Widget/Widget'
import { RulerLayer } from 'source/component/RulerLayer'
import { ScrollLayer, ScrollLayerBounded, ScrollLayerStatic } from 'source/component/ScrollLayer'

import { WidgetLayer, WidgetLayerSnapshot } from './WidgetLayer'
import { IndicatorLayer } from './IndicatorLayer'

const CSS_EVENT_DEFAULT_FIX = 'event-default-fix'

const GlobalStyle = createGlobalStyle`
  .${CSS_EVENT_DEFAULT_FIX} {
    touch-action: none;
    user-select: none;
  }
`

const DEFAULT_CENTER_OFFSET = { x: 0, y: 0 }

const mutateDataUpdate = (data, key, value) => value ? (data[ key ] = value) : delete data[ key ]

class WidgetEditor extends PureComponent {
  static propTypes = {
    stateStore: PropTypes.shape({
      setState: PropTypes.func.isRequired, // NOTE: this is not a Redux store
      getState: PropTypes.func.isRequired,
      subscribe: PropTypes.func.isRequired
    }).isRequired,
    updateExternalData: PropTypes.func.isRequired,
    setElementWidgetLayer: PropTypes.func.isRequired
  }

  constructor (props) {
    super(props)

    // external data
    const setExternalState = (key, value) => this.props.updateExternalData({ [ key ]: value })
    this.doResetCenterOffset = () => setExternalState('centerOffset', DEFAULT_CENTER_OFFSET)

    // element data
    this.elementRefData = { // updated in a mutable way, direct set / delete
      elementEditorLayer: null,
      elementWidgetLayer: null,
      elementWidgetMap: { /* id: element */ },
      elementIndicatorLayer: null,
      elementIndicatorHandleMap: { /* handleType: element */ },
      elementIndicatorHoverTargetMap: { /* hoverTargetType: element */ }
    }
    this.setEditorLayerElement = (element) => mutateDataUpdate(this.elementRefData, 'elementEditorLayer', element)

    // indicator data
    this.getHoverWidgetCached = transformCache((widgetList, hoverWidgetId) => {
      return (hoverWidgetId && widgetList.find(({ id }) => id === hoverWidgetId)) || null
    })
    const getSingleSelectWidgetCached = transformCache((widgetList, singleSelectWidgetId) => {
      return widgetList.find(({ id }) => id === singleSelectWidgetId) || null
    })
    this.getSingleSelectPreviewWidgetCached = (widgetList, selectIdList, previewWidgetDataMap) => {
      const singleSelectWidgetId = selectIdList.length === 1 && selectIdList[ 0 ]
      if (!singleSelectWidgetId) return null
      const singleSelectPreviewWidgetData = previewWidgetDataMap[ singleSelectWidgetId ]
      return (singleSelectPreviewWidgetData && singleSelectPreviewWidgetData.previewWidget) || getSingleSelectWidgetCached(widgetList, singleSelectWidgetId)
    }

    this.scrollLayerProps = {
      setRef: this.setEditorLayerElement,
      className: CSS_EVENT_DEFAULT_FIX,
      onChange: (state) => this.props.updateExternalData(state),
      onDragEnable: () => setExternalState('isLockEvent', true),
      onDragDisable: () => setExternalState('isLockEvent', false)
    }

    // funcPack
    this.widgetLayerFuncPack = {
      setExternalLockWidgetId: (lockWidgetId) => setExternalState('lockWidgetId', lockWidgetId),
      setWidgetLayerElement: (element) => {
        this.props.setElementWidgetLayer(element)
        mutateDataUpdate(this.elementRefData, 'elementWidgetLayer', element)
      },
      setWidgetElement: (id, element) => mutateDataUpdate(this.elementRefData.elementWidgetMap, id, element)
    }
    this.indicatorLayerFuncPack = {
      updateWidget: (widget) => setExternalState('widgetList', arrayFindSet(this.state.widgetList, ({ id }) => id === widget.id, widget)),
      setIndicatorLayerElement: (element) => mutateDataUpdate(this.elementRefData, 'elementIndicatorLayer', element),
      setHandleElement: (name, element) => mutateDataUpdate(this.elementRefData.elementIndicatorHandleMap, name, element),
      setHoverTargetElement: (name, element) => mutateDataUpdate(this.elementRefData.elementIndicatorHoverTargetMap, name, element)
    }

    // processor
    this.clearProcessor = null
    this.applyProcessor = () => {
      this.clearProcessor = applyWidgetEditorStateProcessor({
        stateStore: this.props.stateStore,
        elementRefData: this.elementRefData,
        setExternalWidgetList: (widgetList) => setExternalState('widgetList', widgetList)
      })
    }

    // store bind
    this.props.stateStore.subscribe((state) => this.setState(state))
    this.state = this.props.stateStore.getState()
  }

  componentDidMount () {
    this.applyProcessor()
  }

  componentWillUnmount () {
    this.clearProcessor && this.clearProcessor()
    this.clearProcessor = null
  }

  render () {
    const {
      externalData: { isLock, zoom, viewport, centerOffset, widgetList, lockWidgetId },
      selectData: { selectIdList, rangeBoundingRect },
      hoverData: { hoverWidgetId },
      handleData: { handleType },
      snapData: { snapDataList },
      previewData: { previewWidgetDataMap, previewBoundingRect }
    } = this.state

    const allowScroll = !rangeBoundingRect && !lockWidgetId

    const hasIndicator = !isLock && !lockWidgetId
    const hoverWidget = hasIndicator && this.getHoverWidgetCached(widgetList, hoverWidgetId)
    const singleSelectPreviewWidget = hasIndicator && this.getSingleSelectPreviewWidgetCached(widgetList, selectIdList, previewWidgetDataMap)

    __DEV__ && console.log(`[RENDER] WidgetEditor`)

    return <Fragment>
      <RulerLayer {...{ zoom, valueX: centerOffset.x, valueY: centerOffset.y, onClick: this.doResetCenterOffset, className: CSS_EVENT_DEFAULT_FIX }}>
        <ScrollLayer {...{ zoom, viewport, centerOffset, allowScroll, ...this.scrollLayerProps }}>
          <WidgetLayer {...{ zoom, isLock, widgetList, previewWidgetDataMap, funcPack: this.widgetLayerFuncPack }} />
          {hasIndicator && <IndicatorLayer {...{
            zoom, rangeBoundingRect, handleType, snapDataList, previewBoundingRect, hoverWidget, singleSelectPreviewWidget, funcPack: this.indicatorLayerFuncPack
          }} />}
        </ScrollLayer>
      </RulerLayer>
      <WidgetGlobalStyle />
      <GlobalStyle />
    </Fragment>
  }
}

// TODO: test & sort this
class WidgetEditorViewer extends WidgetEditor {
  render () {
    const {
      externalData: { isLock, zoom, viewport, centerOffset, widgetList, lockWidgetId },
      selectData: { rangeBoundingRect }
    } = this.state

    return <Fragment>
      <ScrollLayerBounded {...{
        boundRect: getMergedEditBoundingWidgetCached(widgetList),
        zoom,
        viewport,
        centerOffset,
        allowScroll: !rangeBoundingRect && !lockWidgetId,
        ...this.scrollLayerProps
      }}>
        <WidgetLayer {...{ zoom, isLock, widgetList, funcPack: this.widgetLayerFuncPack }} />
      </ScrollLayerBounded>
      <WidgetGlobalStyle />
      <GlobalStyle />
    </Fragment>
  }
}

const WidgetEditorSnapshot = ({ widgetList, widgetEditor: { zoom } }) => <Fragment>
  <ScrollLayerStatic {...{
    boundRect: getMergedEditBoundingWidgetCached(widgetList),
    zoom
  }}>
    <WidgetLayerSnapshot {...{ widgetList, zoom }} isLock />
  </ScrollLayerStatic>
  <WidgetGlobalStyle />
  <GlobalStyle />
</Fragment>
WidgetEditorSnapshot.propTypes = {
  widgetList: PropTypes.array,
  widgetEditor: PropTypes.object
}

const DEFAULT_MERGED_EDIT_BOUNDING_WIDGET = { center: { x: 0, y: 0 }, size: { x: 400, y: 600 } }
const getMergedEditBoundingWidgetCached = transformCache((widgetList) => widgetList.length
  ? getMergedEditBoundingWidget(widgetList)
  : DEFAULT_MERGED_EDIT_BOUNDING_WIDGET
)

const getMergedEditBoundingWidget = (v) => v // TODO

export {
  WidgetEditor,
  WidgetEditorViewer,
  WidgetEditorSnapshot
}
