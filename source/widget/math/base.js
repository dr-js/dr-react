const toClientSpacePoint = ({ x, y }, widgetLayerBoundingClientRect, zoom) => ({
  x: x * zoom + widgetLayerBoundingClientRect.left,
  y: y * zoom + widgetLayerBoundingClientRect.top
})

const toEditorSpacePoint = ({ x, y }, widgetLayerBoundingClientRect, zoom) => ({
  x: (x - widgetLayerBoundingClientRect.left) / zoom,
  y: (y - widgetLayerBoundingClientRect.top) / zoom
})

export { toClientSpacePoint, toEditorSpacePoint }
