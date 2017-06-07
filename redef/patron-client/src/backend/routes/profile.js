const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()
const userSettingsMapper = require('../utils/userSettingsMapper')
const bcrypt = require('bcrypt-nodejs')
const userInfoForm = require('../../common/forms/userInfoForm')
const contactDetailsForm = require('../../common/forms/contactDetailsForm')
const extendedValidatorUserInfo = require('../utils/extendedValidator')(userInfoForm)
const extendedValidatorContactDetails = require('../utils/extendedValidator')(contactDetailsForm)

module.exports = (app) => {
  const fetch = require('../fetch')(app)

  app.get('/api/v1/profile/history', (request, response) => {
    // fetch(`http://xkoha:8081/api/v1/patrons/9/history`)
    fetch(`http://xkoha:8081/api/v1/patrons/${request.session.borrowerNumber}/history`)
      .then(res => {
        if (res.status === 200) {
          return res.json()
        } else {
          response.status(res.status).send(res.statusText)
          throw Error()
        }
      }).then(json => response.status(200).send(parseHistory(json)))
      .catch(error => {
        console.log(error)
        response.sendStatus(500)
      })
  })

  app.get('/api/v1/profile/info', (request, response) => {
    fetch(`http://xkoha:8081/api/v1/patrons/${request.session.borrowerNumber}`)
      .then(res => {
        if (res.status === 200) {
          return res.json()
        } else {
          response.status(res.status).send(res.statusText)
          throw Error()
        }
      }).then(json => response.status(200).send(parsePatron(json)))
      .catch(error => {
        console.log(error)
        response.sendStatus(500)
      })
  })

  app.post('/api/v1/profile/info', jsonParser, (request, response) => {
    const errors = extendedValidatorUserInfo(request.body)
    if (Object.keys(errors).length > 0) {
      response.status(400).send({ errors: errors })
      return
    }

    const patron = {
      address: request.body.address,
      zipcode: request.body.zipcode,
      city: request.body.city,
      country: request.body.country,
      smsalertnumber: request.body.mobile,
      phone: request.body.telephone,
      email: request.body.email
    }

    fetch(`http://xkoha:8081/api/v1/patrons/${request.session.borrowerNumber}`, {
      method: 'PUT',
      body: JSON.stringify(patron)
    }).then(res => {
      if (res.status === 200 || res.status === 204) {
        res.json().then(json => response.status(res.status).send(parsePatron(json)))
      } else {
        response.status(res.status).send(res.body)
      }
    })
      .catch(error => {
        console.log(error)
        response.sendStatus(500)
      })
  })

  app.post('/api/v1/profile/contactdetails', jsonParser, (request, response) => {
    const errors = extendedValidatorContactDetails(request.body)
    if (Object.keys(errors).length > 0) {
      response.status(400).send({ errors: errors })
      return
    }

    const contactDetails = {
      smsalertnumber: request.body.mobile,
      email: request.body.email
    }

    fetch(`http://xkoha:8081/api/v1/patrons/${request.session.borrowerNumber}`, {
      method: 'PUT',
      body: JSON.stringify(contactDetails)
    }).then(res => {
      if (res.status === 200 || res.status === 204) {
        res.json().then(json => response.status(res.status).send(parsePatron(json)))
      } else {
        response.status(res.status).send(res.body)
      }
    })
    .catch(error => {
      console.log(error)
      response.sendStatus(500)
    })
  })

  app.get('/api/v1/profile/loans', (request, response) => {
    fetch(`http://xkoha:8081/api/v1/patrons/${request.session.borrowerNumber}/loansandreservations`)
      .then(res => {
        if (res.status === 200) {
          return res.json()
        } else {
          throw Error(res.statusText)
        }
      }).then(json => {
        response.send(json)
      })
      .catch(error => {
        console.log(error)
        response.sendStatus(500)
      })
  })

  app.post('/api/v1/profile/settings', jsonParser, (request, response) => {
    fetch(`http://xkoha:8081/api/v1/messagepreferences/${request.session.borrowerNumber}`, {
      method: 'PUT',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify(userSettingsMapper.patronSettingsToKohaSettings(request.body))
    }).then(res => {
      if (res.status === 200) {
        return res.json()
      } else {
        response.status(res.status).send(res.body)
      }
    }).then(kohaSettings => response.status(200).send(userSettingsMapper.kohaSettingsToPatronSettings(kohaSettings)))
      .catch(error => {
        console.log(error)
        response.sendStatus(500)
      })
  })

  app.put('/api/v1/profile/settings/password', jsonParser, (request, response) => {
    if (bcrypt.compareSync(request.body.currentPassword, request.session.passwordHash)) {
      fetch(`http://xkoha:8081/api/v1/patrons/${request.session.borrowerNumber}`, {
        method: 'PUT',
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify({ password: request.body.newPassword })
      }).then(res => {
        if (res.status === 200) {
          request.session.passwordHash = bcrypt.hashSync(request.body.newPassword)
          response.sendStatus(200)
        } else {
          response.status(res.status).send(res.body)
        }
      }).catch(error => {
        console.log(error)
        response.sendStatus(500)
      })
    } else {
      response.status(403).send('Old password is not correct')
    }
  })

  app.get('/api/v1/profile/settings', (request, response) => {
    return fetch(`http://xkoha:8081/api/v1/messagepreferences/${request.session.borrowerNumber}`)
      .then(res => {
        if (res.status === 200) {
          return res.json()
        } else {
          throw Error(res.statusText)
        }
      }).then(kohaSettings => userSettingsMapper.kohaSettingsToPatronSettings(kohaSettings))
      .then(patronSettings => response.send(patronSettings))
      .catch(error => {
        console.log(error)
        response.sendStatus(500)
      })
  })

  function parseHistory (history) {
    console.log(history)
  }

  function parsePatron (patron) {
    return {
      borrowerNumber: patron.borrowernumber || '',
      cardNumber: patron.cardnumber || '',
      homeBranch: patron.branchcode || '',
      name: `${patron.firstname} ${patron.surname}`,
      address: patron.address || '',
      zipcode: patron.zipcode || '',
      city: patron.city || '',
      country: patron.country || '',
      mobile: patron.smsalertnumber || '', // is this the only sms number?
      telephone: patron.phone || '',
      email: patron.email || '',
      birthdate: patron.dateofbirth || '',
      loanerCardIssued: patron.dateenrolled || '',
      /* lastUpdated: '2016-02-01', TODO does not exist in koha yet */
      loanerCategory: patron.categorycode || ''
    }
  }
}
