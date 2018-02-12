import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'

import { immutableTransformCache } from 'source/__dev__'

import { renderWidget } from 'source/component/Widget'

import LocalClassName from './widget-layer.pcss'
const CSS_WIDGET_LAYER = LocalClassName[ 'widget-layer' ]

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

    this.getPackCached = immutableTransformCache((zoom, isLock, setExternalLockWidgetId, setWidgetElement) => ({
      zoom, isLock, setExternalLockWidgetId, setRef: setWidgetElement
    }))
  }

  render () {
    const { zoom, isLock, widgetList, previewWidgetDataMap, funcPack: { setExternalLockWidgetId, setWidgetLayerElement, setWidgetElement } } = this.props
    const pack = this.getPackCached(zoom, isLock, setExternalLockWidgetId, setWidgetElement)

    return <div ref={setWidgetLayerElement} className={CSS_WIDGET_LAYER}>
      {widgetList.map((widget) => {
        const previewWidgetData = previewWidgetDataMap[ widget.id ]
        if (!previewWidgetData) return renderWidget(widget, false, pack)
        const { isSelect, isBindSelect, previewWidget } = previewWidgetData
        return renderWidget(previewWidget, isSelect || isBindSelect, pack)
      })}
    </div>
  }
}

const WidgetLayerSnapshot = ({ widgetList, zoom, isLock }) => {
  const widgetProps = { zoom, isLock }

  return <div className={CSS_WIDGET_LAYER}>
    {widgetList.map((widget) => renderWidget(widget, widgetProps))}
  </div>
}
WidgetLayerSnapshot.propTypes = WidgetLayer.propTypes

export {
  WidgetLayer,
  WidgetLayerSnapshot
}
