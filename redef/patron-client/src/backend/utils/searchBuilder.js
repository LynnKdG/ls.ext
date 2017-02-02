const querystring = require('querystring')
const Constants = require('../../frontend/constants/Constants')

function initCommonQuery () {
  return {
    size: 0,
    aggs: {
      facets: {
        global: {},
        aggs: {}
      },
      byWork: {
        terms: {
          field: 'workUri',
          order: { top: 'desc' },
          size: Constants.maxSearchResults
        },
        aggs: {
          publications: {
            top_hits: {
              size: 1
            }
          },
          top: {
            max: {
              script: {
                lang: 'expression',
                inline: '_score'
              }
            }
          }
        }
      },
      workCount: {
        cardinality: {
          field: 'workUri'
        }
      }
    }
  }
}

function initSimpleQuery (query) {
  const defaultFields = [
    'agents',
    'author^50',
    'bio',
    'compType',
    'country',
    'desc',
    'ean',
    'format',
    'genre',
    'inst',
    'isbn',
    'ismn',
    'language',
    'litform',
    'mainTitle^30',
    'mt',
    'partNumber',
    'partTitle',
    'publishedBy',
    'recordId',
    'series^10',
    'subject^10',
    'summary',
    'title^20',
    'workMainTitle',
    'workPartNumber',
    'workPartTitle',
    'workSubtitle'
  ]
  return {
    filtered: {
      filter: {
        bool: {
          must: []
        }
      },
      query: {
        simple_query_string: {
          query: query,
          default_operator: 'and',
          fields: defaultFields
        }
      }
    }
  }
}

function initAdvancedQuery (query) {
  return {
    filtered: {
      filter: {
        bool: {
          must: []
        }
      },
      query: {
        query_string: {
          query: query,
          default_operator: 'and'
        }
      }
    }
  }
}

function isAdvancedQuery (queryString) {
  return /[:+-^()"*]/.test(queryString)
}

function simpleSearchBuilder (queryString) {
  const query = initCommonQuery()
  query.query = initSimpleQuery(queryString)
  return query
}

function advancedSearchBuilder (queryString) {
  const query = initCommonQuery()
  query.query = initAdvancedQuery(queryString)
  return query
}

function parseFilters (filtersFromLocationQuery) {
  const filterableFields = Constants.filterableFields
  const filterBuckets = {}
  if (!Array.isArray(filtersFromLocationQuery)) {
    filtersFromLocationQuery = [ filtersFromLocationQuery ]
  }
  filtersFromLocationQuery.forEach(filter => { // ex filter: 'audience_juvenile'
    const split = filter.split('_')
    const filterableField = filterableFields[ split[ 0 ] ]
    const aggregation = filterableField.name
    if (!filterBuckets[ aggregation ]) {
      filterBuckets[ aggregation ] = []
    }
    const val = filterableField.prefix + filter.substring(`${split[ 0 ]}_`.length)
    filterBuckets[ aggregation ].push(val)
  })

  const filters = []
  Object.keys(filterBuckets).forEach(aggregation => {
    filters.push({ aggregation: aggregation, bucket: filterBuckets[ aggregation ] })
  })

  return filters
}

function createMust (field, terms) {
  return {
    terms: {
      [field]: terms
    }
  }
}

module.exports.buildQuery = function (urlQueryString) {
  const params = querystring.parse(urlQueryString)
  const queryString = params.query
  let elasticSearchQuery = {}
  if (isAdvancedQuery(queryString)) {
    elasticSearchQuery = advancedSearchBuilder(queryString)
  } else {
    elasticSearchQuery = simpleSearchBuilder(queryString)
  }
  const filters = parseFilters(params.filter || [])
  const musts = {}
  filters.forEach(filter => {
    const aggregation = filter.aggregation
    const must = createMust(aggregation, filter.bucket)
    musts[ aggregation ] = must
  })

  Object.keys(musts).forEach(aggregation => {
    elasticSearchQuery.query.filtered.filter.bool.must.push(musts[ aggregation ])
  })

  Object.keys(Constants.filterableFields).forEach(key => {
    const field = Constants.filterableFields[ key ]
    const fieldName = field.name
    elasticSearchQuery.aggs.facets.aggs[ fieldName ] = {
      filter: {
        bool: Object.assign({}, elasticSearchQuery.query.filtered.query.bool || { filter: [ elasticSearchQuery.query.filtered.query ] })
      },
      aggs: {
        [fieldName]: {
          terms: {
            field: fieldName,
            size: 0
          }
        }
      }
    }

    const aggregationMusts = []
    Object.keys(musts).forEach(aggregation => {
      const must = musts[ aggregation ]
      if (aggregation !== fieldName) {
        aggregationMusts.push(must)
      }
    })
    elasticSearchQuery.aggs.facets.aggs[ fieldName ].filter.bool.must = aggregationMusts
  })

  return elasticSearchQuery
}
