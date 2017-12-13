/* global fetch, URL */
// TODO: extract documents to one level up (ml-documents-redux)
import * as types from '../actionTypes'

require('isomorphic-fetch')

const defaultAPI = {
  getDoc: uri => {
    let contentType
    return fetch(
      new URL('/api/documents?uri=' + uri, document.baseURI).toString()
    ).then(response => {
      if (!response.ok) throw new Error(response.statusText)
      contentType = response.headers.get('content-type')
      if (contentType && contentType.indexOf('application/json') !== -1) {
        return response.json()
      } else {
        return response.text()
      }
    }).then(response => {
      return {
        content: response.content,
        contentType: response.contentType || contentType
      }
    })
  }
}

export const fetchDoc = (docUri, extraArgs = {}) => {
  const API = extraArgs.docAPI || defaultAPI
  return (dispatch) => {
    dispatch({
      type: types.FETCH_DOC_REQUESTED,
      payload: {docUri}
    })

    return API.getDoc(docUri).then(
      response => dispatch({
        type: types.FETCH_DOC_SUCCESS,
        payload: {
          response,
          docUri
        }
      }),
      error => {
        console.warn('Error fetching doc: ', error)
        dispatch({
          type: types.FETCH_DOC_FAILURE,
          payload: {
            error: 'Error fetching document: ' + error.message,
            docUri
          }
        })
      }
    )
  }
}

// export const fetchDocIfNeeded = () => {
//   return {
//     type: ''
//   }
// }
