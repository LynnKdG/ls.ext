const isofetch = require('isomorphic-fetch')

module.exports = (app) => {
  return (url, opts) => {
    opts = opts || {}
    opts.headers = opts.headers || {}
    opts.headers[ 'Cookie' ] = app.settings.kohaSession
    return isofetch(url, opts)
      .then(res => {
        if (res.status === 403) {
          return res.json().then(json => {
            if (res.status >= 400) {
              console.log(`Call to ${url} with options ${JSON.stringify(opts)}:`)
              console.log(`${res.status}: ${JSON.stringify(json)}`)
            }
            if (json.error === 'You don\'t have the required permission') {
              // Unauthorized; we try to renew session and then retry request.
              return isofetch('http://koha:8081/api/v1/auth/session', {
                method: 'POST',
                body: JSON.stringify({
                  userid: process.env.KOHA_API_USER,
                  password: process.env.KOHA_API_PASS
                })
              })
                .then(res => {
                  if (res.headers && res.headers._headers && res.headers._headers[ 'set-cookie' ] && res.headers._headers[ 'set-cookie' ][ 0 ]) {
                    app.set('kohaSession', res.headers._headers[ 'set-cookie' ][ 0 ])
                    opts.headers[ 'Cookie' ] = app.settings.kohaSession

                    // We renewed the session; retry original HTTP call (once)
                    return isofetch(url, opts)
                  } else {
                    throw new Error('Cannot obtain Koha API session')
                  }
                })
            } else {
              return res
            }
          })
        } else {
          return res
        }
      })
  }
}
