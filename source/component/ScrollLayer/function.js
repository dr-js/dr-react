const SCROLL_CONTEXT_PADDING_SIZE = 240 // px
const getScrollContextStyle = (boundRect, zoom, viewport = null) => {
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
}

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
  getScrollContextStyle,
  CANCEL_MOUSE_DRAG,
  createMouseDragEventListenerMap
}
