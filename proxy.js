var AWS = require('aws-sdk');
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');

function run(config) {
  // Setup AWS credentials
  var creds;
  var chain = new AWS.CredentialProviderChain();
  chain.resolve(function (err, resolved) {
      if (err) {
        console.error("Could not load AWS Credentials");
        process.exit(1);
      } else {
        creds = resolved;
      }
  });

  // Automagically takes care for renewing credentials if needed
  function getcreds(req, res, next) {
      return creds.get(function (err) {
          if (err) return next(err);
          else return next();
      });
  }

  // Setup express
  var app = express();
  app.use(bodyParser.raw({type: '*/*'}));
  app.use(getcreds);

  // Handle request
  app.use(function(req,res,next){
    //Create an AWS httpRequest and copy parameters from the original request
    var awsEndpoint = new AWS.Endpoint(config.endpoint);
    var awsReq = new AWS.HttpRequest(awsEndpoint);
    awsReq.method = req.method;
    awsReq.path = req.path;
    awsReq.region = config.region;
    awsReq.headers['presigned-expires'] = false;
    awsReq.headers['Host'] = awsEndpoint.host;

    if (Buffer.isBuffer(req.body)) {
      awsReq.body = req.body;
    }

    // Sign the request for elasticsearch 'es'
    var signer = new AWS.Signers.V4(awsReq , 'es');
    signer.addAuthorization(creds, new Date());

    // Send the new request to AWS
    var send = new AWS.NodeHttpClient();
    send.handleRequest(awsReq, null, function(httpResp) {
        var respBody = [];
        httpResp.on('data', function (chunk) {
            respBody.push(chunk);
        });
        httpResp.on('end', function (chunk) {
            res.set(httpResp.headers);
            res.send(Buffer.concat(respBody));
        });
      }, function(err) {
          console.error('Error: ' + err);
          next(err, respBody);
      });
  });

  http.createServer(app).listen(config.port, config.bindAddress);
  console.log('Amazon Elasticsearch: http://' + config.bindAddress + ':' + config.port);
  console.log('Kibana: http://' + config.bindAddress + ':' + config.port + '/_plugin/kibana/');
}

module.exports.run = run;
