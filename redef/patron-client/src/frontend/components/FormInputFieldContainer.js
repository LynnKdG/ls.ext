import React, { createElement, PropTypes } from 'react'
import { injectIntl, intlShape, FormattedMessage } from 'react-intl'

import FormInputField from './FormInputField'

const FormInputFieldContainer = ({
  fieldName, fieldType, hasFieldLabel, fieldHeaderType, isFieldHeaderOverLabel, fieldMessage, getFieldValidator,
  containerTag, containerProps, headerTag, headerMessage
}) => {
  let formattedHeaderMessage
  if (headerTag && headerMessage) {
    formattedHeaderMessage = <FormattedMessage {headerMessage} />
  }
  const inputField = <FormInputField name={fieldName} type={fieldType} message={fieldMessage}
                                     getValidator={getFieldValidator} hasLabel={hasFieldLabel}
                                     isLabelOverInput={isFieldHeaderOverLabel} headerType={fieldHeaderType}/>

  return createElement(containerTag, containerProps,
    headerTag && headerMessage ? createElement(headerTag, {}, formattedHeaderMessage) : null,
    inputField)
}

FormInputFieldContainer.propTypes = {
  fieldName: PropTypes.string.isRequired,
  fieldType: PropTypes.string.isRequired,
  hasFieldLabel: PropTypes.bool.isRequired,
  fieldHeaderType: PropTypes.string.isRequired,
  isFieldHeaderOverLabel: PropTypes.bool.isRequired,
  fieldMessage: PropTypes.object.isRequired,
  getFieldValidator: PropTypes.func,
  containerTag: PropTypes.string.isRequired,
  containerProps: PropTypes.object.isRequired,
  headerTag: PropTypes.string,
  headerMessage: PropTypes.string
}

export default injectIntl(FormInputFieldContainer)