import React from 'react'
import PropTypes from 'prop-types'

import { RulerHorizontal, RulerVertical } from './Ruler'

import LocalClassName from './index.pcss'
const CSS_RULER = LocalClassName[ 'ruler' ]

const RulerLayer = ({ zoom, valueX, valueY, onClick, className, children }) => {
  const isActive = (valueX !== 0 || valueY !== 0)
  return <div className={`${CSS_RULER} ${className || ''}`}>
    <button className={`ruler-intersection ${isActive ? 'active' : ''}`} onClick={isActive ? onClick : null} disabled={!isActive} />
    <RulerHorizontal className="ruler-horizontal" zoom={zoom} valueX={valueX} />
    <RulerVertical className="ruler-vertical" zoom={zoom} valueY={valueY} />
    <div className="ruler-content">
      {children}
    </div>
  </div>
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
