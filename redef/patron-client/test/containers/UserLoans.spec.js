/* eslint-env mocha */
import expect from 'expect'
import React from 'react'
import TestUtils from 'react-addons-test-utils'
import UserLoans from '../../src/frontend/containers/UserLoans'
import ReactDOM from 'react-dom'
import { IntlProvider } from 'react-intl'
import { createStore } from 'redux'
import rootReducer from '../../src/frontend/reducers'
import { Provider } from 'react-redux'
import * as LibraryActions from '../../src/frontend/actions/LibraryActions'
import * as ProfileActions from '../../src/frontend/actions/ProfileActions'
import * as LoginActions from '../../src/frontend/actions/LoginActions'
import { formatDate } from '../../src/frontend/utils/dateFormatter'

function setup (propOverrides) {
  const props = {
    location: { pathname: '', query: {} },
    mediaQueryValues: { width: 992 },
    patronCategory: 'V',
    ...propOverrides
  }

  const store = createStore(rootReducer)
  const libraries = {
    'branchCode_1': 'library_1',
    'branchCode_2': 'library_2',
    'branchCode_3': 'library_3'
  }
  store.dispatch(LibraryActions.receiveLibraries(libraries))
  store.dispatch(LoginActions.loginSuccess('test_username', 'test_borrowernumber', 'test_borrowerName'))
  const loansAndReservations = {
    pickups: [
      {
        mediaType: 'http://data.deichman.no/mediaType#Film',
        id: 'reserveId_1',
        recordId: 'recordId_1',
        title: 'title_1',
        contributor: {
          contributorName: 'author_1'
        },
        publicationYear: 'publicationYear_1',
        expirationDate: '01/10/2016',
        pickupNumber: 'pickupNumber_1',
        branchCode: 'branchCode_1'
      },
      {
        mediaType: 'http://data.deichman.no/mediaType#Film',
        id: 'reserveId_2',
        recordId: 'recordId_2',
        title: 'title_2',
        contributor: {
          contributorName: 'author_2'
        },
        publicationYear: 'publicationYear_1',
        expirationDate: '02/10/2016',
        pickupNumber: 'pickupNumber_2',
        branchCode: 'branchCode_2'
      }
    ],
    reservations: [
      {
        mediaType: 'http://data.deichman.no/mediaType#Film',
        id: 'reserveId_1',
        recordId: 'recordId_1',
        title: 'title_1',
        contributor: {
          contributorName: 'author_1'
        },
        queuePlace: '1',
        expected: '1–2',
        expectedTestData: '(~ 1–2 weeks)',
        branchCode: 'branchCode_1',
        estimatedWait: {
          error: null,
          estimate: 2,
          pending: false
        }
      },
      {
        mediaType: 'http://data.deichman.no/mediaType#Film',
        id: 'reserveId_2',
        recordId: 'recordId_2',
        title: 'title_2',
        contributor: {
          contributorName: 'author_2'
        },
        queuePlace: '6',
        expected: '12',
        expectedTestData: '(more than 12 weeks)',
        branchCode: 'branchCode_2',
        estimatedWait: {
          error: null,
          estimate: 2,
          pending: false
        }
      },
      {
        mediaType: 'http://data.deichman.no/mediaType#Film',
        id: 'reserveId_3',
        recordId: 'recordId_3',
        title: 'title_3',
        contributor: {
          contributorName: 'author_3'
        },
        queuePlace: '3',
        expected: 'unknown',
        expectedTestData: '(Unknown waiting period)',
        branchCode: 'branchCode_3',
        estimatedWait: {
          error: null,
          estimate: 2,
          pending: false
        }
      }
    ],
    loans: [
      {
        mediaType: 'http://data.deichman.no/mediaType#Film',
        id: 'loansId_1',
        recordId: 'recordId_1',
        title: 'title_1',
        contributor: {
          contributorName: 'author_1'
        },
        publicationYear: 'publicationYear_1',
        dueDate: '2017-01-01',
        checkoutId: 'checkoutId_1'
      },
      {
        mediaType: 'http://data.deichman.no/mediaType#Film',
        id: 'loansId_2',
        recordId: 'recordId_2',
        title: 'title_2',
        contributor: {
          contributorName: 'author_2'
        },
        publicationYear: 'publicationYear_2',
        dueDate: '2016-12-12',
        checkoutId: 'checkoutId_2'
      }
    ]
  }
  store.dispatch(ProfileActions.receiveProfileLoans(loansAndReservations))

  const messages = {
    'http://data.deichman.no/mediaType#Film': 'FILM',
    'branchCode_1': 'Branch 1',
    'branchCode_2': 'Branch 2',
    'UserLoans.unknown': '(Unknown waiting period)'
  }

  const output = TestUtils.renderIntoDocument(
    <Provider store={store}>
      <IntlProvider locale="en" messages={messages}>
        <UserLoans {...props} />
      </IntlProvider>
    </Provider>
  )

  return {
    props: props,
    output: output,
    node: ReactDOM.findDOMNode(output),
    store: store,
    messages: messages
  }
}

describe('containers', () => {
  describe('UserLoans', () => {
    it('should display pickups', () => {
      const { node, store, messages } = setup()
      const { loansAndReservations } = store.getState().profile
      const pickups = node.querySelectorAll("[data-automation-id='UserLoans_pickup']")
      expect(pickups.length).toEqual(2)
      Array.prototype.forEach.call(pickups, (pickup, index) => {
        expect(pickup.querySelector("[data-automation-id='UserLoans_pickup_type']").textContent).toEqual(messages[loansAndReservations.pickups[ index ].mediaType])
        expect(pickup.querySelector("[data-automation-id='UserLoans_pickup_title']").textContent).toEqual(loansAndReservations.pickups[ index ].title)
        expect(pickup.querySelector("[data-automation-id='UserLoans_pickup_author']").textContent).toEqual(loansAndReservations.pickups[ index ].contributor.contributorName)
        expect(pickup.querySelector("[data-automation-id='UserLoans_pickup_expiry']").textContent).toEqual(formatDate(new Date(Date.parse(loansAndReservations.pickups[ index ].expirationDate) + (1000 * 60 * 60 * 24 * 7)).toISOString(1).split('T')[ 0 ]))
        expect(pickup.querySelector("[data-automation-id='UserLoans_pickup_pickupNumber']").textContent).toEqual(loansAndReservations.pickups[ index ].pickupNumber)
        expect(pickup.querySelector("[data-automation-id='UserLoans_pickup_branch']").textContent).toEqual(messages[ loansAndReservations.pickups[ index ].branchCode ])
      })
    })

    it('should display reservations', () => {
      const { node, store, messages } = setup()
      const { loansAndReservations } = store.getState().profile
      const { libraries } = store.getState().application
      const reservations = node.querySelectorAll("[data-automation-id='UserLoans_reservation']")
      expect(reservations.length).toEqual(3)
      // indexMap is used because the component sorts the output
      const indexMap = {
        0: 0,
        1: 2,
        2: 1
      }
      Array.prototype.forEach.call(reservations, (reservation, index) => {
        const queuePlace = (reservation.querySelector("[data-automation-id='UserLoans_reservation_queue_place']").textContent).trim()
        expect(reservation.querySelector("[data-automation-id='UserLoans_reservation_type']").textContent).toEqual(messages[loansAndReservations.reservations[ index ].mediaType])
        expect(reservation.querySelector("[data-automation-id='UserLoans_reservation_title']").textContent).toEqual(loansAndReservations.reservations[ indexMap[ index ] ].title)
        expect(reservation.querySelector("[data-automation-id='UserLoans_reservation_author']").textContent).toEqual(loansAndReservations.reservations[ indexMap[ index ] ].contributor.contributorName)
        expect(queuePlace.replace(/\s/g, '')).toEqual(`${loansAndReservations.reservations[ indexMap[ index ] ].queuePlace}(~${loansAndReservations.reservations[ indexMap[ index ] ].estimatedWait.estimate}–${loansAndReservations.reservations[ indexMap[ index ] ].estimatedWait.estimate + 2}weeks)`)
        // TODO: Uncomment below line when enabling estimates again
        // expect(reservation.querySelector("[data-automation-id='UserLoans_reservation_waitingPeriod']").textContent).toEqual(loansAndReservations.reservations[ indexMap[index] ].expectedTestData)
        const select = reservation.querySelector("[data-automation-id='UserLoans_reservation_library'] select")
        expect(select.options[ select.selectedIndex ].textContent).toEqual(libraries[ loansAndReservations.reservations[ indexMap[ index ] ].branchCode ])
      })
    })

    it('should display reservations on smaller screens', () => {
      const { node, store, messages } = setup({ mediaQueryValues: { width: 991 } })
      const { loansAndReservations } = store.getState().profile
      const { libraries } = store.getState().application
      const reservations = node.querySelectorAll("[data-automation-id='UserLoans_reservation']")
      expect(reservations.length).toEqual(3)
      // indexMap is used because the component sorts the output
      const indexMap = {
        0: 0,
        1: 2,
        2: 1
      }
      Array.prototype.forEach.call(reservations, (reservation, index) => {
        const queuePlace = (reservation.querySelector("[data-automation-id='UserLoans_reservation_queue_place']").textContent).trim()

        expect(reservation.querySelector("[data-automation-id='UserLoans_reservation_type']").textContent).toEqual(messages[loansAndReservations.reservations[ index ].mediaType])
        expect(reservation.querySelector("[data-automation-id='UserLoans_reservation_title']").textContent).toEqual(loansAndReservations.reservations[ indexMap[ index ] ].title)
        expect(reservation.querySelector("[data-automation-id='UserLoans_reservation_author']").textContent).toEqual(loansAndReservations.reservations[ indexMap[ index ] ].contributor.contributorName)
        expect(queuePlace.replace(/\s/g, '')).toEqual(`${loansAndReservations.reservations[ indexMap[ index ] ].queuePlace}(~${loansAndReservations.reservations[ indexMap[ index ] ].estimatedWait.estimate}–${loansAndReservations.reservations[ indexMap[ index ] ].estimatedWait.estimate + 2}weeks)`)
        // TODO: Uncomment below line when enabling estimates again
        // expect(reservation.querySelector("[data-automation-id='UserLoans_reservation_waitingPeriod']").textContent).toEqual(loansAndReservations.reservations[ indexMap[index] ].expectedTestData)
        const select = reservation.querySelector("[data-automation-id='UserLoans_reservation_library'] select")
        expect(select.options[ select.selectedIndex ].textContent).toEqual(libraries[ loansAndReservations.reservations[ indexMap[ index ] ].branchCode ])
      })
    })

    it('should display loans', () => {
      const { node, store } = setup({ mediaQueryValues: { width: 991 } })
      const { loansAndReservations } = store.getState().profile
      const loans = node.querySelectorAll("[data-automation-id='UserLoans_loan']")
      expect(loans.length).toEqual(2)
      // indexMap is used because the component sorts the output
      const indexMap = {
        0: 1,
        1: 0
      }
      Array.prototype.forEach.call(loans, (loan, index) => {
        expect(loan.querySelector("[data-automation-id='UserLoans_loan_title']").textContent).toEqual(loansAndReservations.loans[ indexMap[ index ] ].title)
        expect(loan.querySelector("[data-automation-id='UserLoans_loan_author']").textContent).toEqual(loansAndReservations.loans[ indexMap[ index ] ].contributor.contributorName)
        expect(loan.querySelector("[data-automation-id='UserLoans_loan_publicationYear']").textContent).toEqual(loansAndReservations.loans[ indexMap[ index ] ].publicationYear)
        expect(loan.querySelector("[data-automation-id='UserLoans_loan_dueDate']").textContent).toEqual(formatDate(loansAndReservations.loans[ indexMap[ index ] ].dueDate))
      })
    })
  })
})
