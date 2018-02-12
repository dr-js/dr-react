import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'

import { HOVER_TARGET_TYPE_LIST, HOVER_ENABLED_HANDLE_SHAPE_MAP_MAP } from 'source/widget/type/hover'
import { STYLE_DISPLAY_NONE, getRectTransformStyle } from 'source/component/Widget/DOM'

import LocalClassName from './hover-target-layer.pcss'
const CSS_HOVER_TARGET_LAYER = LocalClassName[ 'hover-target-layer' ]

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
      o[ name ] = <div
        key={name}
        ref={(ref) => this.props.setHoverTargetElement(name, ref)}
        className={`edit-hover-target ${name}`}
      />
      return o
    }, {})
  }

  render () {
    const { zoom, handleType, hoverWidget } = this.props
    const style = hoverWidget ? getRectTransformStyle(hoverWidget, zoom) : STYLE_DISPLAY_NONE
    const hoverTargetTypeList = hoverWidget && HOVER_ENABLED_HANDLE_SHAPE_MAP_MAP[ handleType ][ hoverWidget.shape ]

    return <div className={CSS_HOVER_TARGET_LAYER} style={style}>{
      hoverTargetTypeList && hoverTargetTypeList.length
        ? hoverTargetTypeList.map((hoverTargetType) => this.hoverTargetComponentMap[ hoverTargetType ])
        : null
    }</div>
  }
}

export { HoverTargetLayer }
