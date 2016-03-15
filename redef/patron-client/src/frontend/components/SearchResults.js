import React, { PropTypes } from 'react'
import shallowEqual from 'fbjs/lib/shallowEqual'

import SearchResult from './SearchResult'

export default React.createClass({
  propTypes: {
    locationQuery: PropTypes.object,
    searchActions: PropTypes.object.isRequired,
    searchError: PropTypes.any.isRequired,
    totalHits: PropTypes.number.isRequired,
    searchResults: PropTypes.array.isRequired
  },
  componentWillMount () {
    this.props.searchActions.search()
  },
  componentDidUpdate (prevProps) {
    if (!shallowEqual(this.props.locationQuery, prevProps.locationQuery)) {
      this.props.searchActions.search()
    }
  },
  render () {
    if (this.props.searchError) {
      return (
        <p data-automation-id='search-error'>
          Noe gikk galt med søket.
        </p>
      )
    }
    let total = this.props.totalHits
    let searchQuery = this.props.locationQuery.query
    let resultsText
    if (!this.props.locationQuery.query) {
      resultsText = <h3 data-automation-id='no-search'>Søk etter verk</h3>
    } else {
      resultsText = (
        <h3>Ditt søk på '<span data-automation-id='current-search-term'>{searchQuery}</span>' ga <span
          data-automation-id='hits-total'>{total}</span> treff</h3>
      )
    }
    let entries = []
    if (this.props.locationQuery.query) {
      entries = this.props.searchResults.map(function (result) {
        return (<SearchResult key={result.relativeUri} result={result}/>)
      })
    }
    return (
      <section className='col search-results'>
        <div className='panel'>
          {resultsText}
        </div>
        <div data-automation-id='search-result-entries'>
          {entries}
        </div>
      </section>
    )
  }
})
