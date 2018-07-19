import * as types from '../actionTypes';
import X2JS from 'x2js';
let x2js;

// TODO: extract, which may make writing the selectors simpler
const documentReducer = (state = {}, action) => {
  switch (action.type) {
    case types.FETCH_DOC_REQUESTED:
      return {
        ...state,
        pending: true
      };
    case types.FETCH_DOC_SUCCESS:
      return {
        ...state,
        content: action.payload.response.content,
        contentType: action.payload.response.contentType,
        pending: false,
        error: undefined
      };
    case types.FETCH_DOC_FAILURE:
      return {
        ...state,
        pending: false,
        error: action.payload.error
      };
    default:
      return state;
  }
};

export default (state = {}, action) => {
  if (action.payload && action.payload.docUri) {
    return {
      ...state,
      [action.payload.docUri]: documentReducer(
        state[action.payload.docUri],
        action
      )
    };
  }
  return state;
};

// SELECTORS
const xmlToJson = xml => {
  x2js = x2js || new X2JS();
  return x2js.xml2js(xml);
};

const getDocumentByUri = (state, uri) => state[uri] && state[uri].content;
const getContentTypeByUri = (state, uri) =>
  state[uri] && state[uri].contentType;

export const selectors = {
  isDocumentFetchPending: (state, docUri) =>
    !!(state[docUri] && state[docUri].pending),
  documentByUri: getDocumentByUri,
  jsonByUri: (state, uri) => {
    const content = getDocumentByUri(state, uri);
    if (!content) {
      return;
    }
    if (getContentTypeByUri(state, uri).indexOf('application/xml') !== -1) {
      return xmlToJson(content);
    } else {
      return content;
    }
  },
  contentTypeByUri: getContentTypeByUri,
  errorByUri: (state, uri) => state[uri] && state[uri].error
};
