import { getRandomInt, getRandomId } from 'dr-js/module/common/math/random'

import { WIDGET_SHAPE_TYPE } from 'source/state/widget/type/shape'

const getRandomWidgetDataMap = (SIZE_ZOOM) => {
  const VIEW_WIDTH = window.innerWidth
  const VIEW_HEIGHT = window.innerHeight
  const ELBOW_SIZE_ZOOM = 15 * SIZE_ZOOM

  const randomRect = () => ({
    center: { x: getRandomInt(0, VIEW_WIDTH), y: getRandomInt(0, VIEW_HEIGHT) },
    size: { x: getRandomInt(SIZE_ZOOM, 5 * SIZE_ZOOM), y: getRandomInt(SIZE_ZOOM, 5 * SIZE_ZOOM) },
    rotate: getRandomInt(0, 360),
    zIndex: 0
  })

  const randomElbow = () => {
    const anchors = [ //
      { x: getRandomInt(0, ELBOW_SIZE_ZOOM), y: 0 }, // start
      { x: getRandomInt(0, ELBOW_SIZE_ZOOM) },
      { y: getRandomInt(0, ELBOW_SIZE_ZOOM) },
      { x: getRandomInt(0, ELBOW_SIZE_ZOOM) },
      { y: getRandomInt(0, ELBOW_SIZE_ZOOM) },
      { x: 0 } // end
    ]
    let last = {}
    const size = { x: 0, y: 0 }
    anchors.forEach((anchor) => {
      const { x, y } = anchor
      if (x !== undefined) size.x = Math.max(size.x, x)
      if (y !== undefined) size.y = Math.max(size.y, y)
      Object.assign(last, last, anchor)
      Object.assign(anchor, last)
    })
    return { width: getRandomInt(4, 10), size, anchors }
  }

  return {
    [ WIDGET_SHAPE_TYPE.RECT ]: () => ({
      ...randomRect(),
      size: { x: getRandomInt(SIZE_ZOOM, 5 * SIZE_ZOOM), y: getRandomInt(SIZE_ZOOM, 5 * SIZE_ZOOM) }
    }),
    [ WIDGET_SHAPE_TYPE.LINE ]: () => ({
      ...randomRect(),
      size: { x: getRandomInt(5, 20), y: getRandomInt(5 * SIZE_ZOOM, 20 * SIZE_ZOOM) }
    }),
    [ WIDGET_SHAPE_TYPE.ELBOW ]: () => ({
      ...randomRect(),
      ...randomElbow()
    })
  }
}

const randomWidgetList = (SIZE_ZOOM, WIDGET_COUNT) => {
  const randomWidgetDataMap = getRandomWidgetDataMap(SIZE_ZOOM)
  const shapeList = Object.keys(randomWidgetDataMap)
  const widgetList = []
  for (let index = 0; index < WIDGET_COUNT; index++) {
    const shape = shapeList[ index % shapeList.length ]
    const randomWidgetData = randomWidgetDataMap[ shape ]
    widgetList.push({ id: getRandomId('W'), shape, ...randomWidgetData() })
  }
  return widgetList
}

export { randomWidgetList }
