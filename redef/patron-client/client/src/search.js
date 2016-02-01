/*globals window*/
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    var Ractive = require("ractive");
    Ractive.events = require("ractive-events-keys");

    var axios = require("axios");
    var url = require("url");
    var _ = require("underscore");
    module.exports = factory(Ractive, axios, url, _);
  } else {
    root.Search = factory(root.Ractive, root.axios, root.url, root._);
  }
}(this, function (Ractive, axios, url, _) {
  "use strict";
  Ractive.DEBUG = false;

  var Search = {
    init: function() {

      if (window && !window.Promise) {
        window.Promise = Ractive.Promise; // axios needs a Promise polyfill, so we use the one provided by ractive.
      }

      var config;
      return axios.get("/config").then(function (response) {
        config = response.data;
      }).then(function () {
        return axios.get("/search_template.html").then(function (response) {
          return response.data;
        });
      }).then(function (data) {
        var searchRactive = new Ractive({
          el: "#search-app",
          template: data,
          data: {
            hits: {
              total: 0,
              hits: []
            },
            workUrl: function (work) {
                return '/work/' + url.parse(work.uri).path.split('/').pop();
            },
            personUrl: function (person) {
                return '/person/' + url.parse(person.uri).path.split('/').pop();
            },
            inPreferredLanguage: function(text) {
              var preferredTexts = _.compact([
                _.find(text, function (value, lang) {
                  return lang === "nb";
                }), _.find(text, function (value, lang) {
                  return lang === "nn";
                }), _.find(text, function (value, lang) {
                  return lang === "default";
                }), _.find(text, function (value) {
                  return true;
                })]);
              return _.first(preferredTexts);
            }
          }
        });

        searchRactive.on({
          search: function () {
            var term = searchRactive.get("search_term");
            axios.get("http://" + config.host + ":" + config.port + "/search/work/_search?q=" + term)
                .then(function (response) {
                  searchRactive.set("currentSearchTerm", term);
                  searchRactive.set("hits", response.data.hits);
                });
          }
        });
        return searchRactive;
      }).catch(function (error) {
        console.log(error);
      });
    }
  }
  return Search;
}));