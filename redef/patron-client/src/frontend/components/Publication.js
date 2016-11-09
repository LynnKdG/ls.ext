import React, { PropTypes } from 'react'
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl'
import ClickableElement from '../components/ClickableElement'
import Constants from '../constants/Constants'

class Publication extends React.Component {
  renderTitle (publication) {
    let title = publication.mainTitle
    if (publication.partTitle) {
      title += ` — ${publication.partTitle}`
    }
    return title
  }

  renderBookCover (publication) {
    const coverAltText = this.props.intl.formatMessage(messages.coverImageOf, { title: this.renderTitle(publication) })
    if (publication.image) {
      return (
        <div className="book-cover">
          <ClickableElement onClickAction={this.props.expandSubResource}
                            onClickArguments={[ this.props.publication.id, true ]}>
            <img src={publication.image} alt={coverAltText} />
          </ClickableElement>
        </div>
      )
    } else if (typeof publication.mediaTypes[ 0 ] !== 'undefined') {
      return (
        <div className="book-cover missing">
          <ClickableElement onClickAction={this.props.expandSubResource}
                            onClickArguments={[ this.props.publication.id, true ]}>
            <i className={Constants.mediaTypeIconsMap[ Constants.mediaTypeIcons[ publication.mediaTypes[ 0 ] ] ]} />
          </ClickableElement>
        </div>
      )
    } else {
      return (
        <div className="book-cover" />
      )
    }
  }

  render () {
    const { publication, startReservation } = this.props
    const languages = [ ...new Set(publication.languages.map(language => this.props.intl.formatMessage({ id: language }))) ]
    const formats = [ ...new Set(publication.formats.map(format => this.props.intl.formatMessage({ id: format }))) ]
    const publicationYearLanguageSeparator = function () {
      if (publication.publicationYear && publication.languages.length > 0) {
        return ', '
      }
    }
    return (
      <article onClick={this.handleClick}
               className={this.props.open ? 'single-publication open' : 'single-publication'}
               data-automation-id={`publication_${publication.uri}`}>
        {this.renderBookCover(publication)}
        <div className="meta-info">
          <div className="publication-text-container">
            <div className="availability"
                 data-automation-id={publication.available ? 'publication_available' : 'publication_unavailable'}>
              <FormattedMessage {...(publication.available ? messages.available : messages.unavailable)} />
            </div>
            <ClickableElement onClickAction={this.props.expandSubResource}
                              onClickArguments={[ this.props.publication.id, true ]}>
              <h2 data-automation-id="publication_title">{this.renderTitle(publication)}</h2>
            </ClickableElement>
            <div className="meta-item">
              <span data-automation-id="publication_year">{publication.publicationYear}</span>
              <span>{publicationYearLanguageSeparator()}</span>
              <span data-automation-id="publication_languages">{languages.join(', ')}</span>
            </div>
            <div className="meta-item">
              <span data-automation-id="publication_formats">{formats.join(', ')}</span>
            </div>
            <div className="meta-item">
              <span data-automation-id="publication_record_id">{publication.recordId}</span>
            </div>
          </div>
          {publication.items.length > 0 ? (
            <div className="reserve-button">
              <ClickableElement onClickAction={startReservation} onClickArguments={publication.recordId}>
                <button className="red-btn" type="button"
                        data-automation-id={`recordId_${publication.recordId}`}>
                  <span data-automation-id="publication_order"><FormattedMessage {...messages.order} /></span>
                </button>
              </ClickableElement>
            </div>
          ) : null}
        </div>
        <div className="show-status">
          {this.props.open ? (
            <ClickableElement onClickAction={this.props.expandSubResource} onClickArguments={[ null, true ]}>
              <button data-automation-id="publication_close_show_more_info">
                <FormattedMessage {...messages.hideInfo} />
                <i className="icon-up-open" />
              </button>
            </ClickableElement>
          ) : (
            <ClickableElement onClickAction={this.props.expandSubResource}
                              onClickArguments={[ this.props.publication.id, true ]}>
              <button type="button" data-automation-id="publication_open_show_more_info">
                <FormattedMessage {...messages.showInfo} />
                <i className="icon-down-open" />
              </button>
            </ClickableElement>
          )}
        </div>
      </article>
    )
  }
}

Publication.propTypes = {
  publication: PropTypes.object.isRequired,
  expandSubResource: PropTypes.func.isRequired,
  startReservation: PropTypes.func.isRequired,
  open: PropTypes.bool,
  intl: intlShape.isRequired
}

export const messages = defineMessages({
  available: {
    id: 'Publication.available',
    description: 'The text displayed when the publication is available',
    defaultMessage: 'Available'
  },
  unavailable: {
    id: 'Publication.unavailable',
    description: 'The text displayed when the publication unavailable',
    defaultMessage: 'Unavailable'
  },
  coverImageOf: {
    id: 'Publication.coverImageOf',
    description: 'Used for alt text in images',
    defaultMessage: 'Cover image of: {title}'
  },
  order: {
    id: 'Publication.order',
    description: 'The button that allows users to reserve a publication',
    defaultMessage: 'Order'
  },
  showStatus: {
    id: 'Publication.showStatus',
    description: 'Label used on mobile to indicate that status can be shown',
    defaultMessage: 'Show status'
  },
  showInfo: {
    id: 'Publication.showInfo',
    description: 'Clickable item to expand info about a publication',
    defaultMessage: 'More info about this publication'
  },
  hideInfo: {
    id: 'Publication.hideInfo',
    description: 'Clickable item to collapse info about a publication',
    defaultMessage: 'Hide info about this publication'
  }
})

export default injectIntl(Publication)
