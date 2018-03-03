import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import { color } from 'source/style/color'

import { RulerHorizontal, RulerVertical } from './Ruler'

// import LocalClassName from './index.pcss'
// const CSS_RULER = LocalClassName[ 'ruler' ]

const SIZE_RULER = '16px'

const RulerDiv = styled.div`
  & > .ruler-intersection,
  & > .ruler-horizontal,
  & > .ruler-vertical,
  & > .ruler-content {
    position: absolute;
    overflow: hidden;
  }
  & > .ruler-intersection {
    top: 0;
    left: 0;
    width: ${SIZE_RULER};
    height: ${SIZE_RULER};
    border: 0;
    border-right: 1px solid ${color.border};
    border-bottom: 1px solid ${color.border};
    background: ${color.background};
    transition: background 0.3s ease;
    &.active { background: ${color.text}; }
  }
  & > .ruler-horizontal {
    top: 0;
    left: ${SIZE_RULER};
    width: calc(100% - ${SIZE_RULER});
    height: ${SIZE_RULER};
    border-bottom: 1px solid ${color.border};
  }
  & > .ruler-vertical {
    top: ${SIZE_RULER};
    left: 0;
    width: ${SIZE_RULER};
    height: calc(100% - ${SIZE_RULER});
    border-right: 1px solid ${color.border};
  }
  & > .ruler-content {
    top: ${SIZE_RULER};
    left: ${SIZE_RULER};
    width: calc(100% - ${SIZE_RULER});
    height: calc(100% - ${SIZE_RULER});
  }
`

const RulerLayer = ({ zoom, valueX, valueY, onClick, className, children }) => {
  const isActive = (valueX !== 0 || valueY !== 0)
  return <RulerDiv className={className || ''}>
    <button className={`ruler-intersection ${isActive ? 'active' : ''}`} onClick={isActive ? onClick : null} disabled={!isActive} />
    <RulerHorizontal className="ruler-horizontal" zoom={zoom} valueX={valueX} />
    <RulerVertical className="ruler-vertical" zoom={zoom} valueY={valueY} />
    <div className="ruler-content">
      {children}
    </div>
  </RulerDiv>
}
RulerLayer.propTypes = {
  zoom: PropTypes.number,
  valueX: PropTypes.number,
  valueY: PropTypes.number,
  onClick: PropTypes.func,
  className: PropTypes.string,
  children: PropTypes.node
}

export { RulerLayer }
