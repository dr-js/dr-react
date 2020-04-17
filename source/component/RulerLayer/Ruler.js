import { PureComponent } from 'react'
import PropTypes from 'prop-types'

import { transformCache } from 'source/function'

import {
  getOffscreenCanvasElement,
  getDeviceScale,
  prepareFontContext,
  prepareBufferContext,
  updateHorizontalBuffer,
  updateVerticalBuffer,
  calcValueLowBoundForGroup,
  calcValueHighBoundForGroup
} from './function'
import { getSizeFromZoom } from './zoom'

const RULER_TAG_OFFSET_PX = 4 // px

class RulerBase extends PureComponent {
  static propTypes = {
    className: PropTypes.string
  }

  constructor (props) {
    super(props)

    this.onResize = () => {
      this.updateCanvasMetric()
      this.updateCanvas()
    }

    this.updateBufferCanvasMetric = null
    this.bufferCanvasElement = getOffscreenCanvasElement()
    this.bufferCanvasContext = this.bufferCanvasElement.getContext('2d')
    this.canvasMetrics = null

    this.setRef = (ref) => {
      this.canvasElement = ref
      this.canvasContext = ref && ref.getContext('2d')
    }
    this.canvasElement = null
    this.canvasContext = null
  }

  updateCanvasMetric () {
    if (!this.canvasElement) return
    const deviceScale = getDeviceScale()
    const boundingRect = this.canvasElement.getBoundingClientRect()
    this.canvasMetrics = {
      deviceScale,
      pxX: boundingRect.width,
      pxY: boundingRect.height,
      canvasWidth: boundingRect.width * deviceScale,
      canvasHeight: boundingRect.height * deviceScale
    }
    this.canvasElement.width = Math.ceil(boundingRect.width * deviceScale)
    this.canvasElement.height = Math.ceil(boundingRect.height * deviceScale)
  }

  updateCanvas () { throw new Error('[RulerBase][updateCanvas] should not use base method') }

  componentDidMount () {
    window.addEventListener('resize', this.onResize)
    this.onResize()
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.onResize)
  }

  componentDidUpdate () { this.updateCanvas() }

  render () {
    const { className } = this.props
    return <canvas ref={this.setRef} className={className || ''}>Canvas is not supported</canvas>
  }
}

class RulerHorizontal extends RulerBase {
  static propTypes = {
    ...RulerBase.propTypes,
    zoom: PropTypes.number,
    valueX: PropTypes.number
  }

  constructor (props) {
    super(props)

    this.updateBufferCanvasMetric = transformCache((bufferCanvasElement, bufferCanvasContext, canvasWidth, canvasHeight, deviceScale, unitSize, groupSize, zoom) => {
      const pixelPerGroup = unitSize * groupSize * zoom * deviceScale
      const bufferCanvasWidth = Math.floor(calcValueHighBoundForGroup(canvasWidth, pixelPerGroup) + pixelPerGroup)
      // __DEV__ && console.log('[RulerHorizontal] updateBufferCanvasMetric')
      prepareBufferContext(bufferCanvasElement, bufferCanvasContext, bufferCanvasWidth, canvasHeight, deviceScale)
      updateHorizontalBuffer(bufferCanvasContext, bufferCanvasWidth, canvasHeight, deviceScale, unitSize, groupSize, zoom)
    })
  }

  updateCanvas () {
    if (!this.canvasContext) return
    const { zoom, valueX } = this.props
    const { deviceScale, pxX, canvasWidth, canvasHeight } = this.canvasMetrics
    const { unitSize, groupSize } = getSizeFromZoom(zoom)
    const valuePerGroup = unitSize * groupSize
    const zoomDeviceScale = zoom * deviceScale
    // update buffer if needed
    this.updateBufferCanvasMetric(this.bufferCanvasElement, this.bufferCanvasContext, canvasWidth, canvasHeight, deviceScale, unitSize, groupSize, zoom)
    // __DEV__ && console.log('[RulerHorizontal] updateCanvas', { zoom, valueX })
    const fromValueX = calcValueLowBoundForGroup(valueX, valuePerGroup)
    const toValueX = calcValueHighBoundForGroup(valueX + pxX / zoom, valuePerGroup)
    // draw background & lines
    this.canvasContext.drawImage(this.bufferCanvasElement, Math.round((fromValueX - valueX) * zoomDeviceScale), 0)
    // draw numbers
    const canvasHeightHalf = Math.round(canvasHeight * 0.5)
    const rulerTagOffsetPixel = Math.round(RULER_TAG_OFFSET_PX * deviceScale)
    prepareFontContext(this.canvasContext, deviceScale)
    for (let currentValueX = fromValueX; currentValueX <= toValueX; currentValueX += valuePerGroup) {
      const devicePixelX = Math.round((currentValueX - valueX) * zoomDeviceScale)
      this.canvasContext.fillText(`${Math.round(currentValueX)}`, devicePixelX + rulerTagOffsetPixel, canvasHeightHalf)
    }
  }
}

const ROTATE_VERTICAL = -Math.PI / 2

class RulerVertical extends RulerBase {
  static propTypes = {
    ...RulerBase.propTypes,
    zoom: PropTypes.number,
    valueY: PropTypes.number
  }

  constructor (props) {
    super(props)

    this.updateBufferCanvasMetric = transformCache((bufferCanvasElement, bufferCanvasContext, canvasWidth, canvasHeight, deviceScale, unitSize, groupSize, zoom) => {
      const pixelPerGroup = unitSize * groupSize * zoom * deviceScale
      const bufferCanvasHeight = Math.floor(calcValueHighBoundForGroup(canvasHeight, pixelPerGroup) + pixelPerGroup)
      // __DEV__ && console.log('[RulerVertical] updateBufferCanvasMetric')
      prepareBufferContext(bufferCanvasElement, bufferCanvasContext, canvasWidth, bufferCanvasHeight, deviceScale)
      updateVerticalBuffer(bufferCanvasContext, canvasWidth, bufferCanvasHeight, deviceScale, unitSize, groupSize, zoom)
    })
  }

  updateCanvas () {
    if (!this.canvasContext) return
    const { zoom, valueY } = this.props
    const { deviceScale, pxY, canvasWidth, canvasHeight } = this.canvasMetrics
    const { unitSize, groupSize } = getSizeFromZoom(zoom)
    const valuePerGroup = unitSize * groupSize
    const zoomDeviceScale = zoom * deviceScale
    // update buffer if needed
    this.updateBufferCanvasMetric(this.bufferCanvasElement, this.bufferCanvasContext, canvasWidth, canvasHeight, deviceScale, unitSize, groupSize, zoom)
    // __DEV__ && console.log('[RulerVertical] updateCanvas', { zoom, valueY })
    const fromValueY = calcValueLowBoundForGroup(valueY, valuePerGroup)
    const toValueY = calcValueHighBoundForGroup(valueY + pxY / zoom, valuePerGroup)
    // draw background & lines
    this.canvasContext.drawImage(this.bufferCanvasElement, 0, Math.round((fromValueY - valueY) * zoomDeviceScale))
    // draw numbers
    const canvasWidthHalf = Math.round(canvasWidth * 0.5)
    const rulerTagOffsetPixel = Math.round(RULER_TAG_OFFSET_PX * deviceScale)
    prepareFontContext(this.canvasContext, deviceScale)
    for (let currentValueY = fromValueY; currentValueY <= toValueY; currentValueY += valuePerGroup) {
      const devicePixelY = Math.round((currentValueY - valueY) * zoomDeviceScale)
      this.canvasContext.save()
      this.canvasContext.translate(canvasWidthHalf, devicePixelY)
      this.canvasContext.rotate(ROTATE_VERTICAL)
      this.canvasContext.fillText(`${Math.round(currentValueY)}`, rulerTagOffsetPixel, 0)
      this.canvasContext.restore()
    }
  }
}

export {
  RulerHorizontal,
  RulerVertical
}
