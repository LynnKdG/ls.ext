import { toggleParameter, toggleParameterValue, togglePeriodParamValues, deletePeriodParamValues } from './ParameterActions'

export function toggleFilter (filterId) {
  return (dispatch, getState) => {
    const locationQuery = { ...getState().routing.locationBeforeTransitions.query }

    // Toggling a filter implies a new search, so we discard any pagination parameter
    delete locationQuery.page

    dispatch(toggleParameterValue('filter', filterId, locationQuery))
  }
}

export function removeFilterInBackUrl (filterId) {
  return (dispatch, getState) => {
    const locationQuery = { ...getState().routing.locationBeforeTransitions.query }

    // Toggling a filter implies a new search, so we discard any pagination parameter
    delete locationQuery.page

    dispatch(toggleParameterValue('back', filterId, locationQuery, true, 'filter'))
  }
}

export function toggleFilterVisibility (aggregation) {
  return toggleParameterValue('showMore', aggregation)
}

export function toggleAllFiltersVisibility () {
  return toggleParameter('hideFilters')
}

export function toggleCollapseFilter (aggregation) {
  return toggleParameterValue('showFilter', aggregation)
}

export function togglePeriod (years) {
  return (dispatch, getState) => {
    const locationQuery = { ...getState().routing.locationBeforeTransitions.query }

    // Toggling a filter implies a new search, so we discard any pagination parameter
    delete locationQuery.page

    dispatch(togglePeriodParamValues('yearFrom', 'yearTo', years, locationQuery))
  }
}

export function removePeriod (years) {
  return (dispatch, getState) => {
    const locationQuery = { ...getState().routing.locationBeforeTransitions.query }
    dispatch(deletePeriodParamValues('yearFrom', 'yearTo', years, locationQuery))
  }
}

export function removePeriodInBackUrl (years) {
  return (dispatch, getState) => {
    const locationQuery = { ...getState().routing.locationBeforeTransitions.query }
    dispatch(deletePeriodParamValues('yearFrom', 'yearTo', years, locationQuery, true, 'back'))
  }
}

