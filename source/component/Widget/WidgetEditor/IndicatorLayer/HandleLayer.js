import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import { transformCache } from 'source/__dev__'
import { color } from 'source/style/color'
import { WIDGET_SHAPE_TYPE } from 'source/state/widget/type/shape'
import {
  HANDLE_TYPE,
  HANDLE_TYPE_LIST_MAP,
  getElbowAnchorHandleType
} from 'source/state/widget/type/handle'
import { calcElbowAnchorAdd, calcElbowAnchorDelete } from 'source/state/widget/math/elbow'
import {
  STYLE_DISPLAY_NONE,
  getBoundingRectTransformStyle,
  getRectTransformStyle,
  getElbowAnchorTransformStyle,
  getElbowAnchorEndTransformStyle
} from 'source/component/Widget/Widget/DOM'

const HANDLE_OFFSET = '24px'
const HANDLE_MASK_SIZE = '16px'
const HANDLE_RECT_SIZE = '8px'
const HANDLE_CIRCLE_SIZE = '8px'

const HandleLayerDiv = styled.div`
  position: absolute;
  box-shadow: inset 0 0 0 1px ${color.primary};
  &.no-border { box-shadow: none; }
  &.weak-border { box-shadow: inset 0 0 0 1px rgba(255, 0, 0, 0.2); }
`

const EditHandleDiv = styled.div`
  pointer-events: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  width: ${HANDLE_MASK_SIZE};
  height: ${HANDLE_MASK_SIZE};
  margin: calc(${HANDLE_MASK_SIZE} * -0.5);
  z-index: 1;
  &::after {
    content: '';
    width: ${HANDLE_RECT_SIZE};
    height: ${HANDLE_RECT_SIZE};
    box-shadow: inset 0 0 0 1px ${color.primary};
    background: #fff;
  }

  &.begin::after,
  &.end::after,
  &.rotate::after,
  &.anchor::after {
    width: ${HANDLE_CIRCLE_SIZE};
    height: ${HANDLE_CIRCLE_SIZE};
    border-radius: 100%;
  }

  /*
  &.rotate::after { background: #ff9; }
  &.begin::after, &.end::after { background: #f9f; }
  */

  &.anchor {
    cursor: move;
    top: 50%;
    left: 50%;
    &.x { cursor: col-resize; }
    &.y { cursor: row-resize; }
    &.head, &.tail { cursor: pointer; }
    /* &.head::after, &.tail::after { background: #9ff; } */
  }
  &.move { display: none; }
  &.rotate { cursor: pointer; top: calc(${HANDLE_OFFSET} * -1); left: 50%; }
  &.width { cursor: w-resize; left: 0; top: 50%; }
  &.begin { cursor: pointer; top: 0; left: 50%; }
  &.end { cursor: pointer; bottom: 0; left: 50%; }
  &.n { cursor: n-resize; top: 0; left: 50%; }
  &.s { cursor: s-resize; bottom: 0; left: 50%; }
  &.e { cursor: e-resize; right: 0; top: 50%; }
  &.w { cursor: w-resize; left: 0; top: 50%; }
  &.ne { cursor: ne-resize; right: 0; top: 0; }
  &.nw { cursor: nw-resize; left: 0; top: 0; }
  &.se { cursor: se-resize; right: 0; bottom: 0; }
  &.sw { cursor: sw-resize; left: 0; bottom: 0; }
`

/* &.elbow-add,
&.elbow-delete {
  pointer-events: auto;
  position: absolute;
  &::after { width: ${HANDLE_RECT_SIZE}; height: ${HANDLE_RECT_SIZE}; }
}
&.elbow-add::after { content: '+'; }
&.elbow-delete::after { content: '-'; } */

const EditHandleElbowLayerDiv = styled.div`
  pointer-events: none;
  position: absolute;
`

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
      o[ shape ] = HANDLE_TYPE_LIST_MAP[ shape ].map((name) => <EditHandleDiv
        key={name}
        ref={(ref) => this.props.setHandleElement(name, ref)}
        className={name}
      />)
      return o
    }, {})

    // TODO: move to reducer
    // TODO: debug this
    this.doElbowAnchorAdd = (widget, anchorIndex) => { this.props.updateWidget(calcElbowAnchorAdd(widget, anchorIndex)) }
    this.doElbowAnchorDelete = (widget, anchorIndex) => { this.props.updateWidget(calcElbowAnchorDelete(widget, anchorIndex)) }

    this.getSelectSingleWidgetCached = transformCache((widgetList, selectIdList) => {
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
        handleIndex !== -1 && componentList.push(<EditHandleElbowLayerDiv key={i} style={getElbowAnchorTransformStyle(lastAnchor, v, width, zoom)}>
          {elbowHandleComponentList[ handleIndex ]}
        </EditHandleElbowLayerDiv>)
      }
      lastAnchor = v
    })

    componentList.push(<EditHandleElbowLayerDiv key="head" style={getElbowAnchorEndTransformStyle(anchors[ 0 ], width, zoom)}>
      {elbowHandleComponentList[ elbowHandleTypeList.indexOf(shape === WIDGET_SHAPE_TYPE.ELBOW ? HANDLE_TYPE.ANCHOR_HEAD : HANDLE_TYPE.ANCHOR_HEAD_LINK) ]}
    </EditHandleElbowLayerDiv>)// ANCHOR_HEAD / ANCHOR_HEAD_LINK
    componentList.push(<EditHandleElbowLayerDiv key="tail" style={getElbowAnchorEndTransformStyle(anchors[ anchors.length - 1 ], width, zoom)}>
      {elbowHandleComponentList[ elbowHandleTypeList.indexOf(shape === WIDGET_SHAPE_TYPE.ELBOW ? HANDLE_TYPE.ANCHOR_TAIL : HANDLE_TYPE.ANCHOR_TAIL_LINK) ]}
    </EditHandleElbowLayerDiv>)// ANCHOR_TAIL / ANCHOR_TAIL_LINK

    return componentList
  }

  renderElbowHandleListDelete (widget, zoom) {
    const { anchors, width } = widget
    if (anchors.length <= 4) return null
    return anchors.map((anchor, index) => <EditHandleDiv
      key={index}
      className="elbow-delete"
      style={getElbowAnchorHandleTransformStyle(anchor, width, zoom)}
      onClick={() => this.doElbowAnchorDelete(widget, index)}
    />)
  }

  renderElbowHandleListAdd (widget, zoom) {
    const { anchors, width } = widget
    if (anchors.length >= 10) return null
    return anchors.map((anchor, index) => <EditHandleDiv
      key={index}
      className="elbow-add"
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

    return <HandleLayerDiv className={borderClassName} style={style}>
      {singleSelectPreviewWidget && this.renderWidgetHandle(singleSelectPreviewWidget, zoom)}
    </HandleLayerDiv>
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
