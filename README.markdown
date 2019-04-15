# MarkLogic Document Management using Redux

This is a Redux implementation for interaction with MarkLogic documents in the browser. It forms part of the MarkLogic Grove project. See the [reference application](https://github.com/marklogic-community/grove-react-template) for an example of using this library in practice.

## Install

    npm install @marklogic-community/grove-crud-redux --save

## Use

### Actions

#### Override default backend API service wrapper

### Selectors

The provided selectors only know about their slice of state, so your consuming code needs to wrap them to provide their particular slice of state. For example:

```javascript
import {
  actions as documentActions,
  selectors as documentSelectors
} from 'grove-crud-redux';

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

const boundDocumentSelectors = bindSelectors(documentSelectors, 'documents');
```

## 'Ducks' architecture

This roughly follows [the architecture laid out in the re-ducks proposal]( https://github.com/alexnm/re-ducks/blob/f28ecc59d43542b8353948ede0cd3a059ca177dd/README.md):

Specifically, the actionCreators and selectors are the primary external UI. State and reducers should be an implementation detail.

## Contributing

You will need to install the devDependencies:

    npm install

### Building

This project uses [Webpack](https://webpack.js.org/) for building.

    npm run build

### Testing

This project uses [Jest](https://facebook.github.io/jest/) for testing.

    npm test

Or, if you want it to watch for file changes and automatically re-run the tests:

    npm run test:watch

### Linting

This project uses the [Javascript Standard Style](https://standardjs.com/). It will be checked automatically when you run tests, but you will have a greatly improved experience if you [install an ESLint checker in your text editor](https://eslint.org/docs/user-guide/integrations#editors), so linting errors are highlighted immediately.
