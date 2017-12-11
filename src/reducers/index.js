// TODO: extract documents to one level up (ml-documents-redux)
import { combineReducers } from 'redux'
import byUri, {selectors as byUriSelectors} from './byUri'

export default combineReducers({byUri})

// SELECTORS
const bindSelector = (selector, mountPoint) => {
  return (state, ...args) => {
    return selector(state[mountPoint], ...args)
  }
}

const bindSelectors = (selectors, mountPoint) => {
  return Object.keys(selectors).reduce((bound, key) => {
    bound[key] = bindSelector(selectors[key], mountPoint)
    return bound
  }, {})
}

export const selectors = {
  ...bindSelectors(byUriSelectors, 'byUri')
}
