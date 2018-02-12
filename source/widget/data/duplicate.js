import { getRandomId } from 'dr-js/module/common/math/random'

const duplicateWidget = (widget) => ({ ...widget, id: getRandomId('W') })

const duplicateWidgetList = (widgetList, positionOffset) => { // for duplicate and keep bindData
  const idMap = {}
  const getMappedId = (id) => idMap[ id ] || (idMap[ id ] = getRandomId('W'))

  widgetList = widgetList.map((widget) => ({
    ...widget,
    id: getMappedId(widget.id),
    center: {
      x: Math.round(widget.center.x + positionOffset.x),
      y: Math.round(widget.center.y + positionOffset.y)
    }
  }))

  widgetList.forEach((widget) => {
    if (!widget.bindData) return
    widget.bindData = Object.entries(widget.bindData).reduce((o, [ id, handleInfo ]) => {
      if (idMap[ id ]) o[ idMap[ id ] ] = handleInfo // only keep those valid ids
      return o
    }, {})
    if (!Object.keys(widget.bindData).length) delete widget.bindData
  })

  return widgetList
}

export {
  duplicateWidget,
  duplicateWidgetList
}
