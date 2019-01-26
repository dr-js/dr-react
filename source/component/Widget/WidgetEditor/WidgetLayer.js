import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import { transformCache } from 'source/function'
import { renderWidget } from 'source/component/Widget/Widget'

const WidgetLayerDiv = styled.div`
  z-index: 0; /* z-context-editor */
  overflow: visible;
  position: absolute;
  top: 0;
  left: 0;
`

class WidgetLayer extends PureComponent {
  static propTypes = {
    zoom: PropTypes.number,
    isLock: PropTypes.bool,
    widgetList: PropTypes.array,
    previewWidgetDataMap: PropTypes.object,
    funcPack: PropTypes.shape({
      setExternalLockWidgetId: PropTypes.func.isRequired,
      setWidgetLayerElement: PropTypes.func.isRequired,
      setWidgetElement: PropTypes.func.isRequired
    }).isRequired
  }

  constructor (props) {
    super(props)

    this.getPackCached = transformCache((zoom, isLock, setExternalLockWidgetId, setWidgetElement) => ({
      zoom, isLock, setExternalLockWidgetId, setRef: setWidgetElement
    }))
  }

  render () {
    const { zoom, isLock, widgetList, previewWidgetDataMap, funcPack: { setExternalLockWidgetId, setWidgetLayerElement, setWidgetElement } } = this.props
    const pack = this.getPackCached(zoom, isLock, setExternalLockWidgetId, setWidgetElement)

    return <WidgetLayerDiv ref={setWidgetLayerElement}>
      {widgetList.map((widget) => {
        const previewWidgetData = previewWidgetDataMap[ widget.id ]
        if (!previewWidgetData) return renderWidget(widget, false, pack)
        const { isSelect, isBindSelect, previewWidget } = previewWidgetData
        return renderWidget(previewWidget, isSelect || isBindSelect, pack)
      })}
    </WidgetLayerDiv>
  }
}

const WidgetLayerSnapshot = ({ widgetList, zoom, isLock }) => {
  const widgetProps = { zoom, isLock }

  return <WidgetLayerDiv>
    {widgetList.map((widget) => renderWidget(widget, widgetProps))}
  </WidgetLayerDiv>
}
WidgetLayerSnapshot.propTypes = WidgetLayer.propTypes

export {
  WidgetLayer,
  WidgetLayerSnapshot
}
