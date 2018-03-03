import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import { color } from 'source/style/color'
import { HOVER_TARGET_TYPE_LIST, HOVER_ENABLED_HANDLE_SHAPE_MAP_MAP } from 'source/widget/type/hover'
import { STYLE_DISPLAY_NONE, getRectTransformStyle } from 'source/component/Widget/DOM'

const HOVER_TARGET_RECT_SIZE = '8px'
const HOVER_TARGET_MASK_SIZE = '32px'

const HoverTargetLayerDiv = styled.div`
  position: absolute;
  box-shadow: 0 0 0 1px ${color.primary};
`

const EditHoverTargetDiv = styled.div`
  pointer-events: auto;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  height: ${HOVER_TARGET_MASK_SIZE};
  width: ${HOVER_TARGET_MASK_SIZE};
  margin: calc(${HOVER_TARGET_MASK_SIZE} * -0.5);
  border-radius: calc(${HOVER_TARGET_MASK_SIZE} * 0.5);
  &::after {
    content: '';
    width: ${HOVER_TARGET_RECT_SIZE};
    height: ${HOVER_TARGET_RECT_SIZE};
    box-shadow: inset 0 0 0 1px ${color.primary};
    border-radius: 100%;
    background: #fff;
  }

  &.n { cursor: n-resize; top: 0; left: 50%; }
  &.s { cursor: s-resize; bottom: 0; left: 50%; }
  &.e { cursor: e-resize; right: 0; top: 50%; }
  &.w { cursor: w-resize; left: 0; top: 50%; }
  &.ne { cursor: ne-resize; right: 0; top: 0; }
  &.nw { cursor: nw-resize; left: 0; top: 0; }
  &.se { cursor: se-resize; right: 0; bottom: 0; }
  &.sw { cursor: sw-resize; left: 0; bottom: 0; }

  &.any-rect,
  &.any-rect-outline {
    top: 0;
    left: 0;
    &::after { display: none; }
  }
  &.any-rect {
    width: 100%;
    height: 100%;
    margin: 0;
    border-radius: 0;
  }
  &.any-rect-outline {
    width: calc(100% + ${HOVER_TARGET_MASK_SIZE});
    height: calc(100% + ${HOVER_TARGET_MASK_SIZE});
  }
`

class HoverTargetLayer extends PureComponent {
  static propTypes = {
    zoom: PropTypes.number.isRequired,
    handleType: PropTypes.string,
    hoverWidget: PropTypes.object,
    setHoverTargetElement: PropTypes.func.isRequired
  }

  constructor (props) {
    super(props)

    this.hoverTargetComponentMap = HOVER_TARGET_TYPE_LIST.reduce((o, name) => {
      o[ name ] = <EditHoverTargetDiv
        key={name}
        innerRef={(ref) => this.props.setHoverTargetElement(name, ref)}
        className={name}
      />
      return o
    }, {})
  }

  render () {
    const { zoom, handleType, hoverWidget } = this.props
    const style = hoverWidget ? getRectTransformStyle(hoverWidget, zoom) : STYLE_DISPLAY_NONE
    const hoverTargetTypeList = hoverWidget && HOVER_ENABLED_HANDLE_SHAPE_MAP_MAP[ handleType ][ hoverWidget.shape ]

    return <HoverTargetLayerDiv style={style}>{
      hoverTargetTypeList && hoverTargetTypeList.length
        ? hoverTargetTypeList.map((hoverTargetType) => this.hoverTargetComponentMap[ hoverTargetType ])
        : null
    }</HoverTargetLayerDiv>
  }
}

export { HoverTargetLayer }
