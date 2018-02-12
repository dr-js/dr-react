// value: from props, used for display
// px: value after zoom, good for CSS
// devicePixel: actual pixel for device, also for canvas
//
// deviceScale = devicePixel / px
// zoom = px / value
//
// SAMPLE HORIZONTAL { deviceScale = 2.0, zoom = 0.2, unitSize = 20, groupSize = 5 }
//
// 1 unit = 20 value = 4 px = 8 devicePixel
//
//  value = 0                           value = 100
//  px = 0                              px = 20
//  devicePixel = 0                     devicePixel = 40
//
// +               group              +                                  +
// |                                  |                                  |
// | unit | unit | unit | unit | unit |      |      |      |      |      |      |      |
// +------+------+------+-------------------------------------------------------------------
//
// <-------- bufferCanvas -------------->

// value should be multiplied by 5, then by 2
const getMaxSteppedValue = (base, max) => {
  if (!Number.isInteger(max * 0.2)) throw new Error(`[getMaxSteppedValue] max * 0.2 not integer, max: ${max}`)
  let value = 1
  while (base * value * 5 <= max) value *= 5 // try 5
  while (base * value * 2 <= max) value *= 2 // try 2
  return value // will be between [ max * 0.4, max ]
}

const getSizeFromZoom = (zoom) => {
  const unitSize = getMaxSteppedValue(zoom, 25) // between [10, 25]
  const groupSize = getMaxSteppedValue(zoom * unitSize, 200) // between [80, 200]
  return { unitSize, groupSize }
}

export { getSizeFromZoom }
