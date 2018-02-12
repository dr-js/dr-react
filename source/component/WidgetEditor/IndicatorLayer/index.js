import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'

import { STYLE_DISPLAY_NONE, getBoundingRectTransformStyle } from 'source/component/Widget/DOM'

import { HoverTargetLayer } from './HoverTargetLayer'
import { HandleLayer } from './HandleLayer'
import { SnapLayer } from './SnapLayer'

import LocalClassName from './index.pcss'
const CSS_INDICATOR_LAYER = LocalClassName[ 'indicator-layer' ]

class IndicatorLayer extends PureComponent {
  static propTypes = {
    zoom: PropTypes.number,

    rangeBoundingRect: PropTypes.object,
    handleType: PropTypes.string,
    snapDataList: PropTypes.array,
    previewBoundingRect: PropTypes.object,

    hoverWidget: PropTypes.object,
    singleSelectPreviewWidget: PropTypes.object,

    funcPack: PropTypes.shape({
      updateWidget: PropTypes.func.isRequired,
      setIndicatorLayerElement: PropTypes.func.isRequired,
      setHandleElement: PropTypes.func.isRequired,
      setHoverTargetElement: PropTypes.func.isRequired
    }).isRequired
  }

  render () {
    const {
      zoom,

      rangeBoundingRect,
      handleType,
      snapDataList,
      previewBoundingRect,

      hoverWidget,
      singleSelectPreviewWidget,

      funcPack: {
        updateWidget,
        setIndicatorLayerElement,
        setHandleElement,
        setHoverTargetElement
      }
    } = this.props

    return <div ref={setIndicatorLayerElement} className={CSS_INDICATOR_LAYER}>
      <HandleLayer {...{ zoom, singleSelectPreviewWidget, previewBoundingRect, setHandleElement, updateWidget }} />
      <HoverTargetLayer {...{ zoom, handleType, hoverWidget, setHoverTargetElement }} />
      <SnapLayer {...{ zoom, snapDataList, previewBoundingRect }} />
      <RangeLayer {...{ rangeBoundingRect }} />
    </div>
  }
}

const RangeLayer = ({ rangeBoundingRect }) => {
  const style = rangeBoundingRect
    ? getBoundingRectTransformStyle(rangeBoundingRect, 1)
    : STYLE_DISPLAY_NONE

  return <div className="select-range" style={style} />
}
RangeLayer.propTypes = {
  rangeBoundingRect: PropTypes.object
}

export { IndicatorLayer }
