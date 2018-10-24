import { fromAngleLength, getLength, getAngle, add, sub } from 'dr-js/module/common/geometry/D2/Vector'

import { HANDLE_TYPE } from '../type/handle'

const calcDeltaAspectRatioLock = ({ center, size, rotate }, handleType, delta, aspectRatio = (size.y / size.x)) => {
  const sizeX = size.x
  const sizeY = size.x * aspectRatio
  let localHandle
  switch (handleType) {
    case HANDLE_TYPE.TOP_LEFT:
      localHandle = { x: -sizeX, y: sizeY }
      break
    case HANDLE_TYPE.TOP_RIGHT:
      localHandle = { x: sizeX, y: sizeY }
      break
    case HANDLE_TYPE.BOTTOM_RIGHT:
      localHandle = { x: sizeX, y: -sizeY }
      break
    case HANDLE_TYPE.BOTTOM_LEFT:
      localHandle = { x: -sizeX, y: -sizeY }
      break
  }
  const handleRotate = getAngle(localHandle) + rotate
  const localDelta = sub(delta, center)
  const localDeltaLength = getLength(localDelta)
  const castRotate = getAngle(localDelta) - handleRotate
  const castLocalDeltaLength = localDeltaLength * Math.cos(castRotate)
  return add(center, fromAngleLength(handleRotate, castLocalDeltaLength))
}

const calcDeltaLocal = ({ size, rotate }, handleType, delta) => {
  const deltaLength = getLength(delta)
  const localRotate = getAngle(delta) - rotate
  let localDeltaX = deltaLength * Math.cos(localRotate)
  let localDeltaY = deltaLength * Math.sin(localRotate)
  switch (handleType) {
    case HANDLE_TYPE.RIGHT:
    case HANDLE_TYPE.LEFT:
    case HANDLE_TYPE.WIDTH:
      localDeltaY = 0
      break
    case HANDLE_TYPE.TOP:
    case HANDLE_TYPE.BOTTOM:
    // case HANDLE_TYPE.HEIGHT:
      localDeltaX = 0
      break
  }
  return { x: localDeltaX, y: localDeltaY }
}

const calcWidgetRectResizeHandleDelta = (widget, handleType, delta) => {
  const localDelta = calcDeltaLocal(widget, handleType, delta)
  const { center, size, rotate } = widget
  const halfCos = Math.cos(rotate) * 0.5
  const halfSin = Math.sin(rotate) * 0.5
  let sizeX = size.x
  let sizeY = size.y
  let centerX = center.x
  let centerY = center.y
  switch (handleType) {
    case HANDLE_TYPE.RIGHT:
    case HANDLE_TYPE.TOP_RIGHT:
    case HANDLE_TYPE.BOTTOM_RIGHT:
      sizeX += localDelta.x
      centerX += localDelta.x * halfCos
      centerY += localDelta.x * halfSin
      break
    case HANDLE_TYPE.LEFT:
    case HANDLE_TYPE.TOP_LEFT:
    case HANDLE_TYPE.BOTTOM_LEFT:
      sizeX -= localDelta.x
      centerX += localDelta.x * halfCos
      centerY += localDelta.x * halfSin
      break
    case HANDLE_TYPE.WIDTH:
      sizeX -= localDelta.x * 2
      break
    // case HANDLE_TYPE.HEIGHT:
    //   sizeY -= localDelta.y * 2 // TODO: test if signed correctly
    //   break
  }
  switch (handleType) {
    case HANDLE_TYPE.TOP:
    case HANDLE_TYPE.TOP_RIGHT:
    case HANDLE_TYPE.TOP_LEFT:
      sizeY -= localDelta.y
      centerX -= localDelta.y * halfSin
      centerY += localDelta.y * halfCos
      break
    case HANDLE_TYPE.BOTTOM:
    case HANDLE_TYPE.BOTTOM_RIGHT:
    case HANDLE_TYPE.BOTTOM_LEFT:
      sizeY += localDelta.y
      centerX -= localDelta.y * halfSin
      centerY += localDelta.y * halfCos
      break
  }
  return {
    ...widget,
    center: { x: centerX, y: centerY },
    size: { x: Math.abs(sizeX), y: Math.abs(sizeY) },
    rotate
  }
}

export {
  calcDeltaAspectRatioLock,
  calcDeltaLocal,
  calcWidgetRectResizeHandleDelta
}
