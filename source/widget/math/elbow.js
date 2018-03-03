import { arrayDelete, arrayPush, arrayUnshift } from 'dr-js/module/common/immutable/ImmutableOperation'
import { add, sub, min, round } from 'dr-js/module/common/geometry/D2/Vector'
import { localPoint, localBoundingRect } from 'dr-js/module/common/geometry/D2/Widget'

import {
  ELBOW_ANCHOR_INFO_MAP,
  ELBOW_ANCHOR_PREFIX_HEAD,
  ELBOW_ANCHOR_PREFIX_TAIL,
  ELBOW_ANCHOR_PREFIX_X,
  ELBOW_ANCHOR_PREFIX_Y
} from '../type/handle'
import { getWidgetShift } from './hover'

const normalizeElbow = (center, size, rotate, anchors, data) => {
  const min = { x: Infinity, y: Infinity }
  const max = { x: -Infinity, y: -Infinity }
  anchors.forEach(({ x, y }) => {
    min.x = Math.min(min.x, x)
    min.y = Math.min(min.y, y)
    max.x = Math.max(max.x, x)
    max.y = Math.max(max.y, y)
  })
  const offsetX = (min.x + max.x - size.x) * 0.5
  const offsetY = (min.y + max.y - size.y) * 0.5
  const sin = Math.sin(rotate)
  const cos = Math.cos(rotate)
  return {
    ...data,
    center: {
      x: Math.round(center.x + offsetX * cos - offsetY * sin),
      y: Math.round(center.y + offsetX * sin + offsetY * cos)
    },
    size: {
      x: Math.round(max.x - min.x),
      y: Math.round(max.y - min.y)
    },
    rotate,
    anchors: anchors.map(({ x, y }) => ({
      x: Math.round(x - min.x),
      y: Math.round(y - min.y)
    }))
  }
}

const getSimpleAnchorList = (head, tail) => {
  if (Math.abs(head.x - tail.x) >= Math.abs(head.y - tail.y)) {
    const middleX = (head.x + tail.x) * 0.5
    return [ head, { x: middleX, y: head.y }, { x: middleX, y: tail.y }, tail ]
  } else {
    const middleY = (head.y + tail.y) * 0.5
    return [ head, { x: head.x, y: middleY }, { x: tail.x, y: middleY }, tail ]
  }
}

const fromPoint = (pointBegin, pointEnd, data) => {
  const pointMin = min(pointBegin, pointEnd)
  return {
    ...data,
    center: {
      x: Math.round((pointBegin.x + pointEnd.x) * 0.5),
      y: Math.round((pointBegin.y + pointEnd.y) * 0.5)
    },
    size: {
      x: Math.round(Math.abs(pointBegin.x - pointEnd.x)),
      y: Math.round(Math.abs(pointBegin.y - pointEnd.y))
    },
    rotate: 0,
    anchors: getSimpleAnchorList(
      round(sub(pointBegin, pointMin)),
      round(sub(pointEnd, pointMin))
    )
  }
}

const calcElbowAnchorAdd = (widget, anchorIndex) => {
  const { center, size, rotate } = widget
  let { anchors } = widget
  const anchor = anchors[ anchorIndex ]
  const prevAnchor = anchors[ anchorIndex - 1 ]
  const nextAnchor = anchors[ anchorIndex + 1 ]
  if (!prevAnchor) anchors = arrayUnshift(anchors, getExtendAnchorEnd(anchor, nextAnchor))
  else if (!nextAnchor) anchors = arrayPush(anchors, getExtendAnchorEnd(anchor, prevAnchor))
  else {
    const x = prevAnchor.x !== anchor.x ? (prevAnchor.x + anchor.x) * 0.5
      : nextAnchor.x !== anchor.x ? (nextAnchor.x + anchor.x) * 0.5
        : anchor.x
    const y = prevAnchor.y !== anchor.y ? (prevAnchor.y + anchor.y) * 0.5
      : nextAnchor.y !== anchor.y ? (nextAnchor.y + anchor.y) * 0.5
        : anchor.y
    anchors = [
      ...anchors.slice(0, anchorIndex),
      prevAnchor.x !== anchor.x ? { x, y: anchor.y } : { x: anchor.x, y },
      { x, y },
      nextAnchor.x !== anchor.x ? { x, y: anchor.y } : { x: anchor.x, y },
      ...anchors.slice(anchorIndex + 1)
    ]
  }
  return normalizeElbow(center, size, rotate, anchors, widget)
}
const getExtendAnchorEnd = ({ x, y }, refAnchor, dist = 24) => x === refAnchor.x
  ? { x: x + dist, y }
  : { x, y: y + dist }

const calcElbowAnchorDelete = (widget, anchorIndex) => {
  const { center, size, rotate } = widget
  let { anchors } = widget
  const prevAnchor = anchors[ anchorIndex - 1 ]
  const nextAnchor = anchors[ anchorIndex + 1 ]
  if (!prevAnchor || !nextAnchor) anchors = arrayDelete(widget.anchors, anchorIndex)
  else {
    anchors = [
      ...anchors.slice(0, anchorIndex - 1),
      prevAnchor.x === anchors[ anchorIndex ].x
        ? { x: nextAnchor.x, y: prevAnchor.y }
        : { x: prevAnchor.x, y: nextAnchor.y },
      ...anchors.slice(anchorIndex + 2)
    ]
  }
  return normalizeElbow(center, size, rotate, anchors, widget)
}

const calcWidgetElbowResizeHandleDelta = (widget, handleType, handleDelta) => {
  const { center, size, rotate, anchors } = widget
  const deltaRadian = Math.atan2(handleDelta.y, handleDelta.x) - rotate
  const previewRadius = Math.sqrt((handleDelta.x * handleDelta.x) + (handleDelta.y * handleDelta.y))
  const shift = {
    x: previewRadius * Math.cos(deltaRadian),
    y: previewRadius * Math.sin(deltaRadian)
  }
  let nextAnchors
  const { prefix, number } = ELBOW_ANCHOR_INFO_MAP[ handleType ]
  if (prefix === ELBOW_ANCHOR_PREFIX_HEAD) {
    const anchorHead = add(anchors[ 0 ], shift)
    const anchorTail = anchors[ anchors.length - 1 ]
    nextAnchors = getSimpleAnchorList(anchorHead, anchorTail)
  } else if (prefix === ELBOW_ANCHOR_PREFIX_TAIL) {
    const anchorHead = anchors[ 0 ]
    const anchorTail = add(anchors[ anchors.length - 1 ], shift)
    nextAnchors = getSimpleAnchorList(anchorHead, anchorTail)
  } else if (prefix === ELBOW_ANCHOR_PREFIX_X) {
    nextAnchors = [ ...anchors ]
    nextAnchors[ number - 1 ] = addX(anchors[ number - 1 ], shift)
    nextAnchors[ number ] = addX(anchors[ number ], shift)
  } else if (prefix === ELBOW_ANCHOR_PREFIX_Y) {
    nextAnchors = [ ...anchors ]
    nextAnchors[ number - 1 ] = addY(anchors[ number - 1 ], shift)
    nextAnchors[ number ] = addY(anchors[ number ], shift)
  } else throw new Error(`[calcWidgetElbowResizeHandleDelta] invalid handle: ${handleType}`)
  return normalizeElbow(center, size, rotate, nextAnchors, widget)
}
const addX = ({ x, y }, v) => ({ x: x + v.x, y })
const addY = ({ x, y }, v) => ({ x, y: y + v.y })

const calcWidgetElbowResizeHandleAt = (widget, handleType, handleAt) => {
  const { center, size, rotate, anchors } = widget
  const anchorAt = localPoint({ center, rotate }, handleAt)
  anchorAt.x += size.x * 0.5 // elbow use top-left as (0, 0), not center
  anchorAt.y += size.y * 0.5
  const nextAnchors = [ ...anchors ]
  const { prefix } = ELBOW_ANCHOR_INFO_MAP[ handleType ]
  if (prefix === ELBOW_ANCHOR_PREFIX_HEAD) {
    nextAnchors[ 0 ] = anchorAt
    nextAnchors[ 1 ] = calcAnchorAt(anchors, 1, 0, anchorAt)
  } else if (prefix === ELBOW_ANCHOR_PREFIX_TAIL) {
    const lastIndex = anchors.length - 1
    nextAnchors[ lastIndex - 1 ] = calcAnchorAt(anchors, lastIndex - 1, lastIndex, anchorAt)
    nextAnchors[ lastIndex ] = anchorAt
  } else throw new Error(`[calcWidgetElbowResizeHandleAt] invalid handle: ${handleType}`)
  return normalizeElbow(center, size, rotate, nextAnchors, widget)
}
const calcAnchorAt = (anchors, index, refIndex, point) => {
  const { x, y } = anchors[ index ]
  return x === anchors[ refIndex ].x
    ? { x: point.x, y }
    : { x, y: point.y }
}

const calcWidgetElbowResizeBind = (widget, headBindInfo, tailBindInfo) => {
  const { center, size, rotate, anchors } = widget
  const headLocalData = headBindInfo && getLocalBindData(widget, headBindInfo)
  const tailLocalData = tailBindInfo && getLocalBindData(widget, tailBindInfo)

  const anchorHead = headLocalData ? headLocalData.anchor : anchors[ 0 ]
  const anchorTail = tailLocalData ? tailLocalData.anchor : anchors[ anchors.length - 1 ]

  // if (headLocalData && tailLocalData && isBoundingRectIntersect(headLocalData.boundingRect, tailLocalData.boundingRect)) {
  //   const unionBoundingRect = getUnionBoundingRect(headLocalData.boundingRect, tailLocalData.boundingRect)
  //   headLocalData.boundingRect = unionBoundingRect
  //   tailLocalData.boundingRect = unionBoundingRect
  // }

  // TODO: for same target widget result should be all C shape but has Z shape
  const anchorHeadList = headLocalData ? extendAnchorAroundBoundingRect(headLocalData.anchor, anchorTail, headLocalData.boundingRect) : anchors.slice(0, 2)
  const anchorTailList = tailLocalData ? extendAnchorAroundBoundingRect(tailLocalData.anchor, anchorHead, tailLocalData.boundingRect).reverse() : anchors.slice(-2)
  const nextAnchors = concatAnchorList(anchorHeadList, anchorTailList)
  // __DEV__ && console.log(JSON.stringify(nextAnchors.map(JSON.stringify), null, ' '))

  return normalizeElbow(center, size, rotate, nextAnchors, widget)
}

const getLocalBindData = (widget, { targetWidget, targetShift }) => { // use position relative to elbow anchor, use top-left as (0, 0), not center
  const anchor = localPoint(widget, getWidgetShift(targetWidget, targetShift))
  const boundingRect = localBoundingRect(widget, targetWidget)
  const halfSizeX = widget.size.x * 0.5
  const halfSizeY = widget.size.y * 0.5
  anchor.x += halfSizeX
  anchor.y += halfSizeY
  boundingRect.left += halfSizeX
  boundingRect.right += halfSizeX
  boundingRect.top += halfSizeY
  boundingRect.bottom += halfSizeY
  return { anchor, boundingRect }
}

// TODO: still not enough optimized, has wired 3 shape but should be C shape
// all relative to anchor
const extendAnchorAroundBoundingRect = (anchorFrom, anchorTo, { left, right, top, bottom }) => {
  let exitDirection
  let minExitDistance = Infinity
  const distanceLeft = Math.abs(left - anchorFrom.x)
  const distanceRight = Math.abs(right - anchorFrom.x)
  const distanceTop = Math.abs(top - anchorFrom.y)
  const distanceBottom = Math.abs(bottom - anchorFrom.y)
  if (distanceLeft < minExitDistance) [ exitDirection, minExitDistance ] = [ DIRECTION_LEFT, distanceLeft ]
  if (distanceRight < minExitDistance) [ exitDirection, minExitDistance ] = [ DIRECTION_RIGHT, distanceRight ]
  if (distanceTop < minExitDistance) [ exitDirection, minExitDistance ] = [ DIRECTION_UP, distanceTop ]
  if (distanceBottom < minExitDistance) [ exitDirection, minExitDistance ] = [ DIRECTION_DOWN, distanceBottom ]

  const deltaX = anchorFrom.x - anchorTo.x
  const deltaY = anchorFrom.y - anchorTo.y
  const extendDirection = Math.abs(deltaX) >= Math.abs(deltaY)
    ? (deltaX >= 0 ? DIRECTION_LEFT : DIRECTION_RIGHT)
    : (deltaY >= 0 ? DIRECTION_UP : DIRECTION_DOWN)

  const isExitHorizontal = exitDirection === DIRECTION_LEFT || exitDirection === DIRECTION_RIGHT
  const exitDistance = isExitHorizontal
    ? (exitDirection === DIRECTION_LEFT && deltaX >= 0 ? Math.abs(deltaX) : minExitDistance + EXTEND_DISTANCE)
    : (exitDirection === DIRECTION_UP && deltaY >= 0 ? Math.abs(deltaY) : minExitDistance + EXTEND_DISTANCE)
  const anchorExit = getAnchorByDistance(anchorFrom, exitDirection, exitDistance)

  if (exitDirection === extendDirection) {
    // __DEV__ && console.log('+1 anchor, direct')
    return [ anchorFrom, anchorExit ]
  }

  const isExtendHorizontal = extendDirection === DIRECTION_LEFT || extendDirection === DIRECTION_RIGHT
  const extendDistance = (isExtendHorizontal ? Math.abs(deltaX) : Math.abs(deltaY))

  if (isExitHorizontal !== isExtendHorizontal) {
    // __DEV__ && console.log('+2 anchor, L shape')
    const anchorTurn = getAnchorByDistance(anchorExit, extendDirection, extendDistance)
    return [ anchorFrom, anchorExit, anchorTurn ]
  }

  const [ turnDirection, turnDistance ] = isExtendHorizontal ? (
    distanceTop <= distanceBottom
      ? [ DIRECTION_UP, Math.max(distanceTop + EXTEND_DISTANCE, deltaY) ]
      : [ DIRECTION_DOWN, Math.max(distanceBottom + EXTEND_DISTANCE, -deltaY) ]
  ) : (
    distanceLeft <= distanceRight
      ? [ DIRECTION_LEFT, Math.max(distanceLeft + EXTEND_DISTANCE, deltaX) ]
      : [ DIRECTION_RIGHT, Math.max(distanceRight + EXTEND_DISTANCE, -deltaX) ]
  )

  // __DEV__ && console.log('+3 anchor, C shape')
  const anchorTurn = getAnchorByDistance(anchorExit, turnDirection, turnDistance)
  const anchorTurnTurn = getAnchorByDistance(anchorTurn, extendDirection, extendDistance + exitDistance)
  return [ anchorFrom, anchorExit, anchorTurn, anchorTurnTurn ]
}
const EXTEND_DISTANCE = 32
const [ DIRECTION_UP, DIRECTION_RIGHT, DIRECTION_DOWN, DIRECTION_LEFT ] = [ 0, 1, 2, 3 ]
const getAnchorByDistance = ({ x, y }, direction, distance) => {
  switch (direction) {
    case DIRECTION_LEFT:
      return { y, x: x - distance }
    case DIRECTION_RIGHT:
      return { y, x: x + distance }
    case DIRECTION_UP:
      return { x, y: y - distance }
    case DIRECTION_DOWN:
      return { x, y: y + distance }
  }
}
const concatAnchorList = (listFrom, listTo) => {
  const anchorFromLast = listFrom[ listFrom.length - 1 ]
  const anchorToFirst = listTo[ 0 ]
  const matchX = anchorFromLast.x === anchorToFirst.x
  const matchY = anchorFromLast.y === anchorToFirst.y

  // __DEV__ && matchX && matchY && console.log('overlap, delete 1 anchor')
  if (matchX && matchY) return [ ...listFrom, ...listTo.slice(1) ]

  const anchorFromSecondLast = listFrom[ listFrom.length - 2 ]
  const anchorToSecond = listTo[ 1 ]
  const isFromTailHorizontal = !anchorFromSecondLast ? 'pointFrom' : anchorFromLast.x !== anchorFromSecondLast.x
  const isToHeadHorizontal = !anchorToSecond ? 'pointTo' : anchorToFirst.x !== anchorToSecond.x

  if (isFromTailHorizontal !== isToHeadHorizontal) {
    // __DEV__ && console.log('L fuse')
    return isFromTailHorizontal
      ? [ ...listFrom.slice(0, -1), { x: anchorToFirst.x, y: anchorFromLast.y }, ...listTo.slice(1) ]
      : [ ...listFrom.slice(0, -1), { x: anchorFromLast.x, y: anchorToFirst.y }, ...listTo.slice(1) ]
  }

  // __DEV__ && ((isFromTailHorizontal && matchY) || (!isFromTailHorizontal && matchX)) && console.log('direct aiming fuse, delete 2 anchor')
  if ((isFromTailHorizontal && matchY) || (!isFromTailHorizontal && matchX)) return [ ...listFrom.slice(0, -1), ...listTo.slice(1) ]

  // __DEV__ && console.log('Z fuse')
  const middleX = (anchorFromSecondLast.x + anchorToSecond.x) * 0.5
  const middleY = (anchorFromSecondLast.y + anchorToSecond.y) * 0.5
  return isFromTailHorizontal
    ? [ ...listFrom.slice(0, -1), { x: middleX, y: anchorFromLast.y }, { x: middleX, y: anchorToFirst.y }, ...listTo.slice(1) ]
    : [ ...listFrom.slice(0, -1), { x: anchorFromLast.x, y: middleY }, { x: anchorToFirst.x, y: middleY }, ...listTo.slice(1) ]
}

export {
  normalizeElbow,
  fromPoint,
  calcElbowAnchorAdd,
  calcElbowAnchorDelete,
  calcWidgetElbowResizeHandleDelta,
  calcWidgetElbowResizeHandleAt,
  calcWidgetElbowResizeBind
}
