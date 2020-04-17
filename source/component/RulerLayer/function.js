const { document } = window

// TODO: make configurable
const COLOR_BORDER = '#d9d9d9'
const COLOR_TEXT_60 = '#7d8695'

const RULER_BUFFER_LINE_WIDTH = 1
const RULER_BUFFER_LINE_FILL_STYLE = COLOR_BORDER
const RULER_BUFFER_FONT_FILL_STYLE = COLOR_TEXT_60
const RULER_BUFFER_BACKGROUND_FILL_STYLE = '#f5f5f7'
const GET_FONT = (deviceScale) => `${10 * deviceScale}px -apple-system, ".SFNSText-Regular", "SF UI Text", "Helvetica Neue", Arial, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "WenQuanYi Zen Hei", sans-serif`

const SINGLE_PX_LINE_FIX = -0.5

const getOffscreenCanvasElement = () => document.createElement('canvas')

const getDeviceScale = () => window.devicePixelRatio || 1 // how many physical pixel per `px`

const prepareFontContext = (canvasContext, deviceScale) => {
  canvasContext.font = GET_FONT(deviceScale)
  canvasContext.fillStyle = RULER_BUFFER_FONT_FILL_STYLE
  canvasContext.textBaseline = 'middle'
}

const prepareBufferContext = (canvasElement, canvasContext, canvasWidth, canvasHeight, deviceScale) => {
  canvasElement.width = canvasWidth
  canvasElement.height = canvasHeight
  // clear & set background
  canvasContext.fillStyle = RULER_BUFFER_BACKGROUND_FILL_STYLE
  canvasContext.fillRect(0, 0, canvasWidth, canvasHeight)
  // draw line
  canvasContext.lineWidth = RULER_BUFFER_LINE_WIDTH * deviceScale
  canvasContext.strokeStyle = RULER_BUFFER_LINE_FILL_STYLE
}

const updateHorizontalBuffer = (canvasContext, canvasWidth, canvasHeight, deviceScale, unitSize, groupSize, zoom) => {
  const canvasHeightPortion = Math.round(canvasHeight * 2 / 3)
  canvasHeight = Math.round(canvasHeight)
  const unitPixelSize = unitSize * zoom * deviceScale
  const groupPixelSize = groupSize * unitPixelSize
  const groupCount = Math.ceil(canvasWidth / groupPixelSize)
  let groupIndex = 0
  canvasContext.beginPath()
  while (groupIndex < groupCount) {
    const groupStartPixelX = groupIndex * groupPixelSize
    // group line (longer)
    const devicePixelX = Math.floor(groupStartPixelX) + SINGLE_PX_LINE_FIX
    canvasContext.moveTo(devicePixelX, canvasHeight)
    canvasContext.lineTo(devicePixelX, 0)
    // unit line (shorter)
    for (let unitIndex = 1; unitIndex < groupSize; unitIndex++) {
      const devicePixelX = Math.floor(groupStartPixelX + unitIndex * unitPixelSize) + SINGLE_PX_LINE_FIX
      canvasContext.moveTo(devicePixelX, canvasHeight)
      canvasContext.lineTo(devicePixelX, canvasHeightPortion)
    }
    groupIndex++
  }
  canvasContext.stroke()
  canvasContext.closePath()
}

const updateVerticalBuffer = (canvasContext, canvasWidth, canvasHeight, deviceScale, unitSize, groupSize, zoom) => {
  const canvasWidthPortion = Math.round(canvasWidth * 2 / 3)
  canvasWidth = Math.round(canvasWidth)
  const unitPixelSize = unitSize * zoom * deviceScale
  const groupPixelSize = groupSize * unitPixelSize
  const groupCount = Math.ceil(canvasHeight / groupPixelSize)
  let groupIndex = 0
  canvasContext.beginPath()
  while (groupIndex < groupCount) {
    const groupStartPixelY = groupIndex * groupPixelSize
    // group line (longer)
    const devicePixelY = Math.floor(groupStartPixelY) + SINGLE_PX_LINE_FIX
    canvasContext.moveTo(canvasWidth, devicePixelY)
    canvasContext.lineTo(0, devicePixelY)
    // unit line (shorter)
    for (let unitIndex = 1; unitIndex < groupSize; unitIndex++) {
      const devicePixelY = Math.floor(groupStartPixelY + unitIndex * unitPixelSize) + SINGLE_PX_LINE_FIX
      canvasContext.moveTo(canvasWidth, devicePixelY)
      canvasContext.lineTo(canvasWidthPortion, devicePixelY)
    }
    groupIndex++
  }
  canvasContext.stroke()
  canvasContext.closePath()
}

const calcValueLowBoundForGroup = (value, valuePerGroup) => (value - (value % valuePerGroup + valuePerGroup) % valuePerGroup)
const calcValueHighBoundForGroup = (value, valuePerGroup) => (value - (value % valuePerGroup - valuePerGroup) % valuePerGroup)

export {
  getOffscreenCanvasElement,
  getDeviceScale,
  prepareFontContext,
  prepareBufferContext,
  updateHorizontalBuffer,
  updateVerticalBuffer,
  calcValueLowBoundForGroup,
  calcValueHighBoundForGroup
}
