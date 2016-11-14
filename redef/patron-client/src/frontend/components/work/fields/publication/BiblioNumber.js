import React, { PropTypes } from 'react'
import { defineMessages } from 'react-intl'
import MetaItem from '../../../MetaItem'

const BiblioNumber = ({ biblioNumber }) => {
  if (biblioNumber) {
    return (
      <MetaItem label={messages.biblioNumber} data-automation-id="publication_biblioNumber">{biblioNumber}</MetaItem>
    )
  } else {
    return null
  }
}

BiblioNumber.propTypes = {
  biblioNumber: PropTypes.string
}

export const messages = defineMessages({
  biblioNumber: {
    id: 'BiblioNumber.biblioNumber',
    description: 'Label for biblionumber meta',
    defaultMessage: 'BiblioNumber'
  }
})

export default BiblioNumber
