import { fromWidget as lineFromWidget } from 'dr-js/module/common/geometry/D2/line'
import { fromLine as widgetFromLine } from 'dr-js/module/common/geometry/D2/widget'

import { HANDLE_TYPE } from '../type/handle'

const calcWidgetLineResizeHandleDelta = (widget, handleType, { x, y }) => {
  const line = lineFromWidget(widget)
  switch (handleType) {
    case HANDLE_TYPE.TOP_FREE:
    case HANDLE_TYPE.TOP_FREE_LINK:
      line.begin.x += x
      line.begin.y += y
      break
    case HANDLE_TYPE.BOTTOM_FREE:
    case HANDLE_TYPE.BOTTOM_FREE_LINK:
      line.end.x += x
      line.end.y += y
      break
  }
  return widgetFromLine(line, widget.size.x, widget)
}
const calcWidgetLineResizeHandleAt = (widget, handleType, handleAt) => {
  const line = lineFromWidget(widget)
  switch (handleType) {
    case HANDLE_TYPE.TOP_FREE:
    case HANDLE_TYPE.TOP_FREE_LINK:
      line.begin = handleAt
      break
    case HANDLE_TYPE.BOTTOM_FREE:
    case HANDLE_TYPE.BOTTOM_FREE_LINK:
      line.end = handleAt
      break
  }
  return widgetFromLine(line, widget.size.x, widget)
}

export {
  calcWidgetLineResizeHandleDelta,
  calcWidgetLineResizeHandleAt
}
