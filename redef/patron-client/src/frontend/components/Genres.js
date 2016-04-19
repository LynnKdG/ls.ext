import React, { PropTypes } from 'react'
import { defineMessages, FormattedMessage } from 'react-intl'

export default React.createClass({
  propTypes: {
    genres: PropTypes.array.isRequired
  },
  renderLabel (genre) {
    let label = genre.prefLabel
    if (genre.genreSubdivision) {
      label += ` (${genre.genreSubdivision})`
    }
    return label
  },
  render () {
    let genres = this.props.genres.map(genre => this.renderLabel(genre))
    return (
      <p>
        <strong><FormattedMessage {...messages.genre} /> </strong>
        <span data-automation-id='work_genres'>{genres.join(', ')}</span>
      </p>
    )
  }
})

const messages = defineMessages({
  genre: {
    id: 'Genres.genre',
    description: 'The text displayed to identify genres',
    defaultMessage: 'Genre:'
  }
})
