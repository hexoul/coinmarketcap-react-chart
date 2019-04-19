let columns = {}

// var strSorter = (a, b) => {
//   if (a > b) return 1;
//   else if (a < b) return -1;
//   return 0;
// }

columns.TokenMetric = [
  {
    title: 'Holders',
    dataIndex: 'holders',
    key: 'holders',
    width: '30%'
  },
  {
    title: 'Transactions',
    dataIndex: 'txns',
    key: 'txns',
    width: '30%'
  },
  {
    title: 'Transfers',
    dataIndex: 'transfers',
    key: 'transfers',
    width: '30%'
  }
]

columns.MarketData = [
  {
    title: 'Category',
    dataIndex: 'category',
    key: 'category',
    width: '10%'
  },
  {
    title: 'USD Price',
    dataIndex: 'usdPrice',
    key: 'usdPrice',
    width: '10%'
  },
  {
    title: 'ETH Price',
    dataIndex: 'ethPrice',
    key: 'ethPrice',
    width: '10%'
  },
  {
    title: 'BTC Price',
    dataIndex: 'btcPrice',
    key: 'btcPrice',
    width: '10%'
  },
  {
    title: 'Volume(USD)',
    dataIndex: 'usdVolume',
    key: 'usdVolume',
    width: '20%'
  },
  {
    title: 'Volume(ETH)',
    dataIndex: 'ethVolume',
    key: 'ethVolume',
    width: '20%'
  }
]

columns.Ohlcv = [
  {
    title: 'Date',
    dataIndex: 'date',
    key: 'date',
    width: '5%'
  },
  {
    title: 'Unit',
    dataIndex: 'unit',
    key: 'unit',
    width: '5%'
  },
  {
    title: 'Open',
    dataIndex: 'open',
    key: 'open',
    width: '7%'
  },
  {
    title: 'High',
    dataIndex: 'high',
    key: 'high',
    width: '7%'
  },
  {
    title: 'Low',
    dataIndex: 'low',
    key: 'low',
    width: '7%'
  },
  {
    title: 'Close',
    dataIndex: 'close',
    key: 'close',
    width: '7%'
  },
  {
    title: 'Volume',
    dataIndex: 'volume',
    key: 'volume',
    width: '10%'
  },
  {
    title: 'Bittrex',
    dataIndex: 'bittrexVolume',
    key: 'bittrexVolume',
    width: '10%'
  },
  {
    title: 'Upbit',
    dataIndex: 'upbitVolume',
    key: 'upbitVolume',
    width: '10%'
  },
  {
    title: 'Kucoin',
    dataIndex: 'kucoinVolume',
    key: 'kucoinVolume',
    width: '10%'
  },
  {
    title: 'Abcc',
    dataIndex: 'abccVolume',
    key: 'abccVolume',
    width: '10%'
  },
  {
    title: 'Coinsuper',
    dataIndex: 'coinsuperVolume',
    key: 'coinsuperVolume',
    width: '10%'
  },
  {
    title: 'Cap',
    dataIndex: 'marketCap',
    key: 'marketCap',
    width: '15%'
  }
]

columns.Balance = [
  {
    title: 'Exchange',
    dataIndex: 'exchange',
    key: 'exchange',
    width: '5%'
  },
  {
    title: 'META',
    dataIndex: 'meta',
    key: 'meta',
    width: '15%'
  },
  {
    title: 'ETH',
    dataIndex: 'eth',
    key: 'eth',
    width: '15%'
  },
  {
    title: 'BTC',
    dataIndex: 'btc',
    key: 'btc',
    width: '15%'
  },
  {
    title: 'Volume(META)',
    dataIndex: 'amount',
    key: 'amount',
    width: '30%'
  }
]

export { columns }
