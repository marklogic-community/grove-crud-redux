import * as types from '../actionTypes';

export default (state = {}, action) => {
  if (action.payload && action.payload.doc) {
    switch (action.type) {
      case types.CREATE_DOC_REQUESTED:
        return {
          ...state,
          pending: true
        };
      case types.CREATE_DOC_SUCCESS:
        return {
          ...state,
          content: action.payload.doc,
          docUri: action.payload.response.docUri,
          pending: false,
          error: undefined
        };
      case types.CREATE_DOC_FAILURE:
        return {
          ...state,
          pending: false,
          error: action.payload.error
        };
      default:
        return state;
    }
  } else {
    return state;
  }
};

// SELECTORS
export const selectors = {
  error: state => state.error,
  pending: state => state.pending,
  docUri: state => state.docUri
};
