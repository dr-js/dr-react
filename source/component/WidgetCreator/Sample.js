import { createElement } from 'react'

import { WidgetRect, WidgetLine, WidgetElbow } from 'source/component/Widget'
import { WIDGET_SHAPE_TYPE } from 'source/widget/type/shape'

const SAMPLE_MAP = {
  [ WIDGET_SHAPE_TYPE.RECT ]: WidgetRect,
  [ WIDGET_SHAPE_TYPE.LINE ]: WidgetLine,
  [ WIDGET_SHAPE_TYPE.ELBOW ]: WidgetElbow
}
const renderSample = (widget, isSelect, pack) => createElement(SAMPLE_MAP[ widget.shape ], { key: widget.id, widget, isSelect, pack })

export { renderSample }
