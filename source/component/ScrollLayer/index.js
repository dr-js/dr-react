import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { objectMerge } from 'dr-js/module/common/immutable/ImmutableOperation'
import { debounceByAnimationFrame } from 'dr-js/module/browser/DOM'

import { immutableTransformCache } from 'source/__dev__'
import { ZOOM_IN, ZOOM_OUT, reduceZoomAt } from 'source/state/editorZoom'

import LocalClassName from './index.pcss'
const CSS_SCROLL_LAYER = LocalClassName[ 'scroll-layer' ]
const CSS_SCROLL_CONTEXT_LAYER = LocalClassName[ 'scroll-context-layer' ]

class ScrollLayer extends PureComponent {
  static propTypes = {
    zoom: PropTypes.number,
    viewport: PropTypes.object,
    centerOffset: PropTypes.object,

    allowScroll: PropTypes.bool,
    setRef: PropTypes.func,
    onChange: PropTypes.func, // set { zoom, centerOffset, viewport }

    className: PropTypes.string,
    children: PropTypes.node
  }

  constructor (props) {
    super(props)

    this.updateViewport = () => {
      if (!this.elementRef) return
      const { onChange, viewport } = this.props
      const { left, top, width, height } = this.elementRef.getBoundingClientRect()
      const nextViewport = objectMerge(viewport, { left, top, width, height })
      nextViewport !== viewport && onChange({ viewport: nextViewport })
    }

    this.updateZoomAtDebounced = debounceByAnimationFrame((argvQueue) => {
      const [ clientX, clientY, isReduceZoomValue ] = argvQueue[ argvQueue.length - 1 ]

      const { zoom, viewport, centerOffset, onChange } = this.props
      onChange(reduceZoomAt({ zoom, viewport, centerOffset }, { clientX, clientY }, isReduceZoomValue))
    })
    this.updateCenterOffsetDebounced = debounceByAnimationFrame((argvQueue) => {
      const [ deltaX, deltaY ] = argvQueue.reduce((o, [ deltaX, deltaY ]) => {
        o[ 0 ] += deltaX
        o[ 1 ] += deltaY
        return o
      }, [ 0, 0 ])

      const { zoom, centerOffset, onChange } = this.props
      const nextCenterOffset = objectMerge(centerOffset, {
        x: centerOffset.x + deltaX / zoom,
        y: centerOffset.y + deltaY / zoom
      })
      nextCenterOffset !== centerOffset && onChange({ centerOffset: nextCenterOffset })
    })

    this.doResetCenterOffset = () => this.props.onChange({ centerOffset: { x: 0, y: 0 } })

    this.editorEventMap = {
      onWheel: (event) => {
        const { deltaX, deltaY, shiftKey, ctrlKey, metaKey, clientX, clientY } = event
        if (deltaY && (ctrlKey || metaKey)) { // zoom
          const isReduceZoomValue = deltaY < 0 ? ZOOM_IN : ZOOM_OUT
          this.updateZoomAtDebounced(clientX, clientY, isReduceZoomValue)
        } else { // scroll
          if (shiftKey) this.updateCenterOffsetDebounced(deltaY, deltaX)
          else this.updateCenterOffsetDebounced(deltaX, deltaY)
        }
        event.preventDefault()
        event.stopPropagation()
      },
      ...createMouseDragEventListenerMap({
        onDragEnable: () => {
          if (!this.props.allowScroll) return CANCEL_MOUSE_DRAG // cancel if currently in selection
          this.setState({ cursorClassName: 'cursor-grab' })
        },
        onDragDisable: () => {
          this.setState({ cursorClassName: '' })
        },
        onDragBegin: () => { this.setState({ cursorClassName: 'cursor-grabbing' }) },
        onDragEnd: () => { this.setState({ cursorClassName: 'cursor-grab' }) },
        onDragUpdate: this.updateCenterOffsetDebounced
      })
    }

    this.setRef = (ref) => {
      this.elementRef = ref
      this.props.setRef && this.props.setRef(ref)
    }
    this.elementRef = null

    this.state = { cursorClassName: '' }
  }

  componentDidMount () {
    window.addEventListener('resize', this.updateViewport)
    this.updateViewport()
    this.elementRef && this.elementRef.focus()
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.updateViewport)
  }

  render () {
    const { zoom, centerOffset: { x, y }, children } = this.props
    const { cursorClassName } = this.state
    // const style = { transform: `translate(${Math.round(-x * zoom)}px, ${Math.round(-y * zoom)}px)` } // TODO: might be faster with transform && will-change
    const style = { left: `${Math.round(-x * zoom)}px`, top: `${Math.round(-y * zoom)}px` }

    return <div ref={this.setRef} className={`${CSS_SCROLL_LAYER} ${cursorClassName || ''}`} {...this.editorEventMap}>
      <div className="offset-layer" style={style}>
        {children}
      </div>
    </div>
  }
}

class ScrollLayerBounded extends ScrollLayer {
  static propTypes = {
    ...ScrollLayer.propTypes,
    boundRect: PropTypes.object // { position, size }
  }

  constructor (props) {
    super(props)

    this.editorEventMap = {
      ...this.editorEventMap,
      ...createMouseDragEventListenerMap({
        isSkipKeySpaceDown: true,
        onDragBegin: () => { this.setState({ cursorClassName: 'cursor-grabbing' }) },
        onDragEnd: () => { this.setState({ cursorClassName: 'cursor-grab' }) },
        onDragUpdate: this.updateCenterOffsetDebounced
      })
    }

    this.setScrollElementRef = (ref) => (this.scrollElement = ref)
    this.scrollElement = null
  }

  updateCenterOffset (deltaX = 0, deltaY = 0) {
    const { onChange, zoom, centerOffset } = this.props
    const { scrollWidth, scrollHeight, clientWidth, clientHeight } = this.scrollElement
    const ratio = 1 / zoom
    const nextCenterOffset = objectMerge(centerOffset, {
      x: Math.min(Math.max(centerOffset.x + deltaX * ratio, 0), (scrollWidth - clientWidth) * ratio),
      y: Math.min(Math.max(centerOffset.y + deltaY * ratio, 0), (scrollHeight - clientHeight) * ratio)
    })
    nextCenterOffset !== centerOffset && onChange({ centerOffset: nextCenterOffset })
  }

  componentDidUpdate (prevProps, prevState) {
    if (
      prevProps.zoom !== this.props.zoom ||
      prevProps.centerOffset !== this.props.centerOffset
    ) {
      const { zoom, centerOffset: { x, y } } = this.props
      this.scrollElement.scrollLeft = Math.round(x * zoom)
      this.scrollElement.scrollTop = Math.round(y * zoom)
    }
  }

  render () {
    const { boundRect, zoom, viewport, className, children } = this.props
    const { cursorClassName } = this.state
    const { contextStyle, counterOffsetStyle } = getScrollContextStyle(boundRect, zoom, viewport)

    return <div ref={this.setRef} className={`${CSS_SCROLL_LAYER} ${cursorClassName || ''} ${className || ''}`} {...this.editorEventMap}>
      <div ref={this.setScrollElementRef} className="scroll-layer">
        <div className={CSS_SCROLL_CONTEXT_LAYER} style={contextStyle}>
          <div className="counter-offset-layer" style={counterOffsetStyle}>
            {children}
          </div>
        </div>
      </div>
    </div>
  }
}

const ScrollLayerStatic = ({ boundRect, zoom, children }) => {
  const { contextStyle, counterOffsetStyle } = getScrollContextStyle(boundRect, zoom)
  return <div className={CSS_SCROLL_CONTEXT_LAYER} style={contextStyle}>
    <div className="counter-offset-layer" style={counterOffsetStyle}>
      {children}
    </div>
  </div>
}
ScrollLayerStatic.propTypes = {
  boundRect: PropTypes.object,
  zoom: PropTypes.number,
  children: PropTypes.node
}

const SCROLL_CONTEXT_PADDING_SIZE = 240 // px
const getScrollContextStyle = immutableTransformCache((boundRect, zoom, viewport = null) => {
  const { center, size } = boundRect
  const width = Math.round(size.x * zoom + SCROLL_CONTEXT_PADDING_SIZE * 2)
  const height = Math.round(size.y * zoom + SCROLL_CONTEXT_PADDING_SIZE * 2)
  const fillLeft = viewport ? Math.round((viewport.width - width) * 0.5) : 0
  const fillTop = viewport ? Math.round((viewport.height - height) * 0.5) : 0
  const offsetLeft = Math.round(SCROLL_CONTEXT_PADDING_SIZE - (center.x - size.x * 0.5) * zoom)
  const offsetTop = Math.round(SCROLL_CONTEXT_PADDING_SIZE - (center.y - size.y * 0.5) * zoom)
  return {
    contextStyle: {
      width: `${width}px`,
      height: `${height}px`,
      minWidth: `${width}px`,
      minHeight: `${height}px`,
      left: fillLeft > 0 ? `${fillLeft}px` : '',
      top: fillTop > 0 ? `${fillTop}px` : ''
    },
    counterOffsetStyle: {
      left: `${offsetLeft}px`,
      top: `${offsetTop}px`
    }
  }
})

const CANCEL_MOUSE_DRAG = 'CANCEL_MOUSE_DRAG'

const createMouseDragEventListenerMap = ({ onDragEnable, onDragDisable, onDragBegin, onDragUpdate, onDragEnd, isSkipKeySpaceDown = false }) => {
  let isKeySpaceDown = isSkipKeySpaceDown
  let isMouseMiddleButtonDown = false
  let isMouseDrag = false
  let prevClientX = 0
  let prevClientY = 0

  return {
    tabIndex: 0,
    ...(isSkipKeySpaceDown ? null : {
      onKeyDown: (event) => {
        if (event.key !== ' ' || isKeySpaceDown) return
        const result = onDragEnable && onDragEnable()
        if (result === CANCEL_MOUSE_DRAG) return
        event.preventDefault()
        isKeySpaceDown = true
      },
      onKeyUp: () => {
        if (!isKeySpaceDown) return
        onDragDisable && onDragDisable()
        isKeySpaceDown = false
        isMouseDrag = false
      },
      onBlur: () => {
        if (!isKeySpaceDown) return
        onDragDisable && onDragDisable()
        isKeySpaceDown = false
        isMouseDrag = false
      }
    }),
    onMouseDown: (event) => {
      if (!isKeySpaceDown && event.button !== 1) return // also allow middle mouse button dragging
      if (!isKeySpaceDown && event.button === 1) {
        const result = onDragEnable && onDragEnable()
        if (result === CANCEL_MOUSE_DRAG) return
        isMouseMiddleButtonDown = true
      }
      const result = onDragBegin && onDragBegin()
      if (result === CANCEL_MOUSE_DRAG) return
      event.preventDefault()
      event.stopPropagation()
      isMouseDrag = true
      prevClientX = event.clientX
      prevClientY = event.clientY
    },
    onMouseMove: (event) => {
      if ((!isKeySpaceDown && !isMouseMiddleButtonDown) || !isMouseDrag) return
      const result = onDragUpdate && onDragUpdate(prevClientX - event.clientX, prevClientY - event.clientY)
      if (result === CANCEL_MOUSE_DRAG) return
      event.preventDefault()
      event.stopPropagation()
      prevClientX = event.clientX
      prevClientY = event.clientY
    },
    onMouseUp: (event) => {
      if ((!isKeySpaceDown && !isMouseMiddleButtonDown) || !isMouseDrag) return
      onDragEnd && onDragEnd()
      isMouseDrag = false
      if (!isKeySpaceDown && isMouseMiddleButtonDown) {
        onDragDisable && onDragDisable()
        isMouseMiddleButtonDown = false
      }
    }
  }
}

export {
  ScrollLayer,
  ScrollLayerBounded,
  ScrollLayerStatic
}
