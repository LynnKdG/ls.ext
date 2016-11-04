/* eslint-env mocha */
import expect from 'expect'
import React from 'react'
import TestUtils from 'react-addons-test-utils'
import SearchResults, { __RewireAPI__ as DefaultExportSearchResultsRewireApi } from '../../src/frontend/components/SearchResults'
import ReactDOM from 'react-dom'
import { IntlProvider } from 'react-intl'

function setup (propOverrides) {
  const props = {
    locationQuery: {},
    searchError: false,
    totalHits: 0,
    searchResults: [],
    searchActions: { search: () => {} },
    fetchWorkResource: () => {},
    resources: {},
    items: {},
    page: 1,
    ...propOverrides
  }

  const output = TestUtils.renderIntoDocument(
    <IntlProvider locale="en">
      <SearchResults {...props} />
    </IntlProvider>
  )

  return {
    props: props,
    output: output,
    node: ReactDOM.findDOMNode(output)
  }
}

describe('components', () => {
  before(() => {
    DefaultExportSearchResultsRewireApi.__Rewire__('SearchResult', () => <div />)
  })

  after(() => {
    DefaultExportSearchResultsRewireApi.__ResetDependency__
  })

  describe('SearchResults', () => {
    it('should render search error', () => {
      const { node } = setup({ searchError: true })
      expect(node.getAttribute('data-automation-id')).toBe('search-error')
    })

    it('should render the correct number of results', () => {
      const { node } = setup({
        locationQuery: { query: 'test_query' },
        searchResults: [
          { relativeUri: 'relativeUri_1', publications: [] },
          { relativeUri: 'relativeUri_2', publications: [] },
          { relativeUri: 'relativeUri_3', publications: [] } ],
        totalHits: 3
      })

      expect(node.querySelector("[data-automation-id='search-result-entries']").childNodes.length).toBe(3)
    })
  })
})
