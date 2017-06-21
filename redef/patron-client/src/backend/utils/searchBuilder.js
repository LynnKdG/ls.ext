const QueryParser = require('querystring')
const Constants = require('../../frontend/constants/Constants')
const Defaults = require('./queryConstants')

function escape (query) {
  return query.replace(/\//g, '\\/')
}

function initCommonQuery (workQuery, publicationQuery, workFilters, publicationFilters, excludeUnavailable, page, pageSize = 20, options) {
  options = Object.assign({
    explain: false,
    ageGain: 0.6,
    ageScale: 100,
    itemsGain: 0.3,
    itemsScale: 50,
    childBoost: 1
  }, options)

  const aggregations = {}
  Object.keys(Constants.filterableFields).forEach(key => {
    let field
    let fieldName
    if (key === 'branch') {
      fieldName = 'branches'
      field = 'homeBranches'
      if (excludeUnavailable) {
        field = 'availableBranches'
      }
    } else {
      field = Constants.filterableFields[ key ].name
      fieldName = field
    }
    aggregations[ fieldName ] = {
      terms: {
        field: fieldName,
        size: 1000
      },
      aggregations: {
        parents: {
          cardinality: {
            field: '_parent'
          }
        }
      }
    }
  })

  function publicationBoost (query) {
    return {
      function_score: {
        boost: options.childBoost, // general child boost
        boost_mode: 'multiply',
        query: query,
        script_score: {
          script: {
            inline: `
                      def score = _score;

                      def mtScores = [
                        "Film": 0.3,
                        "Språkkurs": 0.2
                      ];
                      
                      if (doc['_type'] === 'publication') {
                        def mtScore = mtScores.get(doc.mt.value);
                        if (mtScore !== null) {
                          score = score * mtScore;
                        }
                      }
                      
                      def langscores = [
                        "nob": 1.5,
                        "nno": 1.5,
                        "nor": 1.5,
                        "eng": 1.4,
                        "swe": 1.3,
                        "dan": 1.3,
                        "ger": 1.2,
                        "fre": 1.2,
                        "spa": 1.1,
                        "ita": 1.1
                      ];
                      
                      def langscore = langscores.get(doc.language.value);
                      if (langscore == null) {
                        langscore = 1;
                      }

                      if (doc['_type'] === 'publication' && doc.mt === 'Bok') {
                        score = _score * langscore;
                      }

                      def age_gain=${options.ageGain};
                      def age_scale=${options.ageScale};
                      if (doc.created.value != null) {
                        score *= (1 + (age_gain*age_scale)/(age_scale+(params.now-doc.created.date.getMillis())/86400000));
                      }
                      
                      def items_gain=${options.itemsGain};
                      if (doc['_type'] === 'publication' && doc.mt.value === "Periodika") {
                        items_gain = 0.0;
                      }
                      def items_scale=${options.itemsScale};
                      if (doc.numItems.value != null) {
                        score *= (1 + (items_gain*doc.numItems.value/items_scale));
                      }
                      return score;`.replace('\n', ''),
            lang: 'painless',
            params: {
              now: Date.now()
            }
          }
        }
      }
    }
  }

  function workBoost (query) {
    return {
      function_score: {
        boost: options.childBoost, // general child boost
        boost_mode: 'multiply',
        query: query,
        script_score: {
          script: {
            inline: `
                      def score = _score;

                      def items_gain=${options.itemsGain};
                      def items_scale=${options.itemsScale};
                      if (doc.numItems.value != null) {
                        score *= (1 + (items_gain*doc.totalNumItems.value/items_scale));
                      }
                      return score;`.replace('\n', ''),
            lang: 'painless'
          }
        }
      }
    }
  }

  const boostableQuery = {
    bool: {
      must: [
        publicationQuery
      ],
      filter: publicationFilters
    }
  }
  return {
    size: pageSize,
    from: pageSize * (page - 1 || 0),
    aggs: {
      facets: {
        children: {
          type: 'publication'
        },
        aggregations
      }
    },
    query: {
      dis_max: {
        queries: [
          {
            // query work by publication properties
            has_child: {
              score_mode: 'max',
              type: 'publication',
              query: !options.skipScript ? publicationBoost(boostableQuery) : boostableQuery,
              inner_hits: {
                size: 100,
                name: 'publications',
                explain: options.explain === 'true'
              }
            }
          },
          {
            // query by work properties
            bool: {
              must: [
                {
                  has_child: {
                    query: {
                      bool: {
                        should: {
                          match_all: {}
                        },
                        filter: publicationFilters
                      }
                    },
                    score_mode: 'max',
                    inner_hits: {
                      name: 'publications',
                      size: 100,
                      explain: options.explain === 'true'
                    },
                    type: 'publication'
                  }
                },
                workQuery
              ],
              filter: workFilters
            }
          }
        ]
      }
    },
    explain: options.explain === 'true'
  }
}

function simpleQuery (query, fields, options) {
  options = options || {}
  const terms = query.split(/\s+/)
  let phrases = []
  for (let i = 0; i < terms.length; i++) {
    phrases.push(terms.slice(0, i + 1).join(' '))
    phrases.push(terms.slice(i).join(' '))
  }

  phrases = [ ...new Set(phrases) ]

  const fieldsAndPhrases = []
  fields.forEach(field => {
    if (field.phrase && !options.noPhrasePerm || field.tokenize) {
      phrases.forEach(phrase => {
        fieldsAndPhrases.push({
          field, query: phrase, boost: (field.boost || 1 )
        })
      })
    } else {
      fieldsAndPhrases.push({
        field, query, boost: field.boost
      })
    }
  })

  return {
    dis_max: {
      tie_breaker: 0.4,
      queries: fieldsAndPhrases.map(field => {
        return {
          constant_score: {
            filter: field.field.phrase ? {
              match_phrase: {
                [field.field.field]: {
                  query: field.query,
                  slop: 3
                }
              }
            } : {
              match: {
                [field.field.field]: {
                  query: field.query
                }
              }
            },
            boost: field.boost || 1
          }
        }
      })
    }
  }
}

function initAdvancedQuery (query) {
  return {
    query_string: {
      query: translateFieldTerms(query, Constants.queryFieldTranslations),
      default_operator: 'and'
    }
  }
}

function translateFieldTerms (query, translations) {
  const chars = [ ...query ]
  let result = ''
  let inQuote = false
  let startField = 0
  let startValue = 0
  for (let i = 0; i < chars.length; i++) {
    const c = chars[ i ]
    if (c === ' ') {
      if (i + 1 === chars.length) {
        break
      }
      startField = i + 1
    }
    if (c === '"') {
      inQuote = !inQuote
    }
    if (!inQuote && c === ':') {
      result += chars.slice(startValue, startField).join('')
      let field = chars.slice(startField, i).join('')
      if (translations[ field ]) {
        field = translations[ field ]
        if (field instanceof Object) {
          field = field.translation
        }
      }
      result += field
      result += ':'
      startValue = i + 1
    }
  }
  return result += chars.slice(startValue, chars.length).join('')
}

// parse query string to decide what kind of query we think this is
function queryStringToQuery (queryString, workFilters, publicationFilters, excludeUnavailable, page, pageSize, options) {
  const escapedQueryString = escape(queryString)
  const isbn10 = new RegExp('^[0-9Xx-]{10,13}$')
  const isbn13 = new RegExp('^[0-9-]{13,17}$')
  const advTriggers = new RegExp('[:+/\\-()*^]|AND|OR|NOT|TO')

  if (isbn10.test(escapedQueryString) || isbn13.test(escapedQueryString)) {
    return initCommonQuery({}, initAdvancedQuery(`isbn:${escapedQueryString}`), workFilters, publicationFilters, excludeUnavailable, page, pageSize, options)
  } else if (advTriggers.test(escapedQueryString)) {
    return initCommonQuery(initAdvancedQuery(escapedQueryString), initAdvancedQuery(escapedQueryString), workFilters, publicationFilters, excludeUnavailable, page, pageSize, options)
  } else {
    return initCommonQuery(simpleQuery(escapedQueryString, Defaults.defaultWorkFields, options), simpleQuery(escapedQueryString, Defaults.defaultPublicationFields, options), workFilters, publicationFilters, excludeUnavailable, page, pageSize, options)
  }
}

function parseFilters (filtersFromLocationQuery, domain) {
  const filterableFields = Constants.filterableFields
  const terms = {}
  if (!Array.isArray(filtersFromLocationQuery)) {
    filtersFromLocationQuery = [ filtersFromLocationQuery ]
  }
  filtersFromLocationQuery.forEach(filterParamValue => { // ex filterParamValue: 'audience_juvenile'
    const split = filterParamValue.split('_')
    const filterableField = filterableFields[ split[ 0 ] ]
    if (filterableField.domain === domain) {
      const aggregation = filterableField.name
      if (!terms[ aggregation ]) {
        terms[ aggregation ] = []
      }
      const val = filterableField.prefix + filterParamValue.substring(`${split[ 0 ]}_`.length)
      terms[ aggregation ].push(val)
    }
  })

  const filters = []
  Object.keys(terms).forEach(aggregation => {
    filters.push({ terms: { [aggregation]: terms[ aggregation ] } })
  })

  return filters
}

function yearRangeFilter (yearFrom, yearTo) {
  const start = yearFrom || 0
  const end = yearTo || new Date().getFullYear()
  return {
    range: {
      publicationYear: {
        gte: parseInt(start),
        lte: parseInt(end)
      }
    }
  }
}

function createPublicationFilters (params, excludeUnavailable) {
  const publicationFilters = parseFilters(params.filter || [], 'publication')

  let yearRange
  if (params.yearFrom || params.yearTo) {
    yearRange = yearRangeFilter(params.yearFrom, params.yearTo)
  }
  if (yearRange) {
    publicationFilters.push(yearRange)
  }
  return publicationFilters
}
module.exports.buildQuery = function (urlQueryString) {
  const params = QueryParser.parse(urlQueryString)
  const excludeUnavailable = Object.hasOwnProperty.call(params, 'excludeUnavailable')
  const _allFilter = params.allFilter ? [ {
    match: {
      _all: {
        query: params.query,
        operator: 'and'
      }
    }
  } ] : []
  const workFilters = _allFilter.concat(parseFilters(params.filter || [], 'work'))
  const publicationFilters = _allFilter.concat(createPublicationFilters(params, excludeUnavailable))
  const query = queryStringToQuery(params.query, workFilters, publicationFilters, excludeUnavailable, params.page, params.pageSize, params)
  console.log(JSON.stringify(query, null, 2))
  return query
}

module.exports.buildUnfilteredAggregatedQuery = function (urlQueryString) {
  const params = QueryParser.parse(urlQueryString)
  return queryStringToQuery(params.query, [], [], false, 0, 0, params)
}

// function exported only to be testable. TODO is there another way?
module.exports.translateFieldTerms = translateFieldTerms

