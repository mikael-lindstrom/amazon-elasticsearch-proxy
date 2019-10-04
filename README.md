# amazon-elasticsearch-proxy

Sets up a proxy for signing requests with IAM credentials to access Amazon Elasticsearch. To build the docker image:

```
make docker
```

### Installation
```
npm install -g amazon-elasticsearch-proxy
```

### Usage
Start the proxy with (make sure you have AWS Credentials loaded into your shell):
```
amazon-elasticsearch-proxy your-amazon-elasticsearch-endpoint
```
You can also use the docker image like this:

```
docker run -v ~/.aws:/root/.aws:ro -p 9200:9200 -e AWS_PROFILE=production amazon-elasticsearch-proxy my-elastic-search-endpoint.us-east-1.es.amazonaws.com
```
There are three details that are very important here. 
* `-v` You will need to mount your AWS credentials directory as readonly volume within docker so that AWS SDK can access services.
* `-p` Innternally, the proxy is hard coded to run on port 9200 but you should map to any port of your liking or it won't work.
* `-e` Environment variables that AWS SDK expects. Standard ones, usually all of those work: https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-envvars.html

An example would be that you have an ES domain in proudction environemnt which has access to an IAM role named `analytics` and this is the access policy 
for the domain:
```
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::111111111:role/analytics"
      },
      "Action": "es:*",
      "Resource": "arn:aws:es:us-east-1:11111111:domain/my-es-domain/*"
    }
  ]
}
```

And your `~/.aws/credentials` look like this:

```[production]
aws_access_key_id = YOUR-ACCESS-KEY-HERE
aws_secret_access_key = YOUR-SECRET-KEY-HERE

[analytics_profile]
role_arn = arn:aws:iam::111111111:role/analytics
source_profile = production
```

Then you can simply run this command:

```
docker run -v ~/.aws:/root/.aws:ro -p 9200:9200 -e AWS_PROFILE=analytics_profile amazon-elasticsearch-proxy search-analytics-somerandomstringw.us-east-1.es.amazonaws.com
```

After that, the AWS SDK will pick up the `analytics_profile`, will use the credentials of `production` profile to assume the role `analytics` and requests would be 
signed for you. All you have to do is to use `localhost:9200` for all your operations.

