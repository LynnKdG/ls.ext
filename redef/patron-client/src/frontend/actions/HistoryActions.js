import fetch from 'isomorphic-fetch'
import * as types from '../constants/ActionTypes'
import { requireLoginBeforeAction } from './LoginActions'
import Errors from '../constants/Errors'

export function startFetchHistory (args) {
  return requireLoginBeforeAction(fetchHistory(args))
}

export function fetchHistoryFailure (error) {
  return dispatch => {
    dispatch({
      type: types.FETCH_HISTORY_FAILURE,
      payload: { message: error },
      error: true
    })
  }
}

export function requestHistory () {
  return {
    type: types.REQUEST_FETCH_HISTORY
  }
}

export function receiveHistory (data) {
  return dispatch => {
    dispatch({
      type: types.RECEIVE_FETCH_HISTORY,
      payload: { history: data }
    })
  }
}

export function fetchHistory (args) {
  const url = '/api/v1/profile/history'
  return dispatch => {
    dispatch(requestHistory())
    return fetch(url, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(args)
    })
      .then(response => {
        if (response.status === 200) {
          response.json().then(json => dispatch(receiveHistory(json)))
        } else {
          dispatch(fetchHistoryFailure(Errors.loan.GENERIC_FETCH_HISTORY_ERROR))
        }
      }).catch(error => dispatch(fetchHistoryFailure(error)))
  }
}