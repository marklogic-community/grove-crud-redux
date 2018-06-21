/* eslint-env jest */
import { applyMiddleware, createStore } from 'redux'
import thunk from 'redux-thunk'
import nock from 'nock'

import reducer, { selectors } from './'
import * as actions from './actions'

describe('documents', () => {
  const docUri = '/fetched-doc.json'
  const doc = { hello: 'world' }

  afterEach(nock.cleanAll)

  let store
  beforeEach(() => {
    store = createStore(reducer, applyMiddleware(thunk))
  })

  it('returns undefined for nonexistent document', () => {
    const noDocUri = '/no-such-doc.json'
    expect(selectors.documentByUri(store.getState(), noDocUri)).toBeUndefined()
    expect(selectors.jsonByUri(store.getState(), noDocUri)).toBeUndefined()
  })

  it('fetches a doc successfully', done => {
    nock('http://localhost')
      .get('/api/crud/all/' + encodeURIComponent(docUri))
      .reply(200, {
        content: doc
      })
    expect(selectors.isDocumentFetchPending(store.getState(), docUri)).toBe(
      false
    )
    const unsubscribe = store.subscribe(() => {
      expect(selectors.isDocumentFetchPending(store.getState(), docUri)).toBe(
        true
      )
      unsubscribe()
    })
    store.dispatch(actions.fetchDoc(docUri)).then(() => {
      expect(selectors.isDocumentFetchPending(store.getState(), docUri)).toBe(
        false
      )
      expect(selectors.documentByUri(store.getState(), docUri)).toEqual(doc)
      expect(selectors.jsonByUri(store.getState(), docUri)).toEqual(doc)
      expect(selectors.contentTypeByUri(store.getState(), docUri)).toEqual(
        'application/json'
      )
      done()
    })
  })

  it('handles failure when fetching a document', done => {
    const failedDocUri = '/failed-doc.json'
    nock('http://localhost')
      .get(/crud/)
      .reply(500)
    store.dispatch(actions.fetchDoc(failedDocUri)).then(() => {
      expect(
        selectors.isDocumentFetchPending(store.getState(), failedDocUri)
      ).toBe(false)
      // TODO: should 'documentByUri' return everything and contentByUri be
      // the content selector?
      expect(
        selectors.documentByUri(store.getState(), failedDocUri)
      ).toBeUndefined()
      expect(selectors.errorByUri(store.getState(), failedDocUri)).toContain(
        'Error'
      )
      done()
    })
  })

  it('handles success after a failure', done => {
    const fickleDocUri = '/fickle-doc.json'
    nock('http://localhost')
      .get(/crud/)
      .reply(500)
    store
      .dispatch(actions.fetchDoc(fickleDocUri))
      .then(() => {
        nock.cleanAll()
        nock('http://localhost')
          .get(/crud/)
          .reply(200, {
            content: doc
          })
        return store.dispatch(actions.fetchDoc(fickleDocUri))
      })
      .then(() => {
        expect(selectors.documentByUri(store.getState(), fickleDocUri)).toEqual(
          doc
        )
        expect(
          selectors.errorByUri(store.getState(), fickleDocUri)
        ).toBeUndefined()
        done()
      })
  })

  it('returns json when XML document is fetched', done => {
    const xml = '<PersonGivenName>Jill</PersonGivenName>'
    nock('http://localhost')
      .get('/api/crud/all/' + encodeURIComponent(docUri))
      .reply(200, xml, { 'Content-Type': 'application/xml' })
    store.dispatch(actions.fetchDoc(docUri)).then(() => {
      expect(selectors.documentByUri(store.getState(), docUri)).toEqual(xml)
      expect(selectors.jsonByUri(store.getState(), docUri)).toEqual({
        PersonGivenName: 'Jill'
      })
      done()
    })
  })
})
