import '../sass/main.scss'
import React from 'react'
import ReactDOM from 'react-dom'
import configureStore from './store'
import Root from './containers/Root'
import { addLocaleData } from 'react-intl'
import en from 'react-intl/locale-data/en'
import no from 'react-intl/locale-data/no'
import { AppContainer } from 'react-hot-loader'
import { syncHistoryWithStore } from 'react-router-redux'
import { browserHistory } from 'react-router'

const store = configureStore()
const history = syncHistoryWithStore(browserHistory, store)

const areIntlLocalesSupported = require('intl-locales-supported')

const localesMyAppSupports = [
  'en', 'nb'
]

function applyPolyfill () {
  const IntlPolyfill = require('intl')
  Intl.NumberFormat = IntlPolyfill.NumberFormat
  Intl.DateTimeFormat = IntlPolyfill.DateTimeFormat
  require('intl/locale-data/jsonp/en.js')
  require('intl/locale-data/jsonp/nb.js')
  return IntlPolyfill
}

if (global.Intl) {
  if (!areIntlLocalesSupported(localesMyAppSupports)) {
    applyPolyfill()
  }
} else {
  global.Intl = applyPolyfill()
}

addLocaleData(en)
addLocaleData(no)

ReactDOM.render(
  <AppContainer><Root store={store} history={history} /></AppContainer>,
  document.getElementById('app')
)

if (module.hot) {
  module.hot.accept('./containers/Root', () => {
    const NewRoot = require('./containers/Root').default
    ReactDOM.render(
      <AppContainer><NewRoot store={store} history={history} /></AppContainer>,
      document.getElementById('app')
    )
  })
}
