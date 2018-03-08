import { objectMerge } from 'dr-js/module/common/immutable/Object'

const ZOOM_VALUE_LIST = [ 0.02, 0.05, 0.10, 0.15, 0.20, 0.30, 0.50, 0.75, 1.00, 1.50, 2.00, 3.00, 4.00, 5.00, 10.00, 20.00, 50.00 ]

const ZOOM_VALUE_MIN = ZOOM_VALUE_LIST[ 0 ]
const ZOOM_VALUE_MAX = ZOOM_VALUE_LIST[ ZOOM_VALUE_LIST.length - 1 ]

const ZOOM_IN = false
const ZOOM_OUT = true

// return null for invalid
const getNeighborZoom = (zoom, isReduceZoomValue = ZOOM_IN) => {
  let index = ZOOM_VALUE_LIST.indexOf(zoom)
  if (~index) index += isReduceZoomValue ? -1 : 1
  if (index < 0 || index >= ZOOM_VALUE_LIST.length) return null
  return ZOOM_VALUE_LIST[ index ]
}

const reduceZoomAt = (state, clientPoint, isReduceZoomValue) => {
  const { zoom, centerOffset, viewport: { left, top, width, height } } = state
  const {
    clientX = left + width * 0.5,
    clientY = top + height * 0.5
  } = clientPoint

  const nextZoom = getNeighborZoom(zoom, isReduceZoomValue)
  if (!ZOOM_VALUE_LIST.includes(nextZoom)) return state

  const deltaZoom = (1 / zoom - 1 / nextZoom)
  return objectMerge(state, {
    zoom: nextZoom,
    centerOffset: {
      x: centerOffset.x + (clientX - left) * deltaZoom,
      y: centerOffset.y + (clientY - top) * deltaZoom
    }
  })
}

export {
  ZOOM_VALUE_MIN,
  ZOOM_VALUE_MAX,
  ZOOM_IN,
  ZOOM_OUT,

  reduceZoomAt
}
