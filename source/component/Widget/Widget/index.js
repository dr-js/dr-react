import React, { PureComponent, createElement } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import { color } from 'source/style/color'
import { WIDGET_SHAPE_TYPE } from 'source/state/widget/type/shape'

import {
  getRectTransformStyle,
  getElbowAnchorTransformStyle,
  getElbowAnchorEndTransformStyle
} from './DOM'

const WidgetDiv = styled.div`
  position: absolute;
  cursor: pointer;
  &.select { cursor: move; }
  &.lock.select { cursor: not-allowed; }
  
  &.rect { background: rgba(0, 0, 255, 1); }
  &.line { background: rgba(255, 0, 0, 1); }
  &.elbow {
    pointer-events: none;
    & > div {
      pointer-events: auto;
      position: absolute;
      background: rgba(50, 50, 0, 1);
    }
    & > .head,
    & > .tail { background: rgba(0, 50, 0, 1); }
    &.select > div { cursor: move; }
    &.lock.select > div { cursor: not-allowed; }
  }
  
  /* debug style */
  &.rect { background: rgba(0, 0, 255, 0.2); }
  &.line { background: rgba(255, 0, 0, 0.2); }
  &.elbow {
    & > div { background: rgba(50, 50, 0, 0.2); }
    & > .head,
    & > .tail { background: rgba(0, 50, 0, 0.6); }
  }
  /* debug style */
  
  /* special style */
  &.line-link {
    padding: 0 4px;
    background: ${color.text};
    background-clip: content-box;
    &::before,
    &::after {
      content: '';
      position: absolute;
      left: 50%;
    }
    &::before {
      top: 0;
      transform: translateX(-50%);
      width: 9px;
      height: 7px;
      border: 4px solid transparent;
      border-top-width: 0;
      border-bottom: 7px solid ${color.text};
      background: transparent;
    }
    &::after {
      bottom: 0;
      transform: translate(-50%, 50%);
      width: 9px;
      height: 9px;
      border-radius: 100%;
      background: ${color.text};
    }

    &.select {
      background: ${color.primary};
      background-clip: content-box;
      &::before { border-bottom-color: ${color.primary}; }
      &::after { background: ${color.primary}; }
    }
  }
  &.rect-canvas {
    background: ${color.border};
    &.select { box-shadow: 0 6px 20px 0 rgba(0, 0, 0, 0.1); }
  }
  &.rect-text {
    background: transparent;
  }
  &.elbow-link {
    & > .horizontal { padding: 4px 5px 4px 4px; }
    & > .vertical { padding: 4px 4px 5px 4px; }
    & > div { background: ${color.text}; background-clip: content-box; }
    & > .head { border-radius: 100%; background: ${color.text}; }
    & > .tail {
      background: transparent;
      border: 4px solid transparent;
      &.left {
        border-left-width: 2px;
        border-right: 7px solid ${color.text};
        margin-left: 3px;
      }
      &.right {
        border-left: 7px solid ${color.text};
        border-right-width: 2px;
        margin-left: -3px;
      }
      &.up {
        border-top-width: 2px;
        border-bottom: 7px solid ${color.text};
        margin-top: 3px;
      }
      &.down {
        border-top: 7px solid ${color.text};
        border-bottom-width: 2px;
        margin-top: -3px;
      }
    }
    &.select {
      & > div { background: ${color.primary}; background-clip: content-box; }
      & > .head { background: ${color.primary}; }
      & > .tail {
        &.left { border-right-color: ${color.primary}; }
        &.right { border-left-color: ${color.primary}; }
        &.up { border-bottom-color: ${color.primary}; }
        &.down { border-top-color: ${color.primary}; }
      }
    }
  }
`

const setPackRef = (props, elementRef) => props && props.pack.setRef(props.widget.id, elementRef)

const widgetPropTypes = {
  widget: PropTypes.object,
  isSelect: PropTypes.bool,
  pack: PropTypes.shape({
    zoom: PropTypes.number,
    isLock: PropTypes.bool,
    setRef: PropTypes.func,
    setExternalLockWidgetId: PropTypes.func
  })
}

class WidgetRect extends PureComponent {
  static propTypes = widgetPropTypes

  constructor (props) {
    super(props)

    this.setRef = (ref) => (this.elementRef = ref)
    this.elementRef = null
  }

  componentDidMount () { setPackRef(this.props, this.elementRef) }

  componentWillUnmount () { setPackRef(this.props, null) }

  render () {
    const { widget, isSelect, pack: { zoom, isLock } } = this.props
    return <WidgetDiv {...{
      ref: this.setRef,
      className: `rect ${isSelect ? ' select' : ''} ${isLock ? 'lock' : ''}`,
      style: getRectTransformStyle(widget, zoom)
    }} />
  }
}

class WidgetLine extends PureComponent {
  static propTypes = widgetPropTypes

  constructor (props) {
    super(props)

    this.setRef = (ref) => (this.elementRef = ref)
    this.elementRef = null
  }

  componentDidMount () { setPackRef(this.props, this.elementRef) }

  componentWillUnmount () { setPackRef(this.props, null) }

  render () {
    const { widget, isSelect, pack: { zoom, isLock } } = this.props
    return <WidgetDiv {...{
      ref: this.setRef,
      className: `line ${isSelect ? ' select' : ''} ${isLock ? 'lock' : ''}`,
      style: getRectTransformStyle(widget, zoom)
    }} />
  }
}

class WidgetElbow extends PureComponent {
  static propTypes = widgetPropTypes

  constructor (props) {
    super(props)

    this.setRef = (ref) => (this.elementRef = ref)
    this.elementRef = null
  }

  componentDidMount () { setPackRef(this.props, this.elementRef) }

  componentWillUnmount () { setPackRef(this.props, null) }

  render () {
    const { widget, isSelect, pack: { zoom, isLock } } = this.props
    return <WidgetDiv {...{
      ref: this.setRef,
      className: `elbow ${isSelect ? ' select' : ''} ${isLock ? 'lock' : ''}`,
      style: getRectTransformStyle(widget, zoom)
    }}>
      <WidgetElbowAnchorList {...{ widget, zoom }} />
    </WidgetDiv>
  }
}

const WidgetElbowAnchorList = ({ widget: { anchors, width }, zoom }) => {
  let prevAnchor = null
  return anchors.reduce((o, v, i) => {
    if (prevAnchor) o.unshift(<div key={i} style={getElbowAnchorTransformStyle(prevAnchor, v, width, zoom)} />)
    prevAnchor = v
    return o
  }, [
    <div key="head" className="head" style={getElbowAnchorEndTransformStyle(anchors[ 0 ], width, zoom)} />,
    <div key="tail" className="tail" style={getElbowAnchorEndTransformStyle(anchors[ anchors.length - 1 ], width, zoom)} />
  ])
}
WidgetElbowAnchorList.propTypes = {
  widget: PropTypes.object,
  zoom: PropTypes.number
}

const WIDGET_MAP = {
  [ WIDGET_SHAPE_TYPE.RECT ]: WidgetRect,
  [ WIDGET_SHAPE_TYPE.LINE ]: WidgetLine,
  [ WIDGET_SHAPE_TYPE.ELBOW ]: WidgetElbow
}
const renderWidget = (widget, isSelect, pack) => createElement(WIDGET_MAP[ widget.shape ], { key: widget.id, widget, isSelect, pack })

export {
  WidgetRect,
  WidgetLine,
  WidgetElbow,
  renderWidget
}
