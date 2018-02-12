import React, { PureComponent, createElement } from 'react'
import PropTypes from 'prop-types'

import { WIDGET_SHAPE_TYPE } from 'source/widget/type/shape'

import {
  getRectTransformStyle,
  getElbowAnchorTransformStyle,
  getElbowAnchorEndTransformStyle
} from './DOM'

import LocalClassName from './index.pcss'
const CSS_WIDGET = LocalClassName[ 'widget' ]

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
    const className = `${CSS_WIDGET} rect ${isSelect ? ' select' : ''} ${isLock ? 'lock' : ''}`
    return <div {...{ ref: this.setRef, style: getRectTransformStyle(widget, zoom), className }} />
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
    const className = `${CSS_WIDGET} line ${isSelect ? ' select' : ''} ${isLock ? 'lock' : ''}`
    return <div {...{ ref: this.setRef, style: getRectTransformStyle(widget, zoom), className }} />
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
    const className = `${CSS_WIDGET} elbow ${isSelect ? ' select' : ''} ${isLock ? 'lock' : ''}`
    return <div {...{ ref: this.setRef, style: getRectTransformStyle(widget, zoom), className }}>
      <WidgetElbowAnchorList {...{ widget, zoom }} />
    </div>
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
