import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import { objectMerge } from 'dr-js/module/common/immutable/Object'

import { transformCache, delayArgvQueue } from 'source/function'
import { color } from 'source/style/color'
import { ZOOM_IN, ZOOM_OUT, reduceZoomAt } from 'source/state/editorZoom'

import { getScrollContextStyle, CANCEL_MOUSE_DRAG, createMouseDragEventListenerMap } from './function'

const RootLayerDiv = styled.div`
  z-index: 0; /* z-context-main */
  overflow: hidden;
  outline: none;
  width: 100%;
  height: 100%;

  /*
  Do Not Test this in Chrome when console is open, the cursor may not change
  https://stackoverflow.com/questions/44162825/bug-wrong-behavior-involving-console-active-selectors-and-cursor
  */
  &.cursor-grab { cursor: grab; }
  &.cursor-grabbing { cursor: grabbing; }
`

const OffsetLayerDiv = styled.div`
  overflow: visible;
  position: absolute;
  top: 0;
  left: 0;

  &.cursor-grab, 
  &.cursor-grabbing { pointer-events: none; }
`

const ScrollLayerDiv = styled.div`
  overflow: auto;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`

const RootContextLayerDiv = styled.div`
  overflow: hidden;
  position: relative;
  background: ${color.background};
`

const CounterOffsetLayerDiv = styled.div`
  overflow: visible;
  position: absolute;
`

class ScrollLayer extends PureComponent {
  static propTypes = {
    zoom: PropTypes.number,
    viewport: PropTypes.object,
    centerOffset: PropTypes.object,

    allowScroll: PropTypes.bool,
    setRef: PropTypes.func,
    onChange: PropTypes.func, // set { zoom, centerOffset, viewport }
    onDragEnable: PropTypes.func,
    onDragDisable: PropTypes.func,

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

    this.updateZoomAtDelayed = delayArgvQueue((argvQueue) => {
      const [ clientX, clientY, isReduceZoomValue ] = argvQueue[ argvQueue.length - 1 ]
      const { zoom, viewport, centerOffset, onChange } = this.props
      onChange(reduceZoomAt({ zoom, viewport, centerOffset }, { clientX, clientY }, isReduceZoomValue))
    })
    this.updateCenterOffsetDelayed = delayArgvQueue((argvQueue) => {
      const [ deltaX, deltaY ] = argvQueue.reduce((o, [ deltaX, deltaY ]) => {
        o[ 0 ] += deltaX
        o[ 1 ] += deltaY
        return o
      }, [ 0, 0 ])
      this.updateCenterOffset(deltaX, deltaY)
    })

    this.doResetCenterOffset = () => this.props.onChange({ centerOffset: { x: 0, y: 0 } })

    this.editorEventMap = {
      onWheel: (event) => {
        const { deltaX, deltaY, shiftKey, ctrlKey, metaKey, clientX, clientY } = event
        if (deltaY && (ctrlKey || metaKey)) { // zoom
          const isReduceZoomValue = deltaY < 0 ? ZOOM_IN : ZOOM_OUT
          this.updateZoomAtDelayed(clientX, clientY, isReduceZoomValue)
        } else { // scroll
          if (shiftKey) this.updateCenterOffsetDelayed(deltaY, deltaX)
          else this.updateCenterOffsetDelayed(deltaX, deltaY)
        }
        event.preventDefault()
        event.stopPropagation()
      },
      ...createMouseDragEventListenerMap({
        onDragEnable: () => {
          if (!this.props.allowScroll) return CANCEL_MOUSE_DRAG // cancel if currently in selection
          this.props.onDragEnable()
          this.setState({ cursorClassName: 'cursor-grab' })
        },
        onDragDisable: () => {
          this.props.onDragDisable()
          this.setState({ cursorClassName: '' })
        },
        onDragBegin: () => { this.setState({ cursorClassName: 'cursor-grabbing' }) },
        onDragEnd: () => { this.setState({ cursorClassName: 'cursor-grab' }) },
        onDragUpdate: this.updateCenterOffsetDelayed
      })
    }

    this.setRef = (ref) => {
      this.elementRef = ref
      this.props.setRef && this.props.setRef(ref)
    }
    this.elementRef = null

    this.state = { cursorClassName: '' }
  }

  updateCenterOffset (deltaX, deltaY) {
    const { zoom, centerOffset, onChange } = this.props
    const nextCenterOffset = objectMerge(centerOffset, {
      x: centerOffset.x + deltaX / zoom,
      y: centerOffset.y + deltaY / zoom
    })
    nextCenterOffset !== centerOffset && onChange({ centerOffset: nextCenterOffset })
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

    return <RootLayerDiv ref={this.setRef} className={cursorClassName || ''} {...this.editorEventMap}>
      <OffsetLayerDiv className={cursorClassName || ''} style={style}>
        {children}
      </OffsetLayerDiv>
    </RootLayerDiv>
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
        onDragUpdate: this.updateCenterOffsetDelayed
      })
    }

    this.getScrollContextStyleCached = transformCache(getScrollContextStyle)

    this.setScrollElementRef = (ref) => (this.scrollElement = ref)
    this.scrollElement = null
  }

  updateCenterOffset (deltaX, deltaY) {
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
    const { contextStyle, counterOffsetStyle } = this.getScrollContextStyleCached(boundRect, zoom, viewport)

    return <RootLayerDiv ref={this.setRef} className={`${cursorClassName || ''} ${className || ''}`} {...this.editorEventMap}>
      <ScrollLayerDiv ref={this.setScrollElementRef}>
        <RootContextLayerDiv style={contextStyle}>
          <CounterOffsetLayerDiv style={counterOffsetStyle}>
            {children}
          </CounterOffsetLayerDiv>
        </RootContextLayerDiv>
      </ScrollLayerDiv>
    </RootLayerDiv>
  }
}

const ScrollLayerStatic = ({ boundRect, zoom, children }) => {
  const { contextStyle, counterOffsetStyle } = getScrollContextStyle(boundRect, zoom)
  return <RootContextLayerDiv style={contextStyle}>
    <CounterOffsetLayerDiv style={counterOffsetStyle}>
      {children}
    </CounterOffsetLayerDiv>
  </RootContextLayerDiv>
}
ScrollLayerStatic.propTypes = {
  boundRect: PropTypes.object,
  zoom: PropTypes.number,
  children: PropTypes.node
}

export {
  ScrollLayer,
  ScrollLayerBounded,
  ScrollLayerStatic
}
