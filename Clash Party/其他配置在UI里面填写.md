<img width="823" height="1032" alt="image" src="https://github.com/user-attachments/assets/51c8d844-3f66-4996-a271-6167db99f66a" />

geox-url:
  geoip: https://fastly.jsdelivr.net/gh/Loyalsoldier/geoip@release/geoip.dat
  mmdb: https://fastly.jsdelivr.net/gh/Loyalsoldier/geoip@release/Country.mmdb
  asn: https://fastly.jsdelivr.net/gh/Loyalsoldier/geoip@release/GeoLite2-ASN.mmdb
  geosite: https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/geosite.dat
geo-auto-update: true

<img width="823" height="1032" alt="image" src="https://github.com/user-attachments/assets/e096c03c-5add-41ae-82bb-17494590bb9e" />
<img width="823" height="1032" alt="image" src="https://github.com/user-attachments/assets/e3bf7ea9-e89a-4989-9caa-12e7887eca81" />

use-hosts: false
  use-system-hosts: false
  respect-rules: true
  default-nameserver:
    - 223.5.5.5
    - 119.29.29.29
    - 1.1.1.1
    - 8.8.8.8
  nameserver:
    - https://223.5.5.5/dns-query
    - https://1.12.12.12/dns-query
  proxy-server-nameserver:
    - https://1.1.1.1/dns-query
    - https://8.8.8.8/dns-query
    - https://223.5.5.5/dns-query
    - https://1.12.12.12/dns-query
  direct-nameserver:
    - https://223.5.5.5/dns-query
    - https://1.12.12.12/dns-query
  fallback:
    - https://1.1.1.1/dns-query
    - https://8.8.8.8/dns-query
  fallback-filter:
    geoip: true
    geoip-code: CN
    ipcidr:
      - 240.0.0.0/4
      - 0.0.0.0/32
      - 127.0.0.0/8
      - 10.0.0.0/8
      - 192.168.0.0/16
    domain: []


    
sniffer:
  enable: true
  parse-pure-ip: true
  force-dns-mapping: true
  override-destination: true
  sniff:
    HTTP:
      ports:
        - "80"
        - 8080-8880
      override-destination: true
    TLS:
      ports:
        - "443"
        - "8443"
    QUIC:
      ports:
        - "443"
        - "8443"
        - "4433"
