import { WIDGET_SHAPE_TYPE } from 'source/state/widget/type/shape'

const getSampleList = (SIZE) => {
  const WIDTH = SIZE
  const HEIGHT = SIZE * 0.75
  const LINE_WIDTH = 9

  return [ {
    id: 'SAMPLE RECT',
    shape: WIDGET_SHAPE_TYPE.RECT,
    center: { x: WIDTH * 0.5, y: HEIGHT * 0.5 },
    size: { x: WIDTH, y: HEIGHT },
    rotate: 0,
    zIndex: 0
  }, {
    id: 'SAMPLE LINE',
    shape: WIDGET_SHAPE_TYPE.LINE,
    center: { x: LINE_WIDTH * 0.5, y: HEIGHT * 0.5 },
    size: { x: LINE_WIDTH, y: HEIGHT },
    rotate: 0,
    zIndex: 1
  }, {
    id: 'SAMPLE ELBOW',
    shape: WIDGET_SHAPE_TYPE.ELBOW,
    center: { x: WIDTH * 0.5, y: HEIGHT * 0.5 },
    size: { x: WIDTH, y: HEIGHT },
    rotate: 0,
    zIndex: 1,
    width: LINE_WIDTH,
    anchors: [
      { x: 0, y: 0 },
      { x: WIDTH * 0.5, y: 0 },
      { x: WIDTH * 0.5, y: HEIGHT },
      { x: WIDTH, y: HEIGHT }
    ]
  } ]
}

const WIDGET_SAMPLE_LIST = getSampleList(160) // default widget data
const WIDGET_SAMPLE_MAP = WIDGET_SAMPLE_LIST.reduce((o, widget) => {
  o[ widget.shape ] = widget
  return o
}, {})

const WIDGET_MINI_SAMPLE_LIST = getSampleList(40) // smaller version for WidgetCreator
const WIDGET_MINI_SAMPLE_MAP = WIDGET_MINI_SAMPLE_LIST.reduce((o, widget) => {
  o[ widget.shape ] = widget
  return o
}, {})

export {
  WIDGET_SAMPLE_LIST,
  WIDGET_SAMPLE_MAP,
  WIDGET_MINI_SAMPLE_LIST,
  WIDGET_MINI_SAMPLE_MAP
}
