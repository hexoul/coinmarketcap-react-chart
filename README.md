# Coinmarketcap Graph
Graph rendering from [go-coinmarketcap](https://github.com/hexoul/go-coinmarketcap)'s statistics log

## Preview

```bash
$ npm install
$ npm start
```

## Log format
Log will be automatically piled by [go-coinmarketcap](https://github.com/hexoul/go-coinmarketcap). For detail, please refer the repo.

Example is here
```
// Crypto quote log
{"level":"info","msg":"GatherCryptoQuote","quote":{"USD":{"price":6472.68065997,"volume_24h":3011434906.57884,"volume_24h_base":0,"volume_24h_quote":0,"percent_change_1h":0.74449,"percent_change_24h":1.67459,"percent_change_7d":-0.116121,"market_cap":112366461197.31313,"last_updated":"2018-11-05T02:18:20.000Z"}},"symbol":"BTC","time":"05-11-2018 11:29:09"}
// Token metric log
{"holders":"299386","level":"info","msg":"GatherTokenMetric","symbol":"BNB","time":"07-11-2018 15:00:59","txns":"438859"}
// Kucoin account balance log
{"balance":0.1,"freeze":0,"level":"info","msg":"GatherKucoinBalance","symbol":"BTC","time":"07-11-2018 15:34:16"}
// Coinsuper account balance log
{"balance":0.2,"freeze":0,"level":"info","msg":"GatherCoinsuperBalance","symbol":"BTC","time":"07-11-2018 15:34:16"}
```

## What more

- [go-coinmarketcap](https://github.com/hexoul/go-coinmarketcap)
- [antd](https://github.com/ant-design/ant-design/)
- [babel-plugin-import](http://github.com/ant-design/babel-plugin-import/)
- [create-react-app](https://github.com/facebookincubator/create-react-app)
- [react-app-rewired](https://github.com/timarney/react-app-rewired)
- [less-loader](https://github.com/webpack/less-loader)
