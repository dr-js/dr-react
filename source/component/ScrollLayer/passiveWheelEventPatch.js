// PATCH Chrome 73 // [Intervention] Unable to preventDefault inside passive event listener due to target being treated as passive. See https://www.chromestatus.com/features/6662647093133312

const addNonPassiveWheelEventListener = (element, onWheel) => {
  element && onWheel && element.addEventListener('wheel', onWheel, { passive: false })
  element && onWheel && element.addEventListener('mousewheel', onWheel, { passive: false })
}

const removeNonPassiveWheelEventListener = (element, onWheel) => {
  element && onWheel && element.removeEventListener('wheel', onWheel, { passive: false })
  element && onWheel && element.removeEventListener('mousewheel', onWheel, { passive: false })
}

export {
  addNonPassiveWheelEventListener,
  removeNonPassiveWheelEventListener
}
