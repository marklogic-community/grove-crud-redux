/* eslint-env jest */
import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import nock from 'nock';

import reducer, { selectors } from './';
import * as actions from './actions';

describe('CREATE', () => {
  afterEach(nock.cleanAll);

  let store;
  beforeEach(() => {
    store = createStore(reducer, applyMiddleware(thunk));
  });

  it('has expected initial state', () => {
    const state = store.getState();
    // TODO: rename 'pending' to isCreatePending()
    expect(selectors.pending(state)).toBeFalsy(); // toBe(false) slightly better
    // TODO: rename 'error' to creationError()
    expect(selectors.error(state)).toBe(undefined);
    // TODO: rename 'docUri' to createdDocUri()
    expect(selectors.docUri(state)).toBe(undefined);
  });

  it('creates an entity successfully', done => {
    nock('http://localhost')
      .post(/crud/)
      .reply(201, null, { location: '/all/some-unique-id.json' });
    const unsubscribe = store.subscribe(() => {
      // TODO: rename 'pending' to isCreatePending()
      expect(selectors.pending(store.getState())).toBe(true);
      unsubscribe();
    });
    store.dispatch(actions.createDoc({})).then(() => {
      try {
        // TODO: rename 'pending' to isCreatePending()
        expect(selectors.pending(store.getState())).toBeFalsy(); // toBe(false) slightly better
        // TODO: rename 'error' to creationError()
        expect(selectors.error(store.getState())).toBe(undefined);
        // TODO: rename 'docUri' to createdDocUri()
        expect(selectors.docUri(store.getState())).toBe(
          '/all/some-unique-id.json'
        );
      } catch (error) {
        done.fail(error);
      }
      done();
    });
  });

  it('handles failure created an entity', done => {
    nock('http://localhost')
      .post(/crud/)
      .reply(500);
    store.dispatch(actions.createDoc({})).then(() => {
      // TODO: rename 'pending' to isCreatePending()
      expect(selectors.pending(store.getState())).toBeFalsy(); // toBe(false) slightly better
      // TODO: rename 'error' to creationError()
      expect(selectors.error(store.getState())).toContain(
        'Internal Server Error'
      );
      done();
    });
  });
});
