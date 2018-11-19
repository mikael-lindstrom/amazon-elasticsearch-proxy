#!/usr/bin/env node
var commander = require('commander');
var proxy = require('./proxy.js');

commander
//  .version(meta.version)
  .usage('[options] <endpoint>')
  .option('-p, --port <n>', 'Local proxy port, default 9200', parseInt)
  .option('-b, --bindIf <ip>', 'Bind to interface, defaults to 127.0.0.1', /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/, '127.0.0.1')
  .parse(process.argv);

if (commander.args.length != 1) {
  console.error("Missing endpoint parameter");
  commander.outputHelp();
  process.exit(1);
}

var endpoint;
if (commander.args[0].startsWith('https://')) {
  endpoint = commander.args[0];
} else {
  endpoint = 'https://' + commander.args[0];
}

var region;
try {
  region = endpoint.match(/\.([^.]+)\.es\.amazonaws\.com\.?$/)[1];
} catch (e) {
  console.error('Region cannot be parsed from endpoint address');
  process.exit(1);
}

var config = {
  endpoint: endpoint,
  region: region,
  port: commander.port || 9200,
  bindAddress: commander.bindIf
}

proxy.run(config);
