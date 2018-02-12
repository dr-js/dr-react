import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'

import { immutableTransformCache } from 'source/__dev__'
import { renderWidget } from 'source/component/Widget'
import { STYLE_DISPLAY_NONE } from 'source/component/Widget/DOM'

import LocalClassName from './indicator-layer.pcss'
const CSS_INDICATOR_LAYER = LocalClassName[ 'indicator-layer' ]

class IndicatorLayer extends PureComponent {
  static propTypes = {
    zoom: PropTypes.number.isRequired,
    centerOffset: PropTypes.object.isRequired,
    viewport: PropTypes.object.isRequired,
    previewWidget: PropTypes.object,
    isValidPlace: PropTypes.bool,
    isActive: PropTypes.bool.isRequired,
    setRef: PropTypes.func.isRequired
  }

  constructor (props) {
    super(props)

    this.getViewportStyleCached = immutableTransformCache((viewport) => ({
      position: 'fixed',
      left: `${viewport.left}px`,
      top: `${viewport.top}px`,
      width: `${viewport.width}px`,
      height: `${viewport.height}px`
    }))

    this.getOffsetLayerStyleCached = immutableTransformCache((zoom, centerOffset, isValidPlace) => ({
      position: 'absolute',
      left: `${Math.round(-centerOffset.x * zoom)}px`,
      top: `${Math.round(-centerOffset.y * zoom)}px`,
      opacity: isValidPlace ? '' : 0.5
    }))
  }

  render () {
    const { zoom, centerOffset, viewport, previewWidget, isValidPlace, isActive, setRef } = this.props
    const viewportStyle = isActive ? this.getViewportStyleCached(viewport) : STYLE_DISPLAY_NONE
    const offsetLayerStyle = previewWidget ? this.getOffsetLayerStyleCached(zoom, centerOffset, isValidPlace) : STYLE_DISPLAY_NONE

    return <div ref={setRef} className={CSS_INDICATOR_LAYER} style={viewportStyle}>
      <div style={offsetLayerStyle}>
        {previewWidget && renderWidget(previewWidget, false, { zoom, isLock: true, setRef: () => {} })}
      </div>
    </div>
  }
}

export { IndicatorLayer }
