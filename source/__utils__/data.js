const findKeyInMap = (map, findFunc) => {
  const entry = Object.entries(map).find(findFunc)
  return entry ? entry[ 0 ] : null
}

export { findKeyInMap }
