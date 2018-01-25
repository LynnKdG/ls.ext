import React, { PropTypes } from 'react'
import { injectIntl, intlShape, defineMessages, FormattedMessage, FormattedHTMLMessage } from 'react-intl'

class Footer extends React.Component {
  constructor (props) {
    super(props)
    this.handleChangeLanguage = this.handleChangeLanguage.bind(this)
  }

  handleChangeLanguage () {
    this.props.loadLanguage(this.props.locale === 'no' ? 'en' : 'no')
  }

  ignore (event) {
    event.preventDefault()
  }

  render () {
    return (
      <div>
        <footer className="main-footer">
          <div className="footer-content">

            <div className="logo" >
              <img src="/images/logo_negative.svg" alt="Deichman logo" />
            </div >

            <div className="footer-text">
              <FormattedHTMLMessage {...messages.info} />
              <p><br /></p>
            </div>

            <nav className="secondary-navigation" type="navigation">
              <ul>
                <li>
                  <a href="https://www.deichman.no/kontakt-oss">
                    <FormattedMessage {...messages.contactUs} />
                  </a>
                </li>
                <li>
                  <a href="https://www.deichman.no/filialer">
                    <FormattedMessage {...messages.openingHours} />
                  </a>
                </li>
                <li data-automation-id="change_language_element"
                    data-current-language={this.props.intl.formatMessage(messages.currentLanguage)}
                    onClick={this.handleChangeLanguage}>
                    <a href="" onClick={this.ignore}>
                    <FormattedMessage {...messages.languageChoice} />
                  </a>
                </li>
                <li>
                  <a href="https://www.deichman.no/om-oss">
                    <FormattedMessage {...messages.aboutUs} />
                  </a>
                </li>
              </ul>
            </nav>

            <div className="cookie-policy">
              <p><a href="https://notfound.com">Personvern og informasjonskapsler</a></p>
            </div>

            <div className="social-icons">
              <a href="https://www.flickr.com/photos/deichmanske/"><img src="/images/flickr.svg" /></a>
              <a href="https://instagram.com/deichmanske/"><img src="/images/instagram.svg" /></a>
              <a href="https://twitter.com/deichmanske"><img src="/images/twitter.svg" /></a>
              <a href="https://www.facebook.com/deichmanske"><img src="/images/facebook.svg" /></a>
            </div>
          </div>
        </footer>
        <div className="footer-oslo">
          <img src="/images/oslo.png" />
          <span> OSLO KOMMUNE</span>
        </div>
      </div>
    )
  }
}

Footer.propTypes = {
  loadLanguage: PropTypes.func.isRequired,
  locale: PropTypes.string.isRequired,
  intl: intlShape.isRequired
}

export const messages = defineMessages({
  contactUs: {
    id: 'Footer.contactUs',
    description: 'Label for the contact us link',
    defaultMessage: 'Contact us'
  },
  openingHours: {
    id: 'Footer.openingHours',
    description: 'Label for the opening hours link',
    defaultMessage: 'Opening hours'
  },
  languageChoice: {
    id: 'Footer.languageChoice',
    description: 'Label for the link that changes the language, will be displayed in the language being chosen',
    defaultMessage: 'På norsk'
  },
  currentLanguage: {
    id: 'Footer.currentLanguage',
    description: 'The value of the currently applied language',
    defaultMessage: 'English'
  },
  aboutUs: {
    id: 'Footer.aboutUs',
    description: 'Label for the about us link',
    defaultMessage: 'About us'
  },
  info: {
    id: 'Footer.info',
    description: 'The text containing the address, telephone number and other information',
    defaultMessage: 'Arne Garborgs plass 4<br />0179 Oslo<br />Telephone: +47 23 43 29 00 <br />&nbsp;<br /><strong>Editor:</strong><br />Knut Skansen, director<br />'
  },
  feedback: {
    id: 'Footer.feedback',
    description: 'Feeback description',
    defaultMessage: 'Give feedback on search or My page'
  }
})

export default injectIntl(Footer)
