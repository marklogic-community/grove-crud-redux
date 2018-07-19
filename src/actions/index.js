/* global require */
import * as types from '../actionTypes';

require('isomorphic-fetch');

const defaultAPI = {
  getDoc: uri => {
    let contentType;
    return fetch(
      new URL(
        '/api/crud/all/' + encodeURIComponent(uri),
        document.baseURI
      ).toString(),
      { credentials: 'same-origin' }
    )
      .then(response => {
        if (!response.ok) throw new Error(response.statusText);
        contentType = response.headers.get('content-type');
        if (contentType && contentType.indexOf('application/json') !== -1) {
          return response.json();
        } else {
          return response.text();
        }
      })
      .then(response => {
        return {
          content: response.content || response,
          contentType: response.contentType || contentType
        };
      });
  }
};

export const fetchDoc = (docUri, extraArgs = {}) => {
  const API = extraArgs.api || defaultAPI;
  return dispatch => {
    dispatch({
      type: types.FETCH_DOC_REQUESTED,
      payload: { docUri }
    });

    return API.getDoc(docUri).then(
      response =>
        dispatch({
          type: types.FETCH_DOC_SUCCESS,
          payload: {
            response,
            docUri
          }
        }),
      error => {
        dispatch({
          type: types.FETCH_DOC_FAILURE,
          payload: {
            error: 'Error fetching document: ' + error.message,
            docUri
          }
        });
      }
    );
  };
};
