import { LOCATION_CHANGE } from 'react-router-redux'

import {
  REQUEST_PROFILE_INFO,
  RECEIVE_PROFILE_INFO,
  PROFILE_INFO_FAILURE,
  REQUEST_PROFILE_LOANS,
  RECEIVE_PROFILE_LOANS,
  PROFILE_LOANS_FAILURE,
  REQUEST_PROFILE_SETTINGS,
  RECEIVE_PROFILE_SETTINGS,
  PROFILE_SETTINGS_FAILURE,
  CONTACT_DETAILS_NEED_VERIFICATION,
  CHANGE_CONTACT_DETAILS_SUCCESS,
  CHANGE_CONTACT_DETAILS_FAILURE,
  POST_PROFILE_INFO_SUCCESS,
  POST_PROFILE_SETTINGS_SUCCESS,
  POST_PROFILE_SETTINGS_FAILURE,
  RESET_PROFILE_SETTINGS_SUCCESS,
  REQUEST_CHANGE_PASSWORD,
  CHANGE_PASSWORD_SUCCESS,
  CHANGE_PASSWORD_FAILURE,
  LOGIN_SUCCESS,
  LOGOUT_SUCCESS,
  RECEIVE_LOGIN_STATUS,
  CHANGE_PICKUP_LOCATION_SUCCESS,
  CHANGE_RESERVATION_SUSPENSION_SUCCESS,
  EXTEND_LOAN_SUCCESS,
  EXTEND_LOAN_FAILURE,
  REQUEST_MANAGE_HISTORY,
  MANAGE_HISTORY_FAILURE,
  CHANGE_HISTORY_PRIVACY
} from '../constants/ActionTypes'

const initialState = {
  borrowerName: null,
  category: null,
  isRequestingLoansAndReservations: false,
  loansAndReservationsError: null,
  loansAndReservations: {
    pickups: [],
    loans: [],
    holds: [],
    remoteholds: [],
    remoteloans: []
  },
  isRequestingPersonalInformation: false,
  personalInformationError: null,
  personalInformation: {},
  personalAttributes: {},
  isRequestingSettings: false,
  settingsError: null,
  settings: {},
  isRequestingChangePassword: false,
  changePasswordError: null,
  changePasswordSuccess: false,
  contactDetailsNeedVerification: false,
  contactDetailsVerificationError: null,
  postProfileSettingsSuccess: false,
  postProfileSettingsFailure: false,
  postHistorySettingsFailure: false
}

export default function profile (state = initialState, action) {
  switch (action.type) {
    case CHANGE_HISTORY_PRIVACY:
      return { ...state, isRequestingPersonalInformation: false, personalInformation: { privacy: action.payload.privacy } }
    case MANAGE_HISTORY_FAILURE:
      return { ...state, isRequestingPersonalInformation: false, postHistorySettingsFailure: true }
    case REQUEST_MANAGE_HISTORY:
      return { ...state, isRequestingPersonalInformation: true }
    case REQUEST_PROFILE_INFO:
      return { ...state, /* personalInformationError: null, */ isRequestingPersonalInformation: true }
    case RECEIVE_PROFILE_INFO:
      return {
        ...state,
        personalInformation: action.payload.info,
        personalAttributes: action.payload.attributes,
        personalInformationError: null,
        isRequestingPersonalInformation: false
      }
    case PROFILE_INFO_FAILURE:
      return { ...state, personalInformationError: action.payload, isRequestingPersonalInformation: false }
    case REQUEST_PROFILE_LOANS:
      return { ...state, /* loansAndReservationsError: null, */ isRequestingLoansAndReservations: true }
    case RECEIVE_PROFILE_LOANS:
      return {
        ...state,
        loansAndReservations: action.payload.loans,
        loansAndReservationsError: null,
        isRequestingLoansAndReservations: false
      }
    case PROFILE_LOANS_FAILURE:
      return { ...state, loansAndReservationsError: action.payload, isRequestingLoansAndReservations: false }
    case REQUEST_PROFILE_SETTINGS:
      return { ...state, /* settingsError: null, */ isRequestingSettings: true }
    case RECEIVE_PROFILE_SETTINGS:
      return { ...state, settings: action.payload.settings, settingsError: null, isRequestingSettings: false }
    case PROFILE_SETTINGS_FAILURE:
      return { ...state, settingsError: action.payload, isRequestingSettings: false }
    case POST_PROFILE_INFO_SUCCESS:
      return { ...state, contactDetailsNeedVerification: false, contactDetailsVerificationError: null }
    case POST_PROFILE_SETTINGS_SUCCESS:
      return { ...state, postProfileSettingsSuccess: true, postProfileSettingsFailure: false }
    case RESET_PROFILE_SETTINGS_SUCCESS:
      return { ...state, postProfileSettingsSuccess: false }
    case POST_PROFILE_SETTINGS_FAILURE:
      return { ...state, postProfileSettingsSuccess: false, postProfileSettingsFailure: true }
    case CONTACT_DETAILS_NEED_VERIFICATION:
      return { ...state, contactDetailsNeedVerification: true, contactDetailsVerificationError: null }
    case CHANGE_CONTACT_DETAILS_FAILURE:
      return { ...state, contactDetailsNeedVerification: true, contactDetailsVerificationError: action.payload }
    case CHANGE_CONTACT_DETAILS_SUCCESS:
      return { ...state, contactDetailsNeedVerification: false, contactDetailsVerificationError: null }
    case REQUEST_CHANGE_PASSWORD:
      return {
        ...state, /* changePasswordError: null, */
        isRequestingChangePassword: true,
        changePasswordSuccess: false
      }
    case CHANGE_PASSWORD_SUCCESS:
      return { ...state, changePasswordError: null, isRequestingChangePassword: false, changePasswordSuccess: true }
    case CHANGE_PASSWORD_FAILURE:
      return {
        ...state,
        changePasswordError: action.payload,
        isRequestingChangePassword: false,
        changePasswordSuccess: false
      }
    case LOCATION_CHANGE:
      return {
        ...state,
        loansAndReservationsError: null,
        personalInformationError: null,
        settingsError: null,
        changePasswordError: null,
        changePasswordSuccess: false
      }
    case LOGIN_SUCCESS:
      return { ...initialState, borrowerName: action.payload.borrowerName, category: action.payload.category }
    case LOGOUT_SUCCESS:
      return initialState
    case CHANGE_PICKUP_LOCATION_SUCCESS:
      return {
        ...state,
        loansAndReservations: {
          ...state.loansAndReservations,
          reservations: state.loansAndReservations.holds.map(hold => {
            if (hold.id === action.payload.reserveId) {
              hold.branchCode = action.payload.branchCode
            }
            return hold
          })
        }
      }
    case CHANGE_RESERVATION_SUSPENSION_SUCCESS:
      return {
        ...state,
        loansAndReservations: {
          ...state.loansAndReservations,
          reservations: state.loansAndReservations.holds.map(hold => {
            if (hold.id === action.payload.reserveId) {
              hold.suspended = action.payload.suspended ? '1' : '0'
              hold.suspendUntil = action.payload.suspendUntil
            }
            return hold
          })
        }
      }
    case EXTEND_LOAN_SUCCESS:
      return {
        ...state,
        loansAndReservations: {
          ...state.loansAndReservations,
          loans: state.loansAndReservations.loans.map(loan => {
            if (loan.id === action.payload.checkoutId) {
              loan.renewalStatus = action.payload.message
              loan.dueDate = action.payload.newDueDate
            }
            return loan
          })
        }
      }
    case EXTEND_LOAN_FAILURE:
      return {
        ...state,
        loansAndReservations: {
          ...state.loansAndReservations,
          loans: state.loansAndReservations.loans.map(loan => {
            if (loan.id === action.payload.checkoutId) {
              loan.renewalStatus = action.payload.message
            }
            return loan
          })
        }
      }
    case RECEIVE_LOGIN_STATUS:
      return { ...state, borrowerName: action.payload.borrowerName, homeBranch: action.payload.homeBranch, category: action.payload.category }
    default:
      return state
  }
}
