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
    expect(selectors.isCreatePending(state)).toBeFalsy(); // toBe(false) slightly better
    expect(selectors.creationError(state)).toBe(undefined);
    expect(selectors.createdDocUri(state)).toBe(undefined);
  });

  it('creates an entity successfully', done => {
    nock('http://localhost')
      .post(/crud/)
      .reply(201, null, { location: '/all/some-unique-id.json' });
    const unsubscribe = store.subscribe(() => {
      expect(selectors.isCreatePending(store.getState())).toBe(true);
      unsubscribe();
    });
    store.dispatch(actions.createDoc({})).then(() => {
      try {
        expect(selectors.isCreatePending(store.getState())).toBeFalsy(); // toBe(false) slightly better
        expect(selectors.creationError(store.getState())).toBe(undefined);
        expect(selectors.createdDocUri(store.getState())).toBe(
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
      expect(selectors.isCreatePending(store.getState())).toBeFalsy(); // toBe(false) slightly better
      expect(selectors.creationError(store.getState())).toContain(
        'Internal Server Error'
      );
      done();
    });
  });
});
