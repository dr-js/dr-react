import React, { createElement } from 'react'
import styled from 'styled-components'

import { color } from 'source/style/color'
import { WidgetRect, WidgetLine, WidgetElbow } from 'source/component/Widget'
import { WIDGET_SHAPE_TYPE } from 'source/widget/type/shape'

const SampleDiv = styled.div`
  width: 100%;
  height: 100%;
  pointer-events: none;
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: center;
  &.sample-button { pointer-events: auto; }

  & > i {
    font-size: 26px;
    color: ${color.text};
  }

  & > span {
    margin-top: 4px;
    font-size: 12px;
    color: rgba(39, 54, 77, 0.60);
  }
`

const SampleWidgetLineLink = () => <SampleDiv><span>widget-line-link</span></SampleDiv>
const SampleWidgetRectCanvas = () => <SampleDiv><span>widget-rect-canvas</span></SampleDiv>
const SampleWidgetRectText = () => <SampleDiv><span>widget-rect-text</span></SampleDiv>
const SampleWidgetElbowLink = () => <SampleDiv><span>widget-elbow-link</span></SampleDiv>

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
