import React, { createElement } from 'react'

import { WidgetRect, WidgetLine, WidgetElbow } from 'source/component/Widget'
import { WIDGET_SHAPE_TYPE } from 'source/widget/type/shape'

import LocalClassName from './sample.pcss'
const CSS_SAMPLE = LocalClassName[ 'sample' ]

const SampleWidgetLineLink = () => <div className={CSS_SAMPLE}><span>widget-line-link</span></div>
const SampleWidgetRectCanvas = () => <div className={CSS_SAMPLE}><span>widget-rect-canvas</span></div>
const SampleWidgetRectText = () => <div className={CSS_SAMPLE}><span>widget-rect-text</span></div>
const SampleWidgetElbowLink = () => <div className={CSS_SAMPLE}><span>widget-elbow-link</span></div>

const SAMPLE_MAP = {
  [ WIDGET_SHAPE_TYPE.LINE_LINK ]: SampleWidgetLineLink,
  [ WIDGET_SHAPE_TYPE.RECT_CANVAS ]: SampleWidgetRectCanvas,
  [ WIDGET_SHAPE_TYPE.RECT_TEXT ]: SampleWidgetRectText,
  [ WIDGET_SHAPE_TYPE.ELBOW_LINK ]: SampleWidgetElbowLink,

  // DEV
  [ WIDGET_SHAPE_TYPE.RECT ]: WidgetRect,
  [ WIDGET_SHAPE_TYPE.LINE ]: WidgetLine,
  [ WIDGET_SHAPE_TYPE.ELBOW ]: WidgetElbow
}
const renderSample = (widget, isSelect, pack) => createElement(SAMPLE_MAP[ widget.shape ], { key: widget.id, widget, isSelect, pack })

export { renderSample }
