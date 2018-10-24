const STYLE_DISPLAY_NONE = { display: 'none' }

const getBoundingRectTransformStyle = ({ left, right, top, bottom }, zoom) => ({
  transform: `translate(${[
    `${Math.round(left * zoom)}px`,
    `${Math.round(top * zoom)}px`
  ].join(',')})`,
  width: `${Math.round((right - left) * zoom)}px`,
  height: `${Math.round((bottom - top) * zoom)}px`
})

const getRectTransformStyle = ({ center, size, rotate, zIndex = 'auto' }, zoom) => ({
  transform: [
    `translate(${[
      `${Math.round((center.x - size.x * 0.5) * zoom)}px`,
      `${Math.round((center.y - size.y * 0.5) * zoom)}px`
    ].join(',')})`,
    `rotate(${rotate}rad)`
  ].join(' '),
  width: `${Math.round(size.x * zoom)}px`,
  height: `${Math.round(size.y * zoom)}px`,
  zIndex: zIndex
})

const getElbowAnchorTransformStyle = (fromAnchor, toAnchor, width, zoom) => ({
  transform: `translate(${[
    `${Math.round((Math.min(fromAnchor.x, toAnchor.x) - width * 0.5) * zoom)}px`,
    `${Math.round((Math.min(fromAnchor.y, toAnchor.y) - width * 0.5) * zoom)}px`
  ].join(',')})`,
  width: `${Math.round((Math.abs(fromAnchor.x - toAnchor.x) + width) * zoom)}px`,
  height: `${Math.round((Math.abs(fromAnchor.y - toAnchor.y) + width) * zoom)}px`
})
const getElbowAnchorEndTransformStyle = (anchor, width, zoom) => ({
  transform: `translate(${[
    `${Math.round((anchor.x - width * 0.5) * zoom)}px`,
    `${Math.round((anchor.y - width * 0.5) * zoom)}px`
  ].join(',')})`,
  width: `${Math.round(width * zoom)}px`,
  height: `${Math.round(width * zoom)}px`
})

export {
  STYLE_DISPLAY_NONE,

  getBoundingRectTransformStyle,

  getRectTransformStyle,

  getElbowAnchorTransformStyle,
  getElbowAnchorEndTransformStyle
}
