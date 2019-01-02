## Docker で Elasticsearch と Kibana を起動して elasticsearch-sudachi を入れる

elasticsearch-sudachi をローカル環境で試してみたかったので Docker でサクッと Elasticsearch と Kibana を起動してみました。

### Elasticsearch と Kibana を導入

Docker でサクッと起動しましょう。mac の場合は Docker for Mac で。

#### Bridge ネットワークの作成

`$ docker network create elasticsearch --driver bridge`

#### Elasticsearch コンテナの起動

```Docker
$ docker run -d \
    -e "http.host=0.0.0.0" \
    -e "transport.host=127.0.0.1" \
    -e "xpack.security.enabled=false" \
    -e "xpack.monitoring.enabled=false" \
    -e "xpack.watcher.enabled=false" \
    -e "xpack.graph.enabled=false" \
    -e "xpack.ml.enabled=false" \
    -e "ES_JAVA_OPTS=-Xms512m -Xmx512m" \
    -p 9200:9200 \
    -p 9300:9300 \
    --name elasticsearch \
    --network="elasticsearch" \
    docker.elastic.co/elasticsearch/elasticsearch:5.4.1
```

#### Elasticsearch 動作確認

`curl [localhost|${ローカルマシンのipアドレス}]:9200`

#### Kibana コンテナの起動

```Docker
$ docker run -d \
    --name kibana \
    -p 5601:5601 \
    -e "ELASTICSEARCH_URL=http://elasticsearch:9200" \
    -e "xpack.graph.enabled=false" \
    -e "xpack.security.enabled=false" \
    -e "xpack.ml.enabled=false" \
    --network="elasticsearch" \
    docker.elastic.co/kibana/kibana:5.6.4
```

### elasticsearch-kibana の導入

[elasticsearch-sudachi の Github リポジトリ](https://github.com/WorksApplications/elasticsearch-sudachi/releases)からお使いの Elasticsearch の Version に合う Snapshot を落としてきましょう。

##### Elasticsearch コンテナに cp

`$ docker cp analysis-sudachi-elasticsearch${Version}-SNAPSHOT.zip b7b5b040d5bb:/usr/share/elasticsearch`

##### Elasticsearch コンテナに入って elasticsearch-sudachi をインストール

`$ docker exec -it ${Elasticsearchのコンテナid} bash`

`$ bin/elasticsearch-plugin install file:///usr/share/elasticsearch/analysis-sudachi-elasticsearch${Version}-SNAPSHOT.zip`

[system_full.dic](https://oss.sonatype.org/content/repositories/snapshots/com/worksap/nlp/sudachi/0.1.1-SNAPSHOT/)をダウンロードして/usr/share/elasticsearch/config/sudachiにコピー

ここまできたらElasticsearchコンテナを再起動します。

##### elasticsearch-sudachi動作確認
`curl -XGET 'localhost:9200/_analyze?pretty' -H 'Content-Type: application/json' -d '{"analyzer" : "sudachi" , "text" :"すもももももももものうち"}'`

```json
{
  "tokens" : [
    {
      "token" : "すもも",
      "start_offset" : 0,
      "end_offset" : 3,
      "type" : "word",
      "position" : 0
    },
    {
      "token" : "もも",
      "start_offset" : 4,
      "end_offset" : 6,
      "type" : "word",
      "position" : 2
    },
    {
      "token" : "もも",
      "start_offset" : 7,
      "end_offset" : 9,
      "type" : "word",
      "position" : 4
    }
  ]
}
```
