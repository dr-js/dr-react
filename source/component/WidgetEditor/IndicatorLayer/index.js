import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import { STYLE_DISPLAY_NONE, getBoundingRectTransformStyle } from 'source/component/Widget/DOM'

import { HoverTargetLayer } from './HoverTargetLayer'
import { HandleLayer } from './HandleLayer'
import { SnapLayer } from './SnapLayer'

const IndicatorLayerDiv = styled.div`
  pointer-events: none;
  z-index: 1; /* z-context-editor */
  overflow: visible;
  position: absolute;
  top: 0;
  left: 0;
`

const SelectRangeDiv = styled.div`
  position: absolute;
  background: rgba(255, 167, 57, 0.2);
  box-shadow: inset 0 0 0 1px rgba(255, 167, 57, 0.4);
`

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

    return <IndicatorLayerDiv innerRef={setIndicatorLayerElement}>
      <HandleLayer {...{ zoom, singleSelectPreviewWidget, previewBoundingRect, setHandleElement, updateWidget }} />
      <HoverTargetLayer {...{ zoom, handleType, hoverWidget, setHoverTargetElement }} />
      <SnapLayer {...{ zoom, snapDataList, previewBoundingRect }} />
      <RangeLayer {...{ rangeBoundingRect }} />
    </IndicatorLayerDiv>
  }
}

const RangeLayer = ({ rangeBoundingRect }) => <SelectRangeDiv style={
  rangeBoundingRect
    ? getBoundingRectTransformStyle(rangeBoundingRect, 1)
    : STYLE_DISPLAY_NONE
} />
RangeLayer.propTypes = {
  rangeBoundingRect: PropTypes.object
}

export { IndicatorLayer }
