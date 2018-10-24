import { roundFloat } from 'dr-js/module/common/math/base'

import { HOVER_TARGET_TYPE } from '../type/hover'

const clampOffset = (value) => Math.min(Math.max(value, 0), 1)
const directReturn = (value) => () => value

// shift: ratio, relative to widget center
const HOVER_TARGET_CALC_SHIFT_MAP = {
  [ HOVER_TARGET_TYPE.RECT_LEFT ]: directReturn({ shiftX: -0.5, shiftY: 0 }),
  [ HOVER_TARGET_TYPE.RECT_RIGHT ]: directReturn({ shiftX: 0.5, shiftY: 0 }),
  [ HOVER_TARGET_TYPE.RECT_TOP ]: directReturn({ shiftX: 0, shiftY: -0.5 }),
  [ HOVER_TARGET_TYPE.RECT_BOTTOM ]: directReturn({ shiftX: 0, shiftY: 0.5 }),
  [ HOVER_TARGET_TYPE.RECT_TOP_LEFT ]: directReturn({ shiftX: -0.5, shiftY: -0.5 }),
  [ HOVER_TARGET_TYPE.RECT_TOP_RIGHT ]: directReturn({ shiftX: 0.5, shiftY: -0.5 }),
  [ HOVER_TARGET_TYPE.RECT_BOTTOM_LEFT ]: directReturn({ shiftX: -0.5, shiftY: 0.5 }),
  [ HOVER_TARGET_TYPE.RECT_BOTTOM_RIGHT ]: directReturn({ shiftX: 0.5, shiftY: 0.5 }),
  [ HOVER_TARGET_TYPE.ANY_RECT ]: (widget, element, { point: { x, y } }) => {
    const { left, top, width, height } = element.getBoundingClientRect()
    const offsetX = clampOffset((x - left) / width)
    const offsetY = clampOffset((y - top) / height)
    return {
      shiftX: roundFloat(offsetX - 0.5),
      shiftY: roundFloat(offsetY - 0.5)
    }
  },
  [ HOVER_TARGET_TYPE.ANY_RECT_OUTLINE ]: (widget, element, { point: { x, y } }) => {
    const { left, top, width, height } = element.getBoundingClientRect()
    let offsetX = clampOffset((x - left) / width)
    let offsetY = clampOffset((y - top) / height)
    return Math.abs(offsetX - 0.5) * width < Math.abs(offsetY - 0.5) * height
      ? { shiftX: Math.round(offsetX), shiftY: roundFloat(offsetY - 0.5) } // use left or right outline
      : { shiftX: roundFloat(offsetX - 0.5), shiftY: Math.round(offsetY) } // use top or bottom outline
  }
}

// absolute position of shifted point
const getWidgetShift = ({ center, size, rotate }, { shiftX, shiftY }) => {
  const cos = Math.cos(rotate)
  const sin = Math.sin(rotate)
  const offsetX = size.x * shiftX
  const offsetY = size.y * shiftY
  return {
    x: center.x + offsetX * cos - offsetY * sin,
    y: center.y + offsetX * sin + offsetY * cos
  }
}

export {
  HOVER_TARGET_CALC_SHIFT_MAP,
  getWidgetShift
}
