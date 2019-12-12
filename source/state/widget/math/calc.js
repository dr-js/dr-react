import { objectMerge, objectSet } from '@dr-js/core/module/common/immutable/Object'
import { roundFloat } from '@dr-js/core/module/common/math/base'
import { add, round } from '@dr-js/core/module/common/geometry/D2/Vector'
import { fromPoint as widgetFromPoint, fromLine as widgetFromLine } from '@dr-js/core/module/common/geometry/D2/Widget'

import { WIDGET_SHAPE_TYPE } from '../type/shape'
import { HANDLE_TYPE, ELBOW_ANCHOR_INFO_MAP, isHandleApplicable } from '../type/handle'
import { getWidgetShift } from './hover'

import { calcWidgetRectResizeHandleDelta } from './rect'
import { calcWidgetLineResizeHandleDelta, calcWidgetLineResizeHandleAt } from './line'
import { calcWidgetElbowResizeHandleDelta, calcWidgetElbowResizeHandleAt, calcWidgetElbowResizeBind, fromPoint as widgetElbowFromPoint } from './elbow'

const PI_DOUBLE = Math.PI * 2

const LINE_HANDLE_SET = new Set([
  HANDLE_TYPE.TOP_FREE,
  HANDLE_TYPE.BOTTOM_FREE,
  HANDLE_TYPE.TOP_FREE_LINK,
  HANDLE_TYPE.BOTTOM_FREE_LINK
])
const ELBOW_ANCHOR_HANDLE_SET = new Set(Object.keys(ELBOW_ANCHOR_INFO_MAP))

const calcWidgetResizeHandleDelta = (widget, { handleType, pointDelta, rotateDelta }) => {
  if (!isHandleApplicable(widget, handleType)) return widget
  if (handleType === HANDLE_TYPE.MOVE) return objectSet(widget, 'center', objectMerge(widget.center, round(add(widget.center, pointDelta))))
  if (handleType === HANDLE_TYPE.ROTATE) return objectSet(widget, 'rotate', roundFloat((widget.rotate + rotateDelta) % PI_DOUBLE))
  if (LINE_HANDLE_SET.has(handleType)) return calcWidgetLineResizeHandleDelta(widget, handleType, pointDelta)
  if (ELBOW_ANCHOR_HANDLE_SET.has(handleType)) return calcWidgetElbowResizeHandleDelta(widget, handleType, pointDelta)
  return calcWidgetRectResizeHandleDelta(widget, handleType, pointDelta)
}

const calcWidgetBindShift = (widget, previewWidgetDataMap) => {
  switch (widget.shape) {
    case WIDGET_SHAPE_TYPE.LINE:
    case WIDGET_SHAPE_TYPE.LINE_LINK:
    case WIDGET_SHAPE_TYPE.ELBOW:
      Object.keys(widget.bindData).forEach((id) => {
        const { previewWidget: targetWidget } = previewWidgetDataMap[ id ]
        widget = Object.entries(widget.bindData[ id ]).reduce((o, [ handleType, targetShift ]) => {
          if (!isHandleApplicable(o, handleType)) return o
          const handleAt = getWidgetShift(targetWidget, targetShift)
          if (LINE_HANDLE_SET.has(handleType)) return calcWidgetLineResizeHandleAt(o, handleType, handleAt)
          if (ELBOW_ANCHOR_HANDLE_SET.has(handleType)) return calcWidgetElbowResizeHandleAt(o, handleType, handleAt)
        }, widget)
      })
      return widget
    case WIDGET_SHAPE_TYPE.ELBOW_LINK: {
      let headBindInfo = null
      let tailBindInfo = null
      Object.keys(widget.bindData).forEach((id) => {
        const { previewWidget: targetWidget } = previewWidgetDataMap[ id ]
        Object.entries(widget.bindData[ id ]).forEach(([ handleType, targetShift ]) => {
          if (handleType === HANDLE_TYPE.ANCHOR_HEAD_LINK) headBindInfo = { targetWidget, targetShift }
          if (handleType === HANDLE_TYPE.ANCHOR_TAIL_LINK) tailBindInfo = { targetWidget, targetShift }
        })
      })
      return (headBindInfo || tailBindInfo) ? calcWidgetElbowResizeBind(widget, headBindInfo, tailBindInfo) : widget
    }
  }

  return widget // TODO: no rect bind yet
}

const calcWidgetFromDataAndPoint = (data, pointFrom, pointTo) => {
  switch (data.shape) {
    case WIDGET_SHAPE_TYPE.RECT:
      return widgetFromPoint(pointFrom, pointTo, data)
    case WIDGET_SHAPE_TYPE.LINE:
      return widgetFromLine({ begin: pointFrom, end: pointTo }, data.width, data)
    case WIDGET_SHAPE_TYPE.ELBOW:
      return widgetElbowFromPoint(pointFrom, pointTo, data)
  }
  throw new Error(`[calcWidgetFromDataAndPoint] invalid data.shape: ${data.shape}`)
}

export {
  calcWidgetResizeHandleDelta,
  calcWidgetBindShift,
  calcWidgetFromDataAndPoint
}
