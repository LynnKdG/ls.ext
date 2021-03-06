# encoding: UTF-8

require 'net/http'
require 'uri'
require 'json'
require_relative '../service.rb'

module KohaRESTAPI

  class Libraries < Service

    def get(branchcode)
      headers = {
	      'Cookie' => @context[:koha_rest_api_cookie],
	      'Content-Type' => 'application/json'
	    }
	    http = Net::HTTP.new("xkoha", 8081)
	    uri = URI("#{intranet(:koha_rest_api)}libraries/#{branchcode}")
	    res = http.get(uri, headers)
	    expect(res.code).to eq("200"), "got unexpected #{res.code} when listing checkouts.\nResponse body: #{res.body}"
	    res.body
	    end

    def list
      headers = {
        'Cookie' => @context[:koha_rest_api_cookie],
        'Content-Type' => 'application/json'
      }
      http = Net::HTTP.new("xkoha", 8081)
      uri = URI(intranet(:koha_rest_api) + "libraries")
      res = http.get(uri, headers)
      expect(res.code).to eq("200"), "got unexpected #{res.code} when listing checkouts.\nResponse body: #{res.body}"
      res.body
    end

  end
end
