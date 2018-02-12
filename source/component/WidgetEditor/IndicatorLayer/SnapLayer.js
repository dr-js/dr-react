import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'

import { SNAP_TYPE } from 'source/widget/type/snap'
import { formatSnapBoundingRect } from 'source/widget/math/snap'

import LocalClassName from './snap-layer.pcss'
const CSS_SNAP_LAYER = LocalClassName[ 'snap-layer' ]

class SnapLayer extends PureComponent {
  static propTypes = {
    zoom: PropTypes.number,
    snapDataList: PropTypes.array,
    previewBoundingRect: PropTypes.object
  }

  render () {
    const { zoom, snapDataList, previewBoundingRect } = this.props
    if (!snapDataList.length || !previewBoundingRect) return null

    const snapBoundingRect = formatSnapBoundingRect(previewBoundingRect) // round to integer
    const snapIndicatorState = snapDataList.reduce((o, snapData) => reduceSnapIndicatorState(o, snapData, snapBoundingRect), INITIAL_SNAP_INDICATOR_STATE)

    return <div className={CSS_SNAP_LAYER}>
      {renderSnapIndicatorData(snapIndicatorState, zoom)}
    </div>
  }
}

const SNAP_X_TYPE_SET = new Set([ SNAP_TYPE.X_MIN, SNAP_TYPE.X_MID, SNAP_TYPE.X_MAX ])
const SNAP_Y_TYPE_SET = new Set([ SNAP_TYPE.Y_MIN, SNAP_TYPE.Y_MID, SNAP_TYPE.Y_MAX ])
const SNAP_EXTEND_HORIZONTAL_TYPE_SET = new Set([ SNAP_TYPE.GAP_EXT_LEFT, SNAP_TYPE.GAP_EXT_RIGHT, SNAP_TYPE.GAP_MID_X ])
const SNAP_EXTEND_VERTICAL_TYPE_SET = new Set([ SNAP_TYPE.GAP_EXT_TOP, SNAP_TYPE.GAP_EXT_BOTTOM, SNAP_TYPE.GAP_MID_Y ])

const INITIAL_SNAP_INDICATOR_STATE = {
  // merge min fromY & max toY
  [ SNAP_TYPE.X_MIN ]: { x: null, fromY: Infinity, toY: -Infinity },
  [ SNAP_TYPE.X_MID ]: { x: null, fromY: Infinity, toY: -Infinity },
  [ SNAP_TYPE.X_MAX ]: { x: null, fromY: Infinity, toY: -Infinity },

  [ SNAP_TYPE.Y_MIN ]: { y: null, fromX: Infinity, toX: -Infinity },
  [ SNAP_TYPE.Y_MID ]: { y: null, fromX: Infinity, toX: -Infinity },
  [ SNAP_TYPE.Y_MAX ]: { y: null, fromX: Infinity, toX: -Infinity },

  // only keep min offset && min sumLength
  X_EXT: { offset: Infinity, sumLength: Infinity, indicatorY: null, leftFromX: null, leftToX: null, rightFromX: null, RightToX: null },
  Y_EXT: { offset: Infinity, sumLength: Infinity, indicatorX: null, topFromY: null, topToY: null, bottomFromY: null, bottomToY: null }
}

const reduceSnapIndicatorState = (snapIndicatorState, snapData, { left, right, top, bottom }) => {
  const { type } = snapData
  if (SNAP_X_TYPE_SET.has(type)) {
    const { boundingRect } = snapData
    const x = type === SNAP_TYPE.X_MIN ? boundingRect.left
      : type === SNAP_TYPE.X_MAX ? boundingRect.right
        : boundingRect.centerX
    const indicatorType = x === left ? SNAP_TYPE.X_MIN
      : x === right ? SNAP_TYPE.X_MAX
        : SNAP_TYPE.X_MID
    const { fromY, toY } = snapIndicatorState[ indicatorType ]
    return { ...snapIndicatorState, [ indicatorType ]: { x, fromY: Math.min(fromY, boundingRect.top, top), toY: Math.max(toY, boundingRect.bottom, bottom) } }
  }

  if (SNAP_Y_TYPE_SET.has(type)) {
    const { boundingRect } = snapData
    const y = type === SNAP_TYPE.Y_MIN ? boundingRect.top
      : type === SNAP_TYPE.Y_MAX ? boundingRect.bottom
        : boundingRect.centerY
    const indicatorType = y === top ? SNAP_TYPE.Y_MIN
      : y === bottom ? SNAP_TYPE.Y_MAX
        : SNAP_TYPE.Y_MID
    const { fromX, toX } = snapIndicatorState[ indicatorType ]
    return { ...snapIndicatorState, [ indicatorType ]: { y, fromX: Math.min(fromX, boundingRect.left, left), toX: Math.max(toX, boundingRect.right, right) } }
  }

  if (SNAP_EXTEND_HORIZONTAL_TYPE_SET.has(type)) {
    const { boundingRectLeft, boundingRectRight, gapSize } = snapData
    const indicatorY = Math.max(bottom, boundingRectLeft.bottom, boundingRectRight.bottom)
    const offset = indicatorY - bottom
    if (snapIndicatorState.X_EXT.offset < offset) return snapIndicatorState // use closest
    const [ leftFromX, leftToX, rightFromX, RightToX ] = type === SNAP_TYPE.GAP_EXT_LEFT
      ? [ boundingRectLeft.left - gapSize, boundingRectLeft.left, boundingRectLeft.right, boundingRectRight.left ]
      : type === SNAP_TYPE.GAP_EXT_RIGHT
        ? [ boundingRectLeft.right, boundingRectRight.left, boundingRectRight.right, boundingRectRight.right + gapSize ]
        : [ boundingRectLeft.right, left, right, boundingRectRight.left ]
    if (leftFromX >= leftToX || rightFromX >= RightToX) return snapIndicatorState // there may be result snap bigger widget to the center of two smaller widget GAP_MID_X
    const sumLength = RightToX - leftFromX
    __DEV__ && console.assert(offset >= 0 && sumLength > 0)
    if (snapIndicatorState.X_EXT.offset === offset && snapIndicatorState.X_EXT.sumLength <= sumLength) return snapIndicatorState // use valid and smallest sum length
    return { ...snapIndicatorState, X_EXT: { offset, sumLength, indicatorY, leftFromX, leftToX, rightFromX, RightToX } }
  }

  if (SNAP_EXTEND_VERTICAL_TYPE_SET.has(type)) {
    const { boundingRectTop, boundingRectBottom, gapSize } = snapData
    const indicatorX = Math.max(right, boundingRectTop.right, boundingRectBottom.right)
    const offset = indicatorX - right
    if (snapIndicatorState.Y_EXT.offset < offset) return snapIndicatorState // use closest
    const [ topFromY, topToY, bottomFromY, bottomToY ] = type === SNAP_TYPE.GAP_EXT_TOP
      ? [ boundingRectTop.top - gapSize, boundingRectTop.top, boundingRectTop.bottom, boundingRectBottom.top ]
      : type === SNAP_TYPE.GAP_EXT_BOTTOM
        ? [ boundingRectTop.bottom, boundingRectBottom.top, boundingRectBottom.bottom, boundingRectBottom.bottom + gapSize ]
        : [ boundingRectTop.bottom, top, bottom, boundingRectBottom.top ]
    if (topFromY >= topToY || bottomFromY >= bottomToY) return snapIndicatorState // there may be result snap bigger widget to the center of two smaller widget GAP_MID_Y
    const sumLength = bottomToY - topFromY
    __DEV__ && console.assert(offset >= 0 && sumLength > 0)
    if (snapIndicatorState.Y_EXT.offset === offset && snapIndicatorState.Y_EXT.sumLength <= sumLength) return snapIndicatorState // use valid and smallest sum length
    return { ...snapIndicatorState, Y_EXT: { offset, sumLength, indicatorX, topFromY, topToY, bottomFromY, bottomToY } }
  }

  throw new Error(`[reduceSnapIndicatorState] error snapData type: ${type}`)
}

const EXT_INDICATOR_OFFSET = 6
const renderSnapIndicatorData = (snapIndicatorState, zoom) => {
  const componentList = []
  const preZoom = 1 / zoom // on screen length 1 before zoom

  SNAP_X_TYPE_SET.forEach((type) => {
    if (snapIndicatorState[ type ].x === null) return
    const { x, fromY, toY } = snapIndicatorState[ type ]
    componentList.push(renderIndicatorVertical(type !== SNAP_TYPE.X_MAX ? x : x - preZoom, type !== SNAP_TYPE.X_MID, fromY, toY, zoom, type))
  })

  SNAP_Y_TYPE_SET.forEach((type) => {
    if (snapIndicatorState[ type ].y === null) return
    const { y, fromX, toX } = snapIndicatorState[ type ]
    componentList.push(renderIndicatorHorizontal(type !== SNAP_TYPE.Y_MAX ? y : y - preZoom, type !== SNAP_TYPE.Y_MID, fromX, toX, zoom, type))
  })

  if (snapIndicatorState.X_EXT.offset !== Infinity) {
    const { indicatorY, leftFromX, leftToX, rightFromX, RightToX } = snapIndicatorState.X_EXT
    componentList.push(renderIndicatorHorizontal(indicatorY + EXT_INDICATOR_OFFSET * preZoom, false, leftFromX, leftToX, zoom, 'X_EXT|0'))
    componentList.push(renderIndicatorHorizontal(indicatorY + EXT_INDICATOR_OFFSET * preZoom, false, rightFromX, RightToX, zoom, 'X_EXT|1'))
  }

  if (snapIndicatorState.Y_EXT.offset !== Infinity) {
    const { indicatorX, topFromY, topToY, bottomFromY, bottomToY } = snapIndicatorState.Y_EXT
    componentList.push(renderIndicatorVertical(indicatorX + EXT_INDICATOR_OFFSET * preZoom, false, topFromY, topToY, zoom, 'Y_EXT|0'))
    componentList.push(renderIndicatorVertical(indicatorX + EXT_INDICATOR_OFFSET * preZoom, false, bottomFromY, bottomToY, zoom, 'Y_EXT|1'))
  }

  return componentList
}

const renderIndicatorHorizontal = (y, isDashed, fromX, toX, zoom, key) => <div {...{
  key,
  className: `snap-indicator horizontal ${isDashed ? 'dashed' : ''}`,
  style: {
    transform: `translate(${Math.round(fromX * zoom)}px, ${Math.round(y * zoom)}px)`,
    width: `${Math.round((toX - fromX) * zoom)}px`
  }
}} />

const renderIndicatorVertical = (x, isDashed, fromY, toY, zoom, key) => <div {...{
  key,
  className: `snap-indicator vertical ${isDashed ? 'dashed' : ''}`,
  style: {
    transform: `translate(${Math.round(x * zoom)}px, ${Math.round(fromY * zoom)}px)`,
    height: `${Math.round((toY - fromY) * zoom)}px`
  }
}} />

export {
  SnapLayer
}
