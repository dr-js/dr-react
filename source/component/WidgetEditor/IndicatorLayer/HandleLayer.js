import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'

import { immutableTransformCache } from 'source/__dev__'

import { WIDGET_SHAPE_TYPE } from 'source/widget/type/shape'
import {
  HANDLE_TYPE,
  HANDLE_TYPE_LIST_MAP,
  getElbowAnchorHandleType
} from 'source/widget/type/handle'
import { calcElbowAnchorAdd, calcElbowAnchorDelete } from 'source/widget/math/elbow'
import {
  STYLE_DISPLAY_NONE,
  getBoundingRectTransformStyle,
  getRectTransformStyle,
  getElbowAnchorTransformStyle,
  getElbowAnchorEndTransformStyle
} from 'source/component/Widget/DOM'

import LocalClassName from './handle-layer.pcss'
const CSS_HANDLE_LAYER = LocalClassName[ 'handle-layer' ]

const KEY_EVENT_LIST = [ 'keypress', 'keydown', 'keyup' ]

class HandleLayer extends PureComponent {
  static propTypes = {
    zoom: PropTypes.number,
    singleSelectPreviewWidget: PropTypes.object,
    previewBoundingRect: PropTypes.object,
    setHandleElement: PropTypes.func.isRequired,
    updateWidget: PropTypes.func.isRequired
  }

  constructor (props) {
    super(props)

    this.handleComponentListMap = Object.keys(HANDLE_TYPE_LIST_MAP).reduce((o, shape) => {
      o[ shape ] = HANDLE_TYPE_LIST_MAP[ shape ].map((name) => <div
        key={name}
        ref={(ref) => this.props.setHandleElement(name, ref)}
        className={`edit-handle ${name}`}
      />)
      return o
    }, {})

    // TODO: move to reducer
    // TODO: debug this
    this.doElbowAnchorAdd = (widget, anchorIndex) => { this.props.updateWidget(calcElbowAnchorAdd(widget, anchorIndex)) }
    this.doElbowAnchorDelete = (widget, anchorIndex) => { this.props.updateWidget(calcElbowAnchorDelete(widget, anchorIndex)) }

    this.getSelectSingleWidgetCached = immutableTransformCache((widgetList, selectIdList) => {
      const selectSingleWidgetId = selectIdList.length === 1 && selectIdList[ 0 ]
      return selectSingleWidgetId && widgetList.find(({ id }) => id === selectSingleWidgetId)
    })

    this.keyEventListener = (event) => {
      const { altKey: isDeleteMode, shiftKey: isAddMode } = event
      this.setState({ isDeleteMode, isAddMode })
    }

    this.state = { isDeleteMode: false, isAddMode: false }
  }

  componentWillUnmount () {
    KEY_EVENT_LIST.forEach((eventType) => document.removeEventListener(eventType, this.keyEventListener))
  }

  componentDidUpdate () {
    const { singleSelectPreviewWidget } = this.props
    switch (singleSelectPreviewWidget && singleSelectPreviewWidget.shape) {
      case WIDGET_SHAPE_TYPE.ELBOW:
      case WIDGET_SHAPE_TYPE.ELBOW_LINK:
        KEY_EVENT_LIST.forEach((eventType) => document.addEventListener(eventType, this.keyEventListener))
        break
      default:
        KEY_EVENT_LIST.forEach((eventType) => document.removeEventListener(eventType, this.keyEventListener))
        break
    }
  }

  renderElbowHandleList ({ shape, anchors, width }, zoom) {
    const elbowHandleTypeList = HANDLE_TYPE_LIST_MAP[ shape ]
    const elbowHandleComponentList = this.handleComponentListMap[ shape ]

    const componentList = []
    checkPush(componentList, HANDLE_TYPE.MOVE, elbowHandleTypeList, elbowHandleComponentList)
    checkPush(componentList, HANDLE_TYPE.ROTATE, elbowHandleTypeList, elbowHandleComponentList)

    const anchorStart = 2
    const anchorEnd = anchors.length - 2
    let lastAnchor = null
    anchors.forEach((v, i) => {
      if (i >= anchorStart && i <= anchorEnd) {
        const handleIndex = elbowHandleTypeList.indexOf(getElbowAnchorHandleType(lastAnchor, v, i))
        handleIndex !== -1 && componentList.push(<div key={i} className="edit-handle-elbow-layer" style={getElbowAnchorTransformStyle(lastAnchor, v, width, zoom)}>
          {elbowHandleComponentList[ handleIndex ]}
        </div>)
      }
      lastAnchor = v
    })

    componentList.push(<div key="head" className="edit-handle-elbow-layer" style={getElbowAnchorEndTransformStyle(anchors[ 0 ], width, zoom)}>
      {elbowHandleComponentList[ elbowHandleTypeList.indexOf(shape === WIDGET_SHAPE_TYPE.ELBOW ? HANDLE_TYPE.ANCHOR_HEAD : HANDLE_TYPE.ANCHOR_HEAD_LINK) ]}
    </div>)// ANCHOR_HEAD / ANCHOR_HEAD_LINK
    componentList.push(<div key="tail" className="edit-handle-elbow-layer" style={getElbowAnchorEndTransformStyle(anchors[ anchors.length - 1 ], width, zoom)}>
      {elbowHandleComponentList[ elbowHandleTypeList.indexOf(shape === WIDGET_SHAPE_TYPE.ELBOW ? HANDLE_TYPE.ANCHOR_TAIL : HANDLE_TYPE.ANCHOR_TAIL_LINK) ]}
    </div>)// ANCHOR_TAIL / ANCHOR_TAIL_LINK

    return componentList
  }

  renderElbowHandleListDelete (widget, zoom) {
    const { anchors, width } = widget
    if (anchors.length <= 4) return null
    return anchors.map((anchor, index) => <div
      key={index}
      className="edit-handle elbow-delete"
      style={getElbowAnchorHandleTransformStyle(anchor, width, zoom)}
      onClick={() => this.doElbowAnchorDelete(widget, index)}
    />)
  }

  renderElbowHandleListAdd (widget, zoom) {
    const { anchors, width } = widget
    if (anchors.length >= 10) return null
    return anchors.map((anchor, index) => <div
      key={index}
      className="edit-handle elbow-add"
      style={getElbowAnchorHandleTransformStyle(anchor, width, zoom)}
      onClick={() => this.doElbowAnchorAdd(widget, index)}
    />)
  }

  renderWidgetHandle (singleSelectPreviewWidget, zoom) {
    switch (singleSelectPreviewWidget.shape) {
      case WIDGET_SHAPE_TYPE.ELBOW:
      case WIDGET_SHAPE_TYPE.ELBOW_LINK:
        const { isDeleteMode, isAddMode } = this.state
        if (isDeleteMode) return this.renderElbowHandleListDelete(singleSelectPreviewWidget, zoom)
        else if (isAddMode) return this.renderElbowHandleListAdd(singleSelectPreviewWidget, zoom)
        else return this.renderElbowHandleList(singleSelectPreviewWidget, zoom)
      default:
        return this.handleComponentListMap[ singleSelectPreviewWidget.shape ]
    }
  }

  renderRangeHandle () { return this.handleComponentListMap[ WIDGET_SHAPE_TYPE.RECT ] }

  render () {
    const { zoom, singleSelectPreviewWidget, previewBoundingRect } = this.props

    const borderClassName = !singleSelectPreviewWidget ? ''
      : WIDGET_SHAPE_LIST_WEAK_BORDER.includes(singleSelectPreviewWidget.shape) ? 'weak-border'
        : WIDGET_SHAPE_LIST_NO_BORDER.includes(singleSelectPreviewWidget.shape) ? 'no-border'
          : ''

    const style = singleSelectPreviewWidget ? getRectTransformStyle(singleSelectPreviewWidget, zoom)
      : previewBoundingRect ? getBoundingRectTransformStyle(previewBoundingRect, zoom)
        : STYLE_DISPLAY_NONE

    return <div className={`${CSS_HANDLE_LAYER} ${borderClassName}`} style={style}>
      {singleSelectPreviewWidget && this.renderWidgetHandle(singleSelectPreviewWidget, zoom)}
    </div>
  }
}

const WIDGET_SHAPE_LIST_WEAK_BORDER = [ WIDGET_SHAPE_TYPE.LINE, WIDGET_SHAPE_TYPE.LINE_LINK ]
const WIDGET_SHAPE_LIST_NO_BORDER = [ WIDGET_SHAPE_TYPE.ELBOW, WIDGET_SHAPE_TYPE.ELBOW_LINK ]
const checkPush = (componentList, handleType, elbowHandleTypeList, elbowHandleComponentList) => {
  const index = elbowHandleTypeList.indexOf(handleType)
  if (~index) componentList.push(elbowHandleComponentList[ index ])
}
const getElbowAnchorHandleTransformStyle = ({ x, y }, width, zoom) => ({
  transform: `translate(${[
    `${Math.round((x - width * 0.5) * zoom)}px`,
    `${Math.round((y - width * 0.5) * zoom)}px`
  ].join(',')})`
})

export { HandleLayer }
