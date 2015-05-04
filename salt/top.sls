base:
  '*':
    - common
    - common.docker
    - resource_monitoring.collector

  '^(\w+-ship|vm-devops)$':
    - match: pcre

  'wombat,vm-devops':
    - match: list
    - elk
    - elk.configserver
    - elk.pulled
    - elk.dockerized
#    - elk.dockerlog-forwarder
    - resource_monitoring.server

  '^(wombat|\w+-ship)$':
    - match: pcre
    - elk
    - elk.dockerlog-forwarder
    - mysql.pulled
    - koha.pulled
    - sip.pulled
    - mysql.dockerized
    - koha.dockerized
    - sip.dockerized
    - redef.fuseki
    - migration.dockerized
    - redef.fuseki

  'wombat,vm-ship':
    - match: list
    - redef.services.pulledrun
    - redef.catalinker.pulledrun
    - redef.patron-client.pulledrun

  'build-ship':
    - match: list
    - redef.services.builtrun
    - redef.catalinker.builtrun
    - redef.patron-client.builtrun

  'dev-ship':
    - match: list
    - redef.services.builtrun
    - redef.catalinker.skeletonrun
    - redef.patron-client.skeletonrun
