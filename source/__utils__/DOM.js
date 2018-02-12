// return the branchNodeList between 2 node
const getBranchElementList = (fromElement, toElement) => {
  if (!fromElement.contains(toElement)) return []
  let element = toElement
  const elementList = [] // each element under fromElement, toElement included
  while (element !== fromElement) {
    elementList.unshift(element)
    element = element.parentElement
  }
  return elementList
}

const getElementCenterUnder = ({ x, y }, hideElementList) => {
  const styleRecoverList = hideElementList.map((element) => {
    const { visibility } = element.style
    element.style.visibility = 'hidden'
    return visibility
  })
  const elementUnder = document.elementFromPoint(x, y)
  hideElementList.forEach((element, index) => (element.style.visibility = styleRecoverList[ index ]))
  return elementUnder
}

export {
  getBranchElementList,
  getElementCenterUnder
}
