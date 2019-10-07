FROM node:10

RUN npm install -g amazon-elasticsearch-proxy

ENTRYPOINT [ "/usr/local/bin/amazon-elasticsearch-proxy", "-b", "0.0.0.0" , "-p", "9200"]
