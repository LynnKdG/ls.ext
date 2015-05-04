
include:
  - .skeletonbuild

{% set container = 'redef_catalinker_skeleton_container' %}
{% set repo = 'digibib' %}
{% set image = 'redef-catalinker-skeleton' %}
{% set tag = 'latest' %}
{% set command = 'rerun ruby lib/server.rb' %}
{% set tty = true %}
{% set ports = ["4567/tcp"] %}
{% set environment = {'SERVICES_PORT': "http://{0}:{1}".format(pillar['redef']['services']['host'], pillar['redef']['services']['port']) }  %}
{% set port_bindings = {'4567/tcp': { 'HostIp': pillar['redef']['catalinker']['binding'], 'HostPort': pillar['redef']['catalinker']['port'] } } %}
{% set host_volume_bindings = [ { 'host': '/vagrant/redef/catalinker', 'container': '/usr/src/app', 'ro': false } ] %}

{% include 'docker-run.sls-fragment' %}
