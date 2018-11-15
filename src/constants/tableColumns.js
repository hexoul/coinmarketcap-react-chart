let columns = {};

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
    width: '30%',
  },
  {
    title: 'Transactions',
    dataIndex: 'txns',
    key: 'txns',
    width: '30%',
  },
  {
    title: 'Transfers',
    dataIndex: 'transfers',
    key: 'transfers',
    width: '30%',
  }
];

columns.MarketData = [
  {
    title: 'Category',
    dataIndex: 'category',
    key: 'category',
    width: '10%',
  },
  {
    title: 'USD Price',
    dataIndex: 'usdPrice',
    key: 'usdPrice',
    width: '20%',
  },
  {
    title: 'ETH Price',
    dataIndex: 'ethPrice',
    key: 'ethPrice',
    width: '20%',
  },
  {
    title: 'BTC Price',
    dataIndex: 'btcPrice',
    key: 'btcPrice',
    width: '20%',
  },
  {
    title: 'Volume(USD)',
    dataIndex: 'usdVolume',
    key: 'usdVolume',
    width: '30%',
  }
];

columns.Ohlcv = [
  {
    title: 'Date',
    dataIndex: 'date',
    key: 'date',
    width: '5%',
  },
  {
    title: 'Unit',
    dataIndex: 'unit',
    key: 'unit',
    width: '5%',
  },
  {
    title: 'Open',
    dataIndex: 'open',
    key: 'open',
    width: '10%',
  },
  {
    title: 'High',
    dataIndex: 'high',
    key: 'high',
    width: '10%',
  },
  {
    title: 'Low',
    dataIndex: 'low',
    key: 'low',
    width: '10%',
  },
  {
    title: 'Close',
    dataIndex: 'close',
    key: 'close',
    width: '10%',
  },
  {
    title: 'Volume',
    dataIndex: 'volume',
    key: 'volume',
    width: '15%',
  },
  {
    title: 'Coinsuper',
    dataIndex: 'coinsuperVolume',
    key: 'coinsuperVolume',
    width: '15%',
  },
  {
    title: 'Kucoin',
    dataIndex: 'kucoinVolume',
    key: 'kucoinVolume',
    width: '15%',
  },
  {
    title: 'Cap',
    dataIndex: 'marketCap',
    key: 'marketCap',
    width: '5%',
  }
];

export {columns}