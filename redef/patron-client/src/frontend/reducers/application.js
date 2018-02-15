import { actionTypes } from 'redux-localstorage'
import {
  RECEIVE_TRANSLATION,
  SHOW_LOGIN_DIALOG,
  REQUEST_LOGIN,
  LOGIN_FAILURE,
  LOGIN_SUCCESS,
  REQUEST_LOGOUT,
  LOGOUT_FAILURE,
  LOGOUT_SUCCESS,
  REQUEST_LOGIN_STATUS,
  LOGIN_STATUS_FAILURE,
  RECEIVE_LOGIN_STATUS,
  REQUEST_LIBRARIES,
  RECEIVE_LIBRARIES,
  LIBRARIES_FAILURE,
  RESIZE_WINDOW_WIDTH,
  CAPTCHA_SUCCESS,
  HIDE_MODAL
} from '../constants/ActionTypes'
import * as i18n from '../i18n'

const initialState = {
  locale: 'no',
  messages: {
    no: { ...i18n.no }
  },
  isLoggedIn: false,
  borrowerNumber: null,
  isRequestingLogin: false,
  loginError: null,
  isRequestingLogout: false,
  logoutError: null,
  isValidatingCaptcha: false,
  demandCaptcha: false,
  captchaResponse: null,
  isRequestingLoginStatus: false,
  loginStatusError: null,
  libraries: {},
  isRequestingLibraries: false,
  librariesError: false,
  windowWidth: 0
}

export default function application (state = initialState, action) {
  switch (action.type) {
    case actionTypes.INIT:
      return action.payload
        ? { ...state, ...action.payload[ 'application' ] }
        : state
    case RECEIVE_TRANSLATION:
      return {
        ...state,
        locale: action.payload.locale,
        messages: {
          ...state.messages,
          [action.payload.locale]: {
            ...state.messages[ action.payload.locale ],
            ...action.payload.messages
          }
        }
      }
    case SHOW_LOGIN_DIALOG:
      return { ...state, loginError: null }
    case REQUEST_LOGIN:
      return { ...state, isRequestingLogin: true }
    case LOGIN_FAILURE:
      return {
        ...state,
        isRequestingLogin: false,
        loginError: action.payload.message,
        demandCaptcha: action.payload.demandCaptcha,
        captchaResponse: null,
        isValidatingCaptcha: action.payload.demandCaptcha
      }
    case LOGIN_SUCCESS:
      return {
        ...state,
        isRequestingLogin: false,
        isLoggedIn: true,
        loginError: null,
        demandCaptcha: false,
        captchaResponse: null,
        isValidatingCaptcha: false,
        borrowerNumber: action.payload.borrowerNumber,
        category: action.payload.category
      }
    case CAPTCHA_SUCCESS:
      return {
        ...state,
        isValidatingCaptcha: false,
        captchaResponse: action.payload.response
      }
    case REQUEST_LOGOUT:
      return { ...state, isRequestingLogout: true }
    case LOGOUT_FAILURE:
      return { ...state, isRequestingLogout: false, logoutError: action.payload.message }
    case LOGOUT_SUCCESS:
      return { ...state, isRequestingLogout: false, isLoggedIn: false, logoutError: false, borrowerNumber: null, category: null }
    case REQUEST_LOGIN_STATUS:
      return { ...state, isRequestingLoginStatus: true }
    case LOGIN_STATUS_FAILURE:
      return { ...state, isRequestingLoginStatus: false, loginStatusError: action.payload.message }
    case RECEIVE_LOGIN_STATUS:
      return {
        ...state,
        isRequestingLoginStatus: false,
        isLoggedIn: action.payload.isLoggedIn,
        loginStatusError: false,
        borrowerNumber: action.payload.borrowerNumber,
        category: action.payload.category
      }
    case REQUEST_LIBRARIES:
      return { ...state, isRequestingLibraries: true }
    case RECEIVE_LIBRARIES:
      return { ...state, isRequestingLibraries: false, libraries: action.payload.libraries }
    case LIBRARIES_FAILURE:
      return { ...state, isRequestingLibraries: false, libraryError: action.payload.message }
    case RESIZE_WINDOW_WIDTH:
      return { ...state, windowWidth: action.payload.windowWidth }
    case HIDE_MODAL:
      return {
        ...state,
        demandCaptcha: false,
        captchaResponse: null,
        isValidatingCaptcha: false
      }
    default:
      return state
  }
}
