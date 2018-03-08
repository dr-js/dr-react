import { objectSet } from 'dr-js/module/common/immutable/Object'

const updateSelectData = (editorState, state) => objectSet(editorState, 'selectData', state)

const initialState = {
  selectSampleShape: null
}

const reducerMap = {
  'reducer:select-data:reset': (creatorState) => updateSelectData(creatorState, initialState),
  'reducer:select-data:set-sample-shape': (creatorState, { targetSampleShape }) => {
    let state = creatorState.selectData
    state = objectSet(state, 'selectSampleShape', targetSampleShape)
    return updateSelectData(creatorState, state)
  }
}

export { initialState, reducerMap }
