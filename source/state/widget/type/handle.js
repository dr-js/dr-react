import { WIDGET_SHAPE_TYPE } from './shape'

// NOTE: this value is related to applied css styles
const MOVE = 'move' // position
const ROTATE = 'rotate' // rotate
// rect
const TOP = 'n'
const BOTTOM = 's'
const LEFT = 'w'
const RIGHT = 'e'
const TOP_LEFT = 'nw'
const TOP_RIGHT = 'ne'
const BOTTOM_LEFT = 'sw'
const BOTTOM_RIGHT = 'se'
const TOP_LEFT_ZOOM = `${TOP_LEFT} zoom`
const TOP_RIGHT_ZOOM = `${TOP_RIGHT} zoom`
const BOTTOM_LEFT_ZOOM = `${BOTTOM_LEFT} zoom`
const BOTTOM_RIGHT_ZOOM = `${BOTTOM_RIGHT} zoom`
// line
const TOP_FREE = 'begin'
const BOTTOM_FREE = 'end'
const TOP_FREE_LINK = 'begin link'
const BOTTOM_FREE_LINK = 'end link'
const WIDTH = 'width'
// elbow anchor
const ANCHOR_HEAD = 'anchor head'
const ANCHOR_TAIL = 'anchor tail'
const ANCHOR_HEAD_LINK = 'anchor head link'
const ANCHOR_TAIL_LINK = 'anchor tail link'
const ELBOW_ANCHOR_PREFIX_HEAD = 'anchor head'
const ELBOW_ANCHOR_PREFIX_TAIL = 'anchor tail'
const ELBOW_ANCHOR_PREFIX_X = 'anchor x'
const ELBOW_ANCHOR_PREFIX_Y = 'anchor y'
const ELBOW_ANCHOR_INFO_MAP = {
  [ ANCHOR_HEAD ]: { prefix: ELBOW_ANCHOR_PREFIX_HEAD },
  [ ANCHOR_TAIL ]: { prefix: ELBOW_ANCHOR_PREFIX_TAIL },
  [ ANCHOR_HEAD_LINK ]: { prefix: ELBOW_ANCHOR_PREFIX_HEAD },
  [ ANCHOR_TAIL_LINK ]: { prefix: ELBOW_ANCHOR_PREFIX_TAIL }
}
do {
  [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ].forEach((number) => {
    ELBOW_ANCHOR_INFO_MAP[ `${ELBOW_ANCHOR_PREFIX_X} ${number}` ] = { prefix: ELBOW_ANCHOR_PREFIX_X, number }
    ELBOW_ANCHOR_INFO_MAP[ `${ELBOW_ANCHOR_PREFIX_Y} ${number}` ] = { prefix: ELBOW_ANCHOR_PREFIX_Y, number }
  })
} while (0)

const getElbowAnchorHandleType = (from, to, number) => {
  const matchX = from.x === to.x
  const matchY = from.y === to.y
  return (matchX && !matchY) ? `${ELBOW_ANCHOR_PREFIX_X} ${number}`
    : (matchY && !matchX) ? `${ELBOW_ANCHOR_PREFIX_Y} ${number}`
      : null
}

const HANDLE_TYPE = {
  MOVE,
  ROTATE,
  TOP_LEFT,
  TOP,
  TOP_RIGHT,
  LEFT,
  RIGHT,
  BOTTOM_LEFT,
  BOTTOM,
  BOTTOM_RIGHT,
  TOP_LEFT_ZOOM,
  TOP_RIGHT_ZOOM,
  BOTTOM_LEFT_ZOOM,
  BOTTOM_RIGHT_ZOOM,
  TOP_FREE,
  BOTTOM_FREE,
  WIDTH,
  ANCHOR_HEAD,
  ANCHOR_TAIL,
  TOP_FREE_LINK,
  BOTTOM_FREE_LINK,
  ANCHOR_HEAD_LINK,
  ANCHOR_TAIL_LINK
}

//     rotate
// | nw   n   ne |
// |             |
// | w         e |
// |             |
// | sw   s   se |
const RECT_HANDLE_TYPE_LIST = [
  MOVE,
  ROTATE,
  TOP_LEFT,
  TOP,
  TOP_RIGHT,
  LEFT,
  RIGHT,
  BOTTOM_LEFT,
  BOTTOM,
  BOTTOM_RIGHT
]

//  rotate
// | begin |
// |       |
// | width |
// |       |
// |  end  |
const LINE_HANDLE_TYPE_LIST = [
  MOVE,
  ROTATE,
  TOP_FREE,
  WIDTH,
  BOTTOM_FREE
]

//  rotate
// head ------
//             |
//           anchor
//             |
//              ----- tail
const ELBOW_HANDLE_TYPE_LIST = [
  MOVE,
  ROTATE,
  ...Object.keys(ELBOW_ANCHOR_INFO_MAP)
]

// | begin |
// |       |
// |  end  |
const LINE_LINK_HANDLE_TYPE_LIST = [
  MOVE,
  TOP_FREE_LINK,
  BOTTOM_FREE_LINK
]

// |             |
// |             |
// |             |
// |             |
// |        zoom |
const RECT_CANVAS_HANDLE_TYPE_LIST = [
  MOVE,
  TOP_LEFT_ZOOM,
  TOP_RIGHT_ZOOM,
  BOTTOM_LEFT_ZOOM,
  BOTTOM_RIGHT_ZOOM
]

// | nw   n   ne |
// |             |
// | w         e |
// |             |
// | sw   s   se |
const RECT_TEXT_HANDLE_TYPE_LIST = [
  MOVE,
  TOP_LEFT,
  TOP,
  TOP_RIGHT,
  LEFT,
  RIGHT,
  BOTTOM_LEFT,
  BOTTOM,
  BOTTOM_RIGHT
]

// head ------
//             |
//           anchor
//             |
//              ----- tail
const ELBOW_LINK_HANDLE_TYPE_LIST = [
  MOVE,
  ...Object.keys(ELBOW_ANCHOR_INFO_MAP)
]

const HANDLE_TYPE_LIST_MAP = {
  [ WIDGET_SHAPE_TYPE.RECT ]: RECT_HANDLE_TYPE_LIST,
  [ WIDGET_SHAPE_TYPE.LINE ]: LINE_HANDLE_TYPE_LIST,
  [ WIDGET_SHAPE_TYPE.ELBOW ]: ELBOW_HANDLE_TYPE_LIST,
  [ WIDGET_SHAPE_TYPE.LINE_LINK ]: LINE_LINK_HANDLE_TYPE_LIST,
  [ WIDGET_SHAPE_TYPE.RECT_CANVAS ]: RECT_CANVAS_HANDLE_TYPE_LIST,
  [ WIDGET_SHAPE_TYPE.RECT_TEXT ]: RECT_TEXT_HANDLE_TYPE_LIST,
  [ WIDGET_SHAPE_TYPE.ELBOW_LINK ]: ELBOW_LINK_HANDLE_TYPE_LIST
}

const HANDLE_TYPE_LIST = Array.from(new Set([
  ...HANDLE_TYPE_LIST_MAP[ WIDGET_SHAPE_TYPE.RECT ],
  ...HANDLE_TYPE_LIST_MAP[ WIDGET_SHAPE_TYPE.LINE ],
  ...HANDLE_TYPE_LIST_MAP[ WIDGET_SHAPE_TYPE.ELBOW ],
  ...HANDLE_TYPE_LIST_MAP[ WIDGET_SHAPE_TYPE.LINE_LINK ],
  ...HANDLE_TYPE_LIST_MAP[ WIDGET_SHAPE_TYPE.RECT_CANVAS ],
  ...HANDLE_TYPE_LIST_MAP[ WIDGET_SHAPE_TYPE.RECT_TEXT ],
  ...HANDLE_TYPE_LIST_MAP[ WIDGET_SHAPE_TYPE.ELBOW_LINK ]
]))

const isHandleApplicable = (widget, handleType) => {
  const verifyList = HANDLE_TYPE_LIST_MAP[ widget.shape ]
  return Boolean(verifyList && verifyList.includes(handleType))
}

export {
  ELBOW_ANCHOR_INFO_MAP,
  ELBOW_ANCHOR_PREFIX_HEAD,
  ELBOW_ANCHOR_PREFIX_TAIL,
  ELBOW_ANCHOR_PREFIX_X,
  ELBOW_ANCHOR_PREFIX_Y,
  getElbowAnchorHandleType,

  HANDLE_TYPE,
  HANDLE_TYPE_LIST,
  HANDLE_TYPE_LIST_MAP,
  isHandleApplicable
}
